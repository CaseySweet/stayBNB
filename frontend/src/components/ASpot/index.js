import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'
import { useParams } from 'react-router-dom'
import AReveiw from "../AReview";
import * as reviewActions from '../../store/review'
import './ASpot.css'

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
            <div className="whole-spot">
                <div>
                    <h1 className="spot-name">{spot.name}</h1>
                    <h2 className="location">{spot.city}, {spot.state}, {spot.country}</h2>
                </div>
                <div>
                    <img className="a-spot-image" src={spot.SpotImages.find(image => image.preview === true).url} alt={spot.name}></img>
                </div>
                <div className="description-reserve">
                    <div>
                        <p className="hosted">Host by {spot.Owner.firstName} {spot.Owner.lastName}</p>
                        <p className="description">{spot.description}</p>
                    </div>
                    <div className="reserve-box">
                        <div className="price-reviews">
                        <div className="price">${spot.price} night</div>
                        {avgStars !== 'New' && <div className="stars">★ {avgStars} • {spotReviews.length} {spotReviews.length === 1 ? 'review' : 'reviews'}</div>}
                        {avgStars === 'New' && <div className="stars">{avgStars}</div>}
                        </div>
                        <button className="reserve" onClick={() => alert('Feature coming soon!!')}>Reserve</button>
                    </div>
                </div>
                <div className="reviews">
                    <AReveiw />
                </div>
            </div>
        )
    }
}

export default ASpot
