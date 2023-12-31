const router = require('express').Router();
const { Review } = require('../../db/models');
const { Spot } = require('../../db/models')
const { ReviewImage } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { SpotImage } = require('../../db/models')

//Get all reviews of current user
router.get('/reviews/current', requireAuth, async (req, res) => {
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
                    model: ReviewImage,
                    attributes: [
                        'id',
                        'url'
                    ]
                }
            ]
        })

        let rslt = []
        for (let review1 of reviews) {
            let review = review1.toJSON()

            const user = await User.findByPk(review.userId, {
                attributes: ['id', 'firstName', 'lastName']
            })

            const spot = await Spot.findByPk(review.spotId, {
                attributes: [
                    'id', 'ownerId', 'address', 'city', 'state', 'country',
                    'lat', 'lng', 'name', 'price'
                ]
            })

            const spotImages = await SpotImage.findAll({
                where: {
                    spotId: spot.id,
                    preview: true
                },
                attributes: ['url']

            })

            // const reviewImages = await ReviewImage.findAll({
            //     where: {
            //         id: review.id
            //     },
            //     attributes: ['id', 'url']
            // })

            review.User = user
            review.Spot = {
                id: spot.id,
                ownerId: spot.ownerId,
                address: spot.address,
                city: spot.city,
                state: spot.state,
                country: spot.country,
                lat: spot.lat,
                lng: spot.lng,
                name: spot.name,
                price: spot.price,
                previewImage: spotImages.length > 0 ? spotImages[0].url : null
            }
            // review.ReviewImages = reviewImages
            rslt.push(review)
        }

        res.json({
            Reviews: rslt
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//delete a review image
router.delete('/review-images/:imageId', requireAuth, async (req, res) => {
    try {
        const { imageId } = req.params

        const img = await ReviewImage.findOne({
            where: {
                id: imageId
            },
            include: [{
                model: Review,
                attributes: ['userId']
            }]
        })
        if (!img) {
            let err = Error()
            err = {
                message: 'Review Image couldn\'t be found'
            }
            return res.status(404).json(err)
        }

        if (img.Review.userId !== req.user.id) {
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }
        await img.destroy()
        res.json({ message: 'Successfully deleted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

//Add an image to a review by review id
router.post('/reviews/:reviewId/images', requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { url } = req.body

        if (!url) {
            throw new Error('Missing information to post image.')
        }

        if (reviewId === undefined || reviewId === null || reviewId === '') {
            throw new Error('Not a valid review id.')
        }
        const reviews = await Review.findOne({
            where: {
                id: reviewId
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
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
router.put('/reviews/:reviewId', requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params
        const { review, stars } = req.body;

        if (!reviewId) {
            throw new Error('Missing id to create a review.')
        }

        const findReview = await Review.findOne({
            where: {
                id: reviewId
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
        }

        let errors = Error()
        errors = {}
        if (!review) {
            errors.review = 'Review text is required'
        }
        if (!stars || stars <= 0 || stars > 5 || typeof stars !== 'number') {
            errors.stars = 'Stars must be an integer from 1 to 5'
        }
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors
            })
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
router.delete('/reviews/:reviewId', requireAuth, async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (reviewId === undefined || reviewId === null || reviewId === '') {
            throw new Error('Not a valid review id.')
        }

        const review = await Review.findOne({
            where: {
                id: reviewId
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
            let err = Error()
            err = {
                message: 'Forbidden'
            }
            return res.status(403).json(err)
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
