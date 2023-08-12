const router = require('express').Router();
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');


// Gets currentUser reviews
// CHECK URL AGAIN YOU MIGHT WANT TO CHANGE IT
router.get('/currentUser/reviews',requireAuth, async (req, res) => {
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
router.post('/spots/:id/reviews', requireAuth, async (req, res) => {
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
//delete a image of a review
router.delete('/:reviewId/images/:imageId', async(req, res)=> {
    try {
        const { reviewId, imageId } = req.params

        const review = await Review.findOne({
            where: {
                id: reviewId
            }
        })
        const img = await ReviewImage.findOne({
            where: {
                id: imageId
            }
        })
        if (review.userId !== req.user.id) {
            throw new Error('Not your image.');
        }
        if(!review || !img){
            throw new Error('Review image couldn\'t be found.')
        }
        await img.destroy()
        res.json({message: 'Successfully deleted'})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//post image to review
router.post('/:id/images',requireAuth, async (req, res)=>{
    try {
        const { id } = req.params;
        const { url } = req.body

        if(!url){
            throw new Error('Missing information to post image.')
        }

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid review id.')
        }
        const reviews = await Review.findOne({
            where: {
                id: id
            }
        })
        if (reviews.id !== req.user.id) {
            throw new Error('Not your review.');
        }

        if (!reviews) {
            throw new Error('Review was not found.')
        }
        const createImg = await ReviewImage.create({id: reviews.id , url })

        return res.json({ createImg })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//Edit a review
router.put('/:id',requireAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { review, stars } = req.body;

        if (!id || !review || !stars) {
            throw new Error('Missing information to create a review.')
        }

        const findReview = await Review.findOne({
            where: {
                id: id
            }
        })
        if (findReview.id !== req.user.id) {
            throw new Error('Not your review.');
        }

        if (!findReview) {
            throw new Error('Review was not found.')
        }

        if (review) findReview.review = review
        if (stars) findReview.stars = stars

        await findReview.save()

        res.json(findReview)

    } catch (error) {
        res.status(500).json({ error: error.message })

    }
})

//Delete a review
router.delete('/:id',requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (id === undefined || id === null || id === '') {
            throw new Error('Not a valid review id.')
        }

        const review = await Review.findOne({
            where: {
                id: id
            }
        })
        if (review.id !== req.user.id) {
            throw new Error('Not your review.');
        }

        if (!review) {
            throw new Error('Review was not found.')
        } else {
            await review.destroy();
            res.json({ message: 'Review deleted.' })
        }
        res.json(review)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


module.exports = router;
