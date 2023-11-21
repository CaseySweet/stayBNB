import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useParams } from 'react-router-dom'
import OpenModalButton from '../OpenModalButton';
import PostReview from "../PostReview";
import DeleteAReview from '../DeleteReview'

const AReview = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const reviewsObj = useSelector(state => state.reviews)
    const [avgStars, setAvgStars] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const sessionUser = useSelector(state => state.session.user)
    const spotsObj = useSelector(state => state.spots)
    // const spots = Object.values(spotsObj)
    const reviews = Object.values(reviewsObj)
    const spotReviews = reviews.filter(review => review.spotId === +spotId)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    useEffect(() => {
        dispatch(reviewActions.getReviews(spotId));
        setIsLoaded(true)
    }, [dispatch, spotId])


    useEffect(() => {
        if (spotReviews) {
            const totalStars = spotReviews.reduce((sum, review) => sum + review.stars, 0)
            const average = totalStars / spotReviews.length
            setAvgStars(average.toFixed(1))
        } else {
            setAvgStars('New')
        }
    }, [spotReviews]);

    const sortedReviews = [...spotReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    if (!isLoaded) return <div>LOADING</div>
    const userSignedIn = sessionUser ? sessionUser.id : null
    const userHasNoReview = !userSignedIn || !spotReviews.find((review) => review.userId === userSignedIn);
    const userOwnsSpot = !userSignedIn || userSignedIn !== spotsObj[spotId].ownerId
        return (
            <div>
                {spotReviews.length === 0 ? (
                    <div>
                        <strong>New</strong>
                        <div>
                            {userOwnsSpot && userHasNoReview && sessionUser && (
                                <OpenModalButton
                                    buttonText='Post Your Review'
                                    modalComponent={<PostReview spotId={spotId} />}
                                />

                            )}
                        </div>
                        <div>
                            {spotReviews.length === 0 && sessionUser && (
                                <div>Be the first to post a review !</div>
                            )}
                        </div>
                    </div>

                ) : (
                    <div>
                        <div>
                            <div>
                                ★ {avgStars} • # {spotReviews.length === 1 ? "1 review" : `${spotReviews.length} reviews`}
                            </div>
                            <div>
                                {userOwnsSpot && userHasNoReview && sessionUser && (
                                    <OpenModalButton
                                        buttonText='Post Your Review'
                                        modalComponent={<PostReview spotId={spotId} />}
                                    />

                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {sortedReviews.map((review, index) => (
                        <ul key={index}>
                            <div>{review.User?.firstName}</div>
                            <div>{formatDate(review.createdAt)}</div>
                            <div>{review.review}</div>
                            {userSignedIn === review.userId && (
                                <OpenModalButton
                                    buttonText={'Delete'}
                                    modalComponent={<DeleteAReview reviewId={review.id} />}
                                />
                            )}
                        </ul>
                    ))}
                </div>
            </div>
        )
}

export default AReview
