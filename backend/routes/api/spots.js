const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { sequelize } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { Booking } = require('../../db/models')
const { Op } = require('sequelize')

// Get spots of currentUser
router.get('/currentUser', async (req, res) => {
    try {
        const { user } = req

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const spots = await Spot.findAll({
            where: {
                ownerId: req.user.id
            },
            attributes: [
                'id',
                'ownerId',
                'address',
                'city',
                'state',
                'country',
                'lat',
                'lng',
                'name',
                'description',
                'price',
                'createdAt',
                'updatedAt',
            ],
        })

        let rslt = []

        for (let spot1 of spots) {
            let spot = spot1.toJSON()
            const spotImages = await SpotImage.findAll({
                where: {
                    spotId: spot.id,
                    preview: true
                },
                attributes: ['url']
            })
            if(spotImages){
                spot.previewImage = spotImages[0].url
            }
            if(!spotImages) spot.previewImage = null

            const reviews1 = await Review.findAll({
                where: {
                    spotId: spot.id
                },
                attributes: ['stars']
            })

            if (reviews1.length) {
                let sum = 0

                for (let review of reviews1) {
                    let reviewObj = review.toJSON()
                    sum += reviewObj.stars
                }
                let avg = Number((sum / reviews1.length).toFixed(2))

                spot.avgRating = avg
                rslt.push(spot)
            } else {
                spot.avgRating = null
                rslt.push(spot)
            }
        }
        res.json({ Spots: rslt })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//delete image for a spot
router.delete('/:spotId/images/:imagesId', requireAuth, async (req, res) => {
    try {
        const { spotId, imagesId } = req.params;

        const spotImage = await SpotImage.findOne({
            where: {
                id: imagesId,
                spotId: spotId
            },
            include: [{
                model: Spot,
                attributes: ['ownerId']
            }]
        });

        if (!spotImage) {
            let err = Error()
            err = {
                message: 'Spot Image couldn\'t be found'
            }
            return res.status(404).json(err)
        }


        if (spotImage.Spot.ownerId !== req.user.id) {
            throw new Error('Not your spot.');
        }

        await spotImage.destroy()
        res.json({ message: 'Successfully deleted' })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//get all bookings based on spot id
//CHECK URL
router.get('/:id/bookings', requireAuth, async (req, res) => {
    try {
        const { id } = req.params

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        });

        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        const bookingsOwner = await Booking.findAll({
            where: {
                spotId: spot.id
            },
            include: [
                {
                    model: User,
                    attributes: [
                        'id', 'firstName', 'lastName'
                    ]
                }
            ]
        })
        const bookingsNotOwner = await Booking.findAll({
            where: {
                spotId: spot.id
            },
            attributes: {
                exclude: [
                    'id', 'userId', 'createdAt', 'updatedAt'
                ]
            }
        })
        if(!bookingsNotOwner || !bookingsOwner){
            let err = Error()
            err = {
                Bookings: []
            }
            return res.status(200).json(err)
        }

        if (spot.ownerId !== req.user.id) {
            return res.status(200).json({
                Bookings: bookingsNotOwner
            })
        }


        res.json({Bookings: bookingsOwner})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Make a booking based off spotId
router.post('/:id/bookings', requireAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { startDate, endDate } = req.body

        if (!id || !startDate || !endDate) {
            throw new Error('Missing information to create a booking.')
        }

        if (endDate < startDate) {
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    endDate: 'endDate cannot be on or before startDate'
                }
            }
            return res.status(400).json(err)
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (spot.ownerId === req.user.id) {
            throw new Error('You can\'t book your own place.');
        }

        const existingBookings = await Booking.findAll({
            where: {
                spotId: spot.id,
                [Op.or]: [
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                ]
            }
        })

        if (existingBookings.length > 0) {
            let err = Error()
            err = {
                message: 'Sorry, this spot is already booked for the specified dates',
                errors: {
                    startDate: 'Start date conflicts with an existing booking',
                    endDate: 'End date conflicts with an existing booking'
                }
            }
            return res.status(403).json(err)
        }

        let user = req.user.id;
        const newBooking = await Booking.create({ spotId: spot.id, userId: user, startDate, endDate, })
        res.json(newBooking)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Make review for spot off spots id
//CHECK URL CHANGE IT
router.post('/:id/reviews', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { review, stars } = req.body;

        if (!id) {
            throw new Error('Missing id to create a review.')
        }

        if (!review || stars <= 0 || stars > 5) {
            let err = Error()
            err = {
                message: "Bad Request",
                errors: {
                    review: "Review text is required",
                    stars: "Stars must be an integer from 1 to 5"
                }
            }
            return res.status(400).json(err)
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })

        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }
        if (spot.ownerId === req.user.id) {
            throw new Error('You can\'t review your own place.');
        }

        const existingReview = await Review.findOne({
            where: {
                userId: req.user.id,
                spotId: spot.id
            }
        })

        if (existingReview) {
            let err = Error()
            err = {
                message: "User already has a review for this spot"
            }
            return res.status(500).json(err)
        }

        const newReview = await Review.create({ spotId: spot.id, userId: req.user.id, review, stars })
        res.json(newReview)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get all reviews by spot id
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        });

        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        const reviews = await Review.findAll({
            where: {
                spotId: spot.id
            },
            attributes: [
                'id',
                'userId',
                'spotId',
                'review',
                'stars',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        })
        res.json({ Reviews: reviews })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//post image to spot
router.post('/:id/images', async (req, res) => {
    try {
        const { id } = req.params;
        const { url, preview } = req.body

        if (!url || !preview) {
            throw new Error('Missing information to post image.')
        }

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }
        if (spot.ownerId !== req.user.id) {
            throw new Error('Not your spot.');
        }

        const createImg = await SpotImage.create({ spotId: spot.id, url, preview })
        const { id: imageId } = createImg


        return res.json({
            id: imageId,
            url: url,
            preview: preview
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Details of a spot by id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            },
            attributes: [
                'id',
                'ownerId',
                'address',
                'city',
                'state',
                'country',
                'lat',
                'lng',
                'name',
                'description',
                'price',
                'createdAt',
                'updatedAt',
            ],
        })

        if (!spot) {
            return res.status(404).json({
                message: 'Spot couldn\'t be found'
            })
        }

        let spotJson = spot.toJSON()
        const spotImages = await SpotImage.findAll({
            where: {
                spotId: spot.id,
            },
            attributes: ['id', 'url', 'preview']
        })
        if(spotImages){
            spotJson.SpotImages = spotImages
        }
        if(!spotImages) spotJson.SpotImages = null
        const owner = await User.findOne({
            where: {
                id: spot.ownerId
            },
            attributes: ['id', 'firstName', 'lastName']
        })
        if(owner){
            spotJson.Owner = owner
        }
        const reviews1 = await Review.findAll({
            where: {
                spotId: spot.id
            },
            attributes: ['stars']
        })

        if (reviews1.length) {
            let sum = 0

            for (let review of reviews1) {
                let reviewObj = review.toJSON()
                sum += reviewObj.stars
            }
            let avg = Number((sum / reviews1.length).toFixed(2))
            spotJson.numReviews = reviews1.length
            spotJson.avgStarRating = avg
        } else {
            spotJson.avgStarRating = null
            spotJson.numReviews = null
        }

        res.json(spotJson)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Edit a spot
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if(!address){
            return (res.status(400).json({
                message: "Bad Request",
                errors: {
                    address: "Street address is required"
                }
            }))
        }
        if(!city){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    city: 'City is required'
                }
            }
            return res.status(400).json(err)
        }
        if(!state){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    State: 'State is required'
                }
            }
            return res.status(400).json(err)
        }
        if(!country){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Country: 'Country is required'
                }
            }
            return res.status(400).json(err)
        }
        if(!lat || typeof lat !== 'number'){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Latitude: 'Latitude is not valid'
                }
            }
            return res.status(400).json(err)
        }
        if(lng === '' || typeof lng !== 'number'){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Longitude: 'Longitude is not valid'
                }
            }
            return res.status(400).json(err)
        }
        if(!name){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Name: 'Name must be less than 50 characters'
                }
            }
            return res.status(400).json(err)
        }
        if(!description){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Description: 'Description is required'
                }
            }
            return res.status(400).json(err)
        }
        if(!price || typeof price !== 'number'){
            let err = Error()
            err = {
                message: 'Bad Request',
                errors: {
                    Price: 'Price per day is required'
                }
            }
            return res.status(400).json(err)
        }

        // if (address === '' || city === '' || state === '' || country === '' || lat === '' || typeof lat !== 'number' || lng === '' || typeof lng !== 'number' || name === '' || description === '' || !price) {
        //     return (res.status(400).json({
        //         message: "Bad Request",
        //         errors: {
        //             address: "Street address is required",
        //             city: "City is required",
        //             state: "State is required",
        //             country: "Country is required",
        //             lat: "Latitude is not valid",
        //             lng: "Longitude is not valid",
        //             name: "Name must be less than 50 characters",
        //             description: "Description is required",
        //             price: "Price per day is required"
        //         }
        //     }))
        // }

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (spot?.ownerId !== req.user.id) {
            throw new Error('Not your spot.');
        }

        if (address) spot.address = address;
        if (city) spot.city = city;
        if (state) spot.state = state;
        if (country) spot.country = country;
        if (lat) spot.lat = lat;
        if (lng) spot.lng = lng;
        if (name) spot.name = name;
        if (description) spot.description = description;
        if (price) spot.price = price;

        await spot.save();

        res.json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete a spot
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        }
        if (spot.ownerId !== req.user.id) {
            throw new Error('Not your spot.')
        }

        await spot.destroy()
        res.json({ message: 'Successfully deleted.' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Returns all spots
router.get('/', requireAuth, async (req, res) => {
    // let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    // page = parseInt(page)
    // size = parseInt(size)

    // if (!page) page = 1;
    // if (!size) size = 20;

    // whereClause = {}
    // if (minLat) whereClause.minLat = minLat
    // if (maxLat) whereClause.maxLat = maxLat
    // if (minLng) whereClause.minLng = minLng
    // if (maxLng) whereClause.maxLng = maxLng
    // if (minPrice) whereClause.minPrice = minPrice
    // if (maxPrice) whereClause.maxPrice = maxPrice

    // const pagination = {}
    // if (page >= 1 && size >= 1) {
    //     pagination.limit = size;
    //     pagination.offset = size * (page - 1)
    // }

    const spots = await Spot.findAll({
        where: {

        },
        attributes: [
            'id',
            'ownerId',
            'address',
            'city',
            'state',
            'country',
            'lat',
            'lng',
            'name',
            'description',
            'price',
            'createdAt',
            'updatedAt',
        ],
        ...pagination
    })

    let rslt = []
    // console.log(rslt)

    for (let spot1 of spots) {
        let spot = spot1.toJSON()
        const spotImages = await SpotImage.findAll({
            where: {
                spotId: spot.id,
                preview: true
            },
            attributes: ['url']
        })
        if(spotImages){
            spot.previewImage = spotImages[0].url
        }
        if(!spotImages) spot.previewImage = null

        const reviews1 = await Review.findAll({
            where: {
                spotId: spot.id
            },
            attributes: ['stars']
        })

        if (reviews1.length) {
            let sum = 0

            for (let review of reviews1) {
                let reviewObj = review.toJSON()
                sum += reviewObj.stars
            }
            let avg = Number((sum / reviews1.length).toFixed(2))

            spot.avgRating = avg
            rslt.push(spot)
        } else {
            spot.avgRating = null
            rslt.push(spot)
        }
    }
    res.json({ Spots: rslt , page: page, size: size})
})

// Post a spot
router.post('/', requireAuth, async (req, res) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if (address === '' || city === '' || state === '' || country === '' || lat === '' || typeof lat !== 'number' || lng === '' || typeof lng !== 'number' || name === '' || description === '' || price === '') {
            console.log(lat)
            return (res.status(400).json({
                message: "Bad Request",
                errors: {
                    address: "Street address is required",
                    city: "City is required",
                    state: "State is required",
                    country: "Country is required",
                    lat: "Latitude is not valid",
                    lng: "Longitude is not valid",
                    name: "Name must be less than 50 characters",
                    description: "Description is required",
                    price: "Price per day is required"
                }
            }))
        }
        const user = req.user.id

        const spot = await Spot.create({ ownerId: user, address, city, state, country, lat, lng, name, description, price });
        return res.status(201).json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;
