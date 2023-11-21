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
    const [isLoaded, setIsLoaded] = useState(false)
    const spots = useSelector(state => state.spots)
    const reviewsObj = useSelector(state => state.reviews)
    const reviews = Object.values(reviewsObj)
    const spot = spots[spotId]
    const spotReviews = reviews.filter(review => review.spotId === +spotId)

    useEffect(() => {
        dispatch(spotActions.getSpot(spotId))
        .then(() => setIsLoaded(true))
    }, [dispatch, spotId])

    useEffect(() => {
        dispatch(reviewActions.getReviews(spotId))
    }, [dispatch, spotId])

    useEffect(() => {
        if (spotReviews && spotReviews.length > 0) {
            const totalStars = spotReviews.reduce((sum, review) => sum + review.stars, 0);
            const average = totalStars / spotReviews.length;
            setAvgStars(average.toFixed(1));
        } else {
            setAvgStars('New')
        }
    }, [spotReviews]);

    if (!isLoaded) {
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
                    <img src={spot.SpotImages.find(image => image.preview === true).url} alt={spot.name}></img>
                </div>
                <div>
                    <p>Host by {spot.Owner.firstName} {spot.Owner.lastName}</p>
                    <p>{spot.description}</p>
                </div>
                <div>
                    <div>${spot.price} night</div>
                    {avgStars !== 'New' && <div>★ {avgStars} • # {spotReviews.length} {spotReviews.length === 1 ? 'review' : 'reviews'}</div>}
                    {avgStars === 'New' && <div>{avgStars}</div>}
                    <button onClick={() => alert('Feature coming soon!!')}>Reserve</button>
                </div>
                <div>
                    <AReveiw/>
                </div>
            </div>
        )
    }
}

export default ASpot
