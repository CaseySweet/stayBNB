const router = require('express').Router();
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')

// Gets currentUser reviews

// CHECK URL AGAIN YOU MIGHT WANT TO CHANGE IT
router.get('/currentUser/reviews', async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const reviews = await Review.findAll({
            where: {
                userId: user.id
            }
        });

        res.json(reviews)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get all reviews by spot id
//CHECK URL AGAIN YOU MIGHT WANT TO CHANGE IT
router.get('/spots/:id/reviews', async (req, res) => {
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
            throw new Error('Spot not found.')
        }

        const reviews = await Review.findAll({
            where: {
                spotId: spot.id
            }
        })
        res.json(reviews)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Make review for spot off spots id
//CHECK URL CHANGE IT
router.post('/spots/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { review, stars } = req.body;

        if (!id || !review || !stars) {
            throw new Error('Missing information to create a review.')
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

        const newReview = await Review.create({ review, stars, spotId: spot.id, userId: user })
        res.json({
            review: newReview
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;
