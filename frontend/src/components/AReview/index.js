import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useParams } from 'react-router-dom'

const AReview = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const reviews = useSelector(state => state.reviews.review)
    const [avgStars, setAvgStars] = useState();


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
                <div>★ {avgStars} • # {reviews.length} reviews</div>
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
