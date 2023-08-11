const router = require('express').Router();
const { Booking } = require('../../db/models')

// Get currentUser bookings
router.get('/currentUser/bookings', async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const bookings = await Booking.findAll({
            // where: {
            //     userId: user.id
            // }
        })

        res.json(bookings)

    } catch (error) {
        res.status(500).json({ error: error.message })

    }
})














module.exports = router;
