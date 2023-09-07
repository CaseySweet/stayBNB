const router = require('express').Router();
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')


router.get('/currentUser/reviews', requireAuth, async (req, res) => {
    try {
        const { user } = req;

        if (user === null) {
            throw new Error('There is no user signed in.')
        }

        const reviews = await Review.findAll({
            where: {
                userId: user.id
            },
            attributes: [
                'id',
                'userId',
                'spotId',
                'review',
                'stars',
                'createdAt',
                'updatedAt'
            ],
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Spot,
                    attributes: [
                        'id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name',
                        'price'
                    ],
                    include: [
                        {
                            model: SpotImage,
                            attributes: [
                                'url'
                            ],
                            where: {
                                preview: true
                            },
                            required: false
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                }
            ]
        })

        res.json({
            Reviews: reviews,
            User: User,
            Spot: Spot,
            ReviewImages: ReviewImage
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//delete a image of a review
router.delete('/reviews/:reviewId/images/:imageId', async (req, res) => {
    try {
        const { reviewId, imageId } = req.params

        const review = await Review.findOne({
            where: {
                id: reviewId
            },
        })
        const img = await ReviewImage.findOne({
            where: {
                id: imageId
            }
        })
        if (!review || !img) {
            let err = Error()
            err = {
                message: 'Review Image couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (review.userId !== req.user.id) {
            throw new Error('Not your image.');
        }
        await img.destroy()
        res.json({ message: 'Successfully deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//post image to review
router.post('/reviews/:id/images', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body

        if (!url) {
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

        if (!reviews) {
            let err = Error()
            err = {
                message: "Review couldn\'t be found"
            }
            return res.status(404).json(err)
        }

        if (reviews.userId !== req.user.id) {
            throw new Error('Not your review.');
        }

        const countReviewImgs = await ReviewImage.count({
            where: {
                reviewId: reviews.id
            }
        });

        if (countReviewImgs >= 10) {
            let err = Error()
            err = {
                message: 'Maximum number of images for this resource was reached.'
            }
            return res.status(403).json(err)
        }

        const createImg = await ReviewImage.create({ reviewId: reviews.id, url })

        const { id: reviewImgId } = createImg

        return res.json({
            id: reviewImgId,
            url
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//Edit a review
router.put('/reviews/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { review, stars } = req.body;

        if (!id) {
            throw new Error('Missing id to create a review.')
        }

        if (!review || stars <= 0 || stars > 5 || typeof stars !== 'number') {
            let err = Error()
            err = {
                message: "Bad Request",
                errors: {
                    review: "Review text is required",
                    stars: "Stars must be an integer from 1 to 5"
                }
            }
            return res.status(400).json(err)
        }

        const findReview = await Review.findOne({
            where: {
                id: id
            },
            attributes: [
                'id',
                'userId',
                'spotId',
                'review',
                'stars',
                'createdAt',
                'updatedAt'
            ],
        })
        if (!findReview) {
            let err = Error()
            err = {
                message: 'Review couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (findReview.userId !== req.user.id) {
            throw new Error('Not your review.');
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
router.delete('/reviews/:id', requireAuth, async (req, res) => {
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

        if (!review) {
            let err = Error()
            err = {
                message: 'Review couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        const reviewImgs = await ReviewImage.findAll({
            where: {
                reviewId: review.id
            }
        })

        if (review.userId !== req.user.id) {
            throw new Error('Not your review.');
        }

        for (const reviewImg in reviewImgs) {
            await reviewImgs[reviewImg].destroy();
        }

        await review.destroy()
        res.json({ message: 'Successfully deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router;
