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
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    const user = req.user.id
    const spot = await Spot.create({ address, city, state, country, lat, lng, name, description, price, ownerId: user });
    return res.json({
        spot: spot
    })
})



// ----- THIS IS FOR GET SPOTS OF CURRENT USER -----
router.get('/currentUser', async (req, res) => {
    const { user } = req

    const spots = await Spot.findAll({
        where: {
            ownerId: user.id
        }
    })
    res.json(spots)
})

module.exports = router;
