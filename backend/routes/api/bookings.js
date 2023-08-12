const router = require('express').Router();
const { Booking } = require('../../db/models')
const { Spot } = require('../../db/models')

// Get currentUser bookings
//CHECK URL
router.get('/currentUser/bookings', async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const bookings = await Booking.findAll({
            where: {
                userId: user.id
            }
        })

        res.json(bookings)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//get all bookings based on spot id
//CHECK URL
router.get('/spots/:id/bookings', async (req, res) => {
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
            throw new Error('Spot not found.')
        }

        const bookings = await Booking.findAll({
            where: {
                spotId: spot.id
            }
        })

        res.json(bookings)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Make a booking based off spotId
router.post('/spots/:id/bookings', async(req,res)=> {
    try {
        const { id } = req.params
        const { startDate, endDate } = req.body

        if(!id || !startDate || !endDate ){
            throw new Error('Missing information to create a booking.')
        }

        const spot = await Spot.findOne({
            where: {
                id: id
            }
        })

        if (!spot) {
            throw new Error('Spot not found.')
        }

        user = req.user.id;

        const newBooking = await Booking.create({ startDate, endDate, spotId: spot.id, userId: user})
        res.json({
            booking: newBooking
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Edit a booking by id
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { startDate, endDate } = req.body

        if(!id || !startDate || !endDate ){
            throw new Error('Missing information to create a booking.')
        }

        const findBooking = await Booking.findOne({
            where: {
                id: id
            }
        })

        if(!findBooking){
            throw new Error('Booking was not found.')
        }

        if(startDate) findBooking.startDate = startDate
        if(endDate) findBooking.endDate = endDate

        await findBooking.save()
        res.json(findBooking)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete a booking
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid booking id.')
        }

        const findBooking = await Booking.findOne({
            where: {
                id: id
            }
        })

        if(!findBooking){
            throw new Error('Booking was not found.')
        }
        else {
            await findBooking.destroy();
            res.json({ message: 'Booking deleted.' })
        }
        res.json(findBooking)

    } catch (error) {

    }
})


module.exports = router;