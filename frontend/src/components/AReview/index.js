import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useParams } from 'react-router-dom'
import OpenModalButton from '../OpenModalButton';
import PostReview from "../../components/PostReview";

const AReview = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const reviews = useSelector(state => state.reviews.review) || []
    const [avgStars, setAvgStars] = useState()
    const sessionUser = useSelector(state => state.session.user)
    // const spotsObj = useSelector(state => state.spots)
    // const spots = Object.values(spotsObj)


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    useEffect(() => {
        dispatch(reviewActions.getReviews(spotId))
    }, [dispatch, spotId])

    useEffect(() => {
        if (reviews) {
            const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0)
            const average = totalStars / reviews.length
            setAvgStars(average)
        }
    }, [reviews]);

    const userSignedIn = sessionUser ? sessionUser.id : null
    // const userHasNoReview = userSignedIn ? reviews.some((review) => console.log(review, "Review")) : false
    const userHasNoReview = userSignedIn ? reviews.some((review) => review.userId === userSignedIn) : false
    // const userOwnsSpot = userSignedIn ? spots.some((spot) => console.log(spot, 'userOwnsSpot')) : false
    // const userOwnsSpot = userSignedIn ? spots.some((spot) => spot.ownerId === userSignedIn) : false

    // console.log("userSignedIn:", userSignedIn);
    // console.log("userOwnsSpot:", userOwnsSpot);

    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    if (!reviews) {
        return (
            <div>LOADING</div>
        )
    } else {
        return (
            <div>
                {reviews.length === 0 ? (
                    <div>
                        <strong>New</strong>
                        <div>
                            {!userHasNoReview && sessionUser && (
                                <OpenModalButton
                                    buttonText='Post Your Review'
                                    modalComponent={<PostReview spotId={spotId}/>}
                                />

                            )}
                        </div>
                        <div>
                            {reviews.length === 0 && sessionUser && (
                                <div>Be the first to post a review !</div>
                            )}
                        </div>
                    </div>

                ) : (
                    <div>
                        <div>
                            <div>
                                ★ {avgStars} • # {reviews.length === 1 ? "1 review" : `${reviews.length} reviews`}
                            </div>
                            <div>
                                {!userHasNoReview && sessionUser && (
                                    <OpenModalButton
                                        buttonText='Post Your Review'
                                        modalComponent={<PostReview spotId={spotId}/>}
                                    />

                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    {sortedReviews.map((review, index) => (
                        <ul key={index}>
                            <div>{review.User.firstName}</div>
                            <div>{formatDate(review.createdAt)}</div>
                            <div>{review.review}</div>
                        </ul>
                    ))}
                </div>
            </div>
        )
    }
}

export default AReview
