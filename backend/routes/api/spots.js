const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');

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

// Details of a post by id
router.get('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        if(id === undefined || id === null || id === ''){
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if(!spot){
            throw new Error('Spot was not found.')
        }
        res.json(spot)
    }catch(error){
        res.status(500).json({ error: error.message })
    }
})

// Edit a spot
router.put('/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        if(id === undefined || id === null || id === ''){
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if(!spot){
            throw new Error('Spot was not found.')
        }else{
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
    }catch(error){
        res.status(500).json({ error: error.message })
    }
})
// Delete a spot
router.delete('/:id', async (req, res) =>{
    try{
        const { id } = req.params;
        if(id === undefined || id === null || id === ''){
            throw new Error('Not a valid spot id.')
        }
        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })
        if(!spot){
            throw new Error('Spot was not found.')
        }else{
            await spot.destroy()
            res.json({ message: 'Spot deleted.'})
        }
        res.json(spot)
    }catch(error){
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
            throw new Error('Missing information to create a spot.')
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
