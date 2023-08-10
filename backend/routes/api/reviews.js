const router = require('express').Router();
const { Review } = require('../../db/models');

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
        res.status(500).json({ error: error.message})
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

        const review = await Review.findOne({
            where: {
                id: id
            }
        });

        res.json(review)

    } catch (error) {
        res.status(500).json({ error: error.message})
    }
})

// Make review for spot off spots id
//CHECK URL CHANGE IT
router.post('/spots/:id/reviews', async (res, req) => {
    try {
        const { id } = req.params;
        const { review, stars } = req.body;

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid spot id.')
        }
        else if(review === undefined || ''){
            throw new Error('Invalid review')
        }
        else if(stars === undefined || ''){
            throw new Error('Invalid stars')
        }else {


            const user = req.user.id
            // const spot = req.spot.id

            const reviews = await Review.create({
                review, stars, ownerId: user, spotId: id
            });

            return res.json({
                review: reviews
            })
        }

    } catch (error) {
        res.status(500).json({ error: error.message})
    }
})


module.exports = router;
