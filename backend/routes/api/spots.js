const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');
const { sequelize } = require('../../db/models')
const { check } = require('express-validator');


// Get spots of currentUser
router.get('/currentUser', async (req, res) => {
    try {
        const { user } = req

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const spots = await Spot.findAll({
            where: {
                ownerId: user.id
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
                [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
                [sequelize.col('SpotImages.url'), 'preview']
            ],
            include: [
                {
                    model: Review,
                    attributes: []
                },
                {
                    model: SpotImage,
                    attributes: [],
                    where: {
                        preview: true
                    },
                    required: false
                }
            ],
            group: ['Spot.id']
        })
        res.json({ Spots: spots })
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
                [sequelize.fn('COUNT', sequelize.col('Reviews.stars')), 'numReviews'],
                [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
            ],
            include: [
                {
                    model: Review,
                    attributes: []
                },
                {
                    model: SpotImage,
                    attributes: ['id', 'url', 'preview']
                },
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName'],
                }
            ],
            group: ['Spot.id']
        })
        if (!spot) {
            return res.status(404).json({
                message: 'Spot couldn\'t be found'
            })
        }

        res.json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Edit a spot
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if (address === '' || city === '' || state === '' || country === '' || lat === '' || typeof lat !== 'number' || lng === '' || typeof lng !== 'number' || name === '' || description === '' || !price) {
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

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if (spot.ownerId !== req.user.id) {
            throw new Error('Not your spot.');
        }

        if (!spot) {
            let err = Error()
            err = {
                message: 'Spot couldn\'t be found'
            }
            return res.status(404).json(err)
        } else {
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
        }
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
            throw new Error('Not your spot.');
        }
        await spot.destroy()
        res.json({ message: 'Successfully deleted.' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Returns all spots
router.get('/', requireAuth, async (req, res) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    page = parseInt(page)
    size = parseInt(size)

    if(!page) page = 1;
    if(!size) size = 20;


    whereClause = {}
    if(minLat) whereClause.minLat = minLat
    if(maxLat) whereClause.maxLat = maxLat
    if(minLng) whereClause.minLng = minLng
    if(maxLng) whereClause.maxLng = maxLng
    if(minPrice) whereClause.minPrice = minPrice
    if(maxPrice) whereClause.maxPrice = maxPrice

    const pagination = {}
    if(page >= 1 && size >= 1){
        pagination.limit = size;
        pagination.offset = size * (page - 1)
    }

    const spots = await Spot.findAll({
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
            [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgRating'],
            [sequelize.col('SpotImages.url'), 'preview']
        ],
        include: [
            {
                model: Review,
                attributes: []
            },
            {
                model: SpotImage,
                attributes: []
            }
        ],
        group: ['Spot.id'],
        // ...pagination,
        where: whereClause
    })
    res.json({
        Spots: spots,
        page: page,
        size: size
    })
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
