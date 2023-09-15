const router = require('express').Router();
const { Booking } = require('../../db/models')
const { Spot } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize')
const { SpotImage } = require('../../db/models')

// Get currentUser bookings
//CHECK URL
router.get('/currentUser/bookings', requireAuth, async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const bookings = await Booking.findAll({
            where: {
                userId: user.id
            },
            include: [
                {
                    model: Spot,
                    attributes: {
                        exclude: [
                            'description', 'createdAt', 'updatedAt'
                        ]
                    }
                }
            ],
        })

        const bookingData = []
        for (let i = 0; i < bookings.length; i++) {
            let booking = bookings[i]
            let bookingObj = booking.toJSON()
            let spot = bookingObj.Spot
            const previewImage = await SpotImage.findOne({
                where: {
                    preview: true,
                    spotId: spot.id
                }
            })
            if (previewImage) {
                spot.previewImage = previewImage.url
            } else {
                spot.previewImage = null
            }
            bookingData.push(bookingObj)
        }
        res.json({
            Bookings: bookingData
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Edit a booking by id
router.put('/bookings/:id', requireAuth, async (req, res) => {
    try {
        const { user } = req
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

        const findBooking = await Booking.findOne({
            where: {
                id: id,
            }
        })

        const currentDate = new Date();
        if (new Date(findBooking.startDate) < currentDate) {
            let err = Error()
            err = {
                message: 'Past bookings can\'t be modified'
            }
            return res.status(403).json(err)
        }

        if (!findBooking) {
            let err = Error()
            err = {
                message: 'Booking couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (findBooking.userId !== req.user.id) {
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }
        const existingBookings = await Booking.findAll({
            where: {
                spotId: findBooking.spotId,
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

        if (startDate) findBooking.startDate = startDate
        if (endDate) findBooking.endDate = endDate

        await findBooking.save()
        res.json(findBooking)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete a booking
router.delete('/bookings/:id', requireAuth, async (req, res) => {
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

        if (!findBooking) {
            let err = Error()
            err = {
                message: 'Booking couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        const currentDate = new Date();
        if (new Date(findBooking.startDate) < currentDate) {
            let err = Error()
            err = {
                message: 'Bookings that have been started can\'t be deleted'
            }
            return res.status(403).json(err)
        }

        const spotOwner = await Spot.findOne({
            where: {
                id: findBooking.spotId
            }
        })

        if (findBooking.userId === req.user.id || spotOwner.ownerId === req.user.id) {
            await findBooking.destroy();
            res.json({ message: 'Successfully deleted' })
        }

        else {
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router;
