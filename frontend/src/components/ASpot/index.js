import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'
import { useParams } from 'react-router-dom'
import AReveiw from "../AReview";
import * as reviewActions from '../../store/review'


const ASpot = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const [avgStars, setAvgStars] = useState();
    const spots = useSelector(state => state.spots)
    const reviews = useSelector(state => state.reviews.review)
    const spot = spots[spotId]

    useEffect(() => {
        dispatch(spotActions.getSpots())
    }, [dispatch])

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

    if (!spot) {
        return (
            <div>LOADING</div>
        )
    } else {

        return (
            <div>
                <div>
                    <h1>{spot.name}</h1>
                    <h2>{spot.city}, {spot.state}, {spot.country}</h2>
                </div>
                <div>
                    <img src={spot.previewImage} alt={spot.name}></img>
                </div>
                <div>
                    <p>Host by {spots[spotId].ownerId}</p>
                    <p>{spot.description}</p>
                </div>
                <div>
                    <div>${spot.price} night</div>
                    {!reviews || reviews.length === 0 ? (
                        <div><strong>New</strong></div>
                    ) : (
                        <div>★ {avgStars} • # {reviews.length === 1 ? "1 review" : `${reviews.length} reviews`}</div>
                    )}
                    <button onClick={() => alert('Feature coming soon!!')}>Reserve</button>
                </div>
                <div>
                    <AReveiw />
                </div>
            </div>
        )
    }
}

export default ASpot
