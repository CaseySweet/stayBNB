const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { ReviewImage } = require('../../db/models')
const { Booking } = require('../../db/models')
const { Op } = require('sequelize')

// Get spots of currentUser
router.get('/currentUser', requireAuth, async (req, res) => {
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
            if (spotImages.length > 0) {
                spot.previewImage = spotImages[0].url
            }
            else {
                spot.previewImage = null
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        await spotImage.destroy()
        res.json({ message: 'Successfully deleted' })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//get all bookings based on spot id
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
        if (!bookingsNotOwner || !bookingsOwner) {
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

        res.json({ Bookings: bookingsOwner })
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        const existingBookings = await Booking.findAll({
            where: {
                spotId: spot.id,
                [Op.or]: [
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        },
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        startDate: {
                            [Op.lte]: endDate
                        },
                        endDate: {
                            [Op.gte]: startDate
                        }
                    },
                    {
                        startDate: {
                            [Op.lte]: endDate
                        },
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        },
                        endDate: {
                            [Op.gte]: startDate
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
router.post('/:id/reviews', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { review, stars } = req.body;

        if (!id) {
            throw new Error('Missing id to create a review.')
        }

        let errors = Error()
        errors = {}
        if (!review) {
            errors.review = 'Review text is required'
        }
        if (!stars || stars <= 0 || stars > 5 || typeof stars !== 'number') {
            errors.stars = 'Stars must be an integer from 1 to 5'
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors
            })
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
router.get('/:id/reviews', requireAuth, async (req, res) => {
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
router.post('/:id/images', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { url, preview } = req.body

        if (!url || preview === undefined) {
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        const existingImages = await SpotImage.findAll({
            where: {
                spotId: spot.id
            }
        })

        if(preview === false){
            const createImg = await SpotImage.create({spotId: spot.id, url, preview})
            const { id: imageId } = createImg

            return res.json({
                id: imageId,
                url: url,
                preview: preview
            })
        }
        else {
            const previewImage = existingImages.find(img => img.preview === true)
            if(previewImage){
                throw new Error('Spot already has preview image')
            }
            else {
                const createImg = await SpotImage.create({spotId: spot.id, url, preview})
                const { id: imageId } = createImg

                return res.json({
                    id: imageId,
                    url: url,
                    preview: preview
                })
            }
        }

        // const existingImage = await SpotImage.findOne({
        //     where: {
        //         spotId: spot.id,
        //         preview: true
        //     }
        // })
        // // console.log(existingImage.preview)
        // if (existingImage) {
        //     throw new Error('Spot already has a preview image')
        // }

        // const createImg = await SpotImage.create({ spotId: spot.id, url, preview })
        // const { id: imageId } = createImg

        // return res.json({
        //     id: imageId,
        //     url: url,
        //     preview: preview
        // })

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
                // preview: true
            },
            attributes: ['id', 'url', 'preview']
        })
        if (spotImages) {
            spotJson.SpotImages = spotImages
        }
        if (!spotImages) spotJson.SpotImages = null
        const owner = await User.findOne({
            where: {
                id: spot.ownerId
            },
            attributes: ['id', 'firstName', 'lastName']
        })
        if (owner) {
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        let errors = Error()
        errors = {}
        if (!address) {
            errors.address = 'Street address is required'
        }
        if (!city) {
            errors.city = 'City is required'
        }
        if (!state) {
            errors.state = 'State is required'
        }
        if (!country) {
            errors.country = 'Country is required'
        }
        if (!lat || lat > 90 || lat < -90 || typeof lat !== 'number') {
            errors.lat = 'Latitude is not valid'
        }
        if (!lng || lng < -180 || lng > 180 || typeof lng !== 'number') {
            errors.lng = 'Longitude is not valid'
        }
        if (!name || name.length > 50) {
            errors.name = 'Name must be less than 50 characters'
        }
        if (!description) {
            errors.description = 'Description is required'
        }
        if (!price || price < 0) {
            errors.price = 'Price per day is required'
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors
            })
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        const spotImgs = await SpotImage.findAll({
            where: {
                spotId: spot.id
            }
        })

        const bookings = await Booking.findAll({
            where: {
                spotId: spot.id
            }
        })

        const reviews = await Review.findAll({
            where: {
                spotId: spot.id
            }
        })

        for (const spotImg in spotImgs) {
            await spotImgs[spotImg].destroy()
        }

        for (const booking in bookings) {
            await bookings[booking].destroy()
        }

        for (const review in reviews) {
            const reviewImgs = await ReviewImage.findAll({
                where: {
                    reviewId: reviews[review].id
                }
            })

            for (const reviewImg in reviewImgs) {
                await reviewImgs[reviewImg].destroy()
            }
            await reviews[review].destroy()
        }

        await spot.destroy()
        res.json({ message: 'Successfully deleted.' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Returns all spots
router.get('/', async (req, res) => {
    try {

        let errors = Error()
        errors = {}
        let filter = {}

        let { minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query
        const page = req.query.page === undefined ? 1 : parseInt(req.query.page)
        const size = req.query.size === undefined ? 20 : parseInt(req.query.size)
        if (page < 1) {
            errors.page = "Page must be greater than or equal to 1"
        }
        if (size < 1) {
            errors.size = "Size must be greater than or equal to 1"
        }

        // Lat
        if (minLat) {
            filter.lat = { [Op.gte]: minLat }
        }
        if (maxLat) {
            if (filter.lat) {
                filter.lat = { [Op.between]: [minLat, maxLat] }
            } else {
                filter.lat = { [Op.lte]: maxLat }
            }
        }
        if (maxLat > 90) {
            errors.maxLat = "Maximum latitude is invalid"
        }
        if (minLat < -90) {
            errors.minLat = "Minimum latitude is invalid"
        }
        // Lng
        if (minLng) {
            filter.lng = { [Op.gte]: minLng }
        }
        if (maxLng) {
            if (filter.lng) {
                filter.lng = { [Op.between]: [minLng, maxLng] }
            } else {
                filter.lng = { [Op.lte]: maxLng }
            }
        }
        if (minLng < -180) {
            errors.minLng = "Minimum longitude is invalid"
        }
        if (maxLng > 180) {
            errors.maxLng = "Maximum longitude is invalid"
        }
        // Price
        if (minPrice) {
            filter.price = { [Op.gte]: minPrice }
        }
        if (maxPrice) {
            if (filter.price) {
                filter.price = { [Op.between]: [minPrice, maxPrice] }
            }
            else {
                filter.price = { [Op.lte]: maxPrice }
            }
        }
        if (minPrice < 0) {
            errors.minPrice = "Minimum price must be greater than or equal to 0"
        }
        if (maxPrice < 0) {
            errors.maxPrice = "Maximum price must be greater than or equal to 0"
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors
            })
        }

        const spots = await Spot.findAll({
            where: filter,
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
            offset: size * (page - 1),
            limit: size,
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
            if (spotImages.length > 0) {
                spot.previewImage = spotImages[0].url
            }
            else {
                spot.previewImage = null
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

                spot.avgRating = avg
                rslt.push(spot)
            } else {
                spot.avgRating = null
                rslt.push(spot)
            }
        }
        res.json({ Spots: rslt, page: page, size: size })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

// Post a spot
router.post('/', requireAuth, async (req, res) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        let errors = Error()
        errors = {}
        if (!address) {
            errors.address = 'Street address is required'
        }
        if (!city) {
            errors.city = 'City is required'
        }
        if (!state) {
            errors.state = 'State is required'
        }
        if (!country) {
            errors.country = 'Country is required'
        }
        if (!lat || lat > 90 || lat < -90 || typeof lat !== 'number') {
            errors.lat = 'Latitude is not valid'
        }
        if (!lng || lng < -180 || lng > 180 || typeof lng !== 'number') {
            errors.lng = 'Longitude is not valid'
        }
        if (!name || name.length > 50) {
            errors.name = 'Name must be less than 50 characters'
        }
        if (!description) {
            errors.description = 'Description is required'
        }
        if (!price || price < 0) {
            errors.price = 'Price per day is required'
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors
            })
        }

        const user = req.user.id

        const spot = await Spot.create({ ownerId: user, address, city, state, country, lat, lng, name, description, price });
        return res.status(201).json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router;
