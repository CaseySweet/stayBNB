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
    const reviews = useSelector(state => state.reviews.review) || []
    const [avgStars, setAvgStars] = useState()
    const [isLoaded, setIsLoaded] = useState(false)
    const sessionUser = useSelector(state => state.session.user)
    const spotsObj = useSelector(state => state.spots)
    const spots = Object.values(spotsObj)

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    useEffect(() => {
        const fetchData = async () => {
            await dispatch(reviewActions.getReviews(spotId));
            setIsLoaded(true);
        };

        fetchData();
    }, [dispatch, spotId]);

    useEffect(() => {
        if (reviews) {
            const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0)
            const average = totalStars / reviews.length
            setAvgStars(average.toFixed(1))
        }
    }, [reviews]);

    const userSignedIn = sessionUser ? sessionUser.id : null
    const userHasNoReview = !userSignedIn || !reviews.find((review) => review.userId === userSignedIn);
    const userOwnsSpot = !userSignedIn || !spots.find((spot) => spot.ownerId === userSignedIn);

    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    if (!isLoaded) {
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
                            {userOwnsSpot && userHasNoReview && sessionUser && (
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
                                {userOwnsSpot && userHasNoReview && sessionUser && (
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
                            <div>{review.User?.firstName}</div>
                            <div>{formatDate(review.createdAt)}</div>
                            <div>{review.review}</div>
                            {userSignedIn === review.userId && (
                                <OpenModalButton
                                    buttonText={'Delete'}
                                    modalComponent={<DeleteAReview reviewId={review.id}/>}
                                />
                            )}
                        </ul>
                    ))}
                </div>
            </div>
        )
    }
}

export default AReview
