const router = require('express').Router();
const { Spot } = require('../../db/models')
const { User } = require('../../db/models');

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



// ----- THIS IS FOR GET SPOTS OF CURRENT USER -----
router.get('/currentUser', async (req, res) => {
    try {
        const { user } = req

        if(user === null){
            throw new Error('There is no user signed in.')
        }

        const spots = await Spot.findAll({
            where: {
                ownerId: user.id
            }
        })
        res.json(spots)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = router;
