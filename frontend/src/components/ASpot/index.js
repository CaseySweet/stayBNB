import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'
import { useParams } from 'react-router-dom'

const ASpot = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const spots = useSelector(state => state.spots)
    const reviews = useSelector(state => state.reviews)

    const spot = spots[spotId]
    console.log(spot)

    useEffect(() => {
        dispatch(spotActions.getSpots())
    }, [dispatch])

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
                <p>{spots[spotId].ownerId}</p>
                <p>{spot.description}</p>
                </div>
                <div>${spot.price} night</div>
                <div>{spot.avgRating}  #{spot.avgRating.length}</div>
                <button onClick={() => alert('Feature coming soon!!')}>Reserve</button>
            </div>
        )
    }
}

export default ASpot
