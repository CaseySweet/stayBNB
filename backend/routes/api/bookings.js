const router = require('express').Router();
const { Booking } = require('../../db/models')
const { Spot } = require('../../db/models')
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize')
const { SpotImage } = require('../../db/models')
const { sequelize } = require('../../db/models')


// Get currentUser bookings
//CHECK URL
router.get('/currentUser/bookings',requireAuth, async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const bookings = await Booking.findAll({
            where: {
                userId: user.id
            },
            // attributes: [
            //     'id',
            //     'spotId',
            // ],
            // include: [
            //     {
            //         model: Spot,
            //         attributes: [
            //             'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name',
            //             'price',

            //         ],
            //         include: [
            //             {
            //                 model: SpotImage,
            //                 attributes: [
            //                     'url'
            //                 ],
            //                 where: {
            //                     preview: true
            //                 },
            //                 required: false
            //             }
            //         ]
            //     },
            //     // {
            //     //     model: Booking,
            //     //     attributes: [
            //     //         'userId', 'startDate', 'endDate', 'createdAt', 'updatedAt'
            //     //     ]
            //     // }
            // ],

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
            // raw: true
        })

        // console.log(bookings)
        const bookingData = []
        // const bookingData = bookings.toJSON()
        for(let i = 0; i < bookings.length; i++){
            let booking = bookings[i]
            let bookingObj = booking.toJSON()
            let spot = bookingObj.Spot
            // console.log(spot)
            const previewImage = await SpotImage.findOne({
                where: {
                    preview: true,
                    spotId: spot.id
                }
            })
            if(previewImage) {
                spot.previewImage = previewImage.url
            }else{
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

//get all bookings based on spot id
//CHECK URL
router.get('/spots/:id/bookings',requireAuth, async (req, res) => {
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
router.post('/spots/:id/bookings',requireAuth, async(req,res)=> {
    try {
        const { id } = req.params
        const { startDate, endDate } = req.body

        if(!id || !startDate || !endDate ){
            throw new Error('Missing information to create a booking.')
        }

        if(endDate < startDate){
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

// Edit a booking by id
router.put('/:id',requireAuth, async (req, res) => {
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
        if (Booking.userId !== req.user.id) {
            throw new Error('Not your booking.');
        }

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
router.delete('/:id',requireAuth, async (req, res) => {
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

        if(findBooking.userId !== req.user.id) {
            throw new Error('Not your booking.')
        }

        if(!findBooking){
            throw new Error('Booking was not found.')
        }
        else {
            await findBooking.destroy();
            res.json({ message: 'Booking deleted.' })
        }
        res.json(findBooking)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;
