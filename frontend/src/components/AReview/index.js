import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useParams } from 'react-router-dom'
import OpenModalButton from '../OpenModalButton';

const AReview = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const reviews = useSelector(state => state.reviews.review)
    const [avgStars, setAvgStars] = useState();
    const sessionUser = useSelector(state => state.session.user);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    useEffect(() => {
        dispatch(reviewActions.getReviews(spotId))
    }, [dispatch, spotId])

    useEffect(() => {
        if (reviews) {
            const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
            const average = totalStars / reviews.length;
            setAvgStars(average);
        }
    }, [reviews]);

    if (!reviews) {
        return (
            <div>LOADING</div>
        )
    } else {
        return (
            <div>
                {!reviews || reviews.length === 0 ? (
                    <div>
                        <strong>New</strong>
                        <div>
                            {sessionUser && (
                                <OpenModalButton
                                buttonText='Post Your Review'

                                    // modalComponent={<PostAReview spotId={spotId} />}
                                />

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
                                {sessionUser && (
                                    <OpenModalButton
                                    buttonText='Post Your Review'
                                        // modalComponent={<PostAReview spotId={spotId} />}
                                    />

                                )}
                            </div>
                        </div>
                    </div>
                )}

                {reviews.map((review, index) => (
                    <ul key={index}>
                        <div>{review.User.firstName}</div>
                        <div>{formatDate(review.createdAt)}</div>
                        <div>{review.review}</div>
                    </ul>
                ))}
            </div>
        )
    }
}

export default AReview
