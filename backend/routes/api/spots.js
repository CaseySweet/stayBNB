const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')

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
            }
        })
        res.json(spots)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
//delete image for a spot
router.delete('/:spotId/images/:imagesId', async( req, res)=> {
    try {
        const { spotId, imagesId } = req.params;

        const spot = await Spot.findOne({
            where: {
                id: spotId
            }
        })
        const spotImage = await SpotImage.findOne({
            where: {
                id: imagesId
            }
        })
        if (!spotImage || !spot) {
            throw new Error("Spot Image couldn't be found.")
        }
        await spotImage.destroy()
        res.json({message: 'Successfully deleted'})

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})
//post image to spot
router.post('/:id/images', async (req, res) => {
    try {
        const { id } = req.params;
        const { url, preview } = req.body

        if(!url || !preview){
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
            throw new Error('Spot was not found.')
        }
        const createImg = await SpotImage.create({ id: spot.id, url, preview })
        return res.json(createImg)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Details of a post by id
router.get('/:id', async (req, res) => {
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
            throw new Error('Spot was not found.')
        }

        res.json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Edit a spot
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if (address === '' || city === '' || state === '' || country === '' || lat === '' || lng === '' || name === '' || description === '' || price === '') {
            throw new Error(res.status(400).json({
                message: 'Bad request',
                error: 'Missing information or information is invalid.'
                // error: {
                //     address: "Street address is required",
                //     city: "City is required",
                //     state: "State is required",
                //     country: "Country is required",
                //     lat: "Latitude is not valid",
                //     lng: "Longitude is not valid",
                //     name: "Name must be less than 50 characters",
                //     description: "Description is required",
                //     price: "Price per day is required"
                // }
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

        if (!spot) {
            throw new Error('Spot was not found.')
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
router.delete('/:id', async (req, res) => {
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
            throw new Error('Spot was not found.')
        } else {
            await spot.destroy()
            res.json({ message: 'Spot deleted.' })
        }
        res.json(spot)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Returns all spots
router.get('/', async (req, res) => {
    const spots = await Spot.findAll();
    res.json(spots)
})

// Post a spot
router.post('/', async (req, res) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        if (address === '' || city === '' || state === '' || country === '' || lat === '' || lng === '' || name === '' || description === '' || price === '') {
            throw new Error(res.status(400).json({
                error: 'Missing information to create a spot.'
            }))
        }
        const user = req.user.id

        const spot = await Spot.create({ address, city, state, country, lat, lng, name, description, price, ownerId: user });
        return res.json({
            spot: spot
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;
