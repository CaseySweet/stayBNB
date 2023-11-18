import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'
import { NavLink } from "react-router-dom";
import './AllSpots.css'


const AllSpots = () => {
    const dispatch = useDispatch()
    const spots = useSelector(state => state.spots)



    useEffect(() => {
        dispatch(spotActions.getSpots())
    }, [dispatch])

    return (
        <>
            <ul className="spot-list">
                {Object.values(spots).map(spot => (
                    <NavLink className="each-spot" to={`/spots/${spot.id}`} key={spot.id}>
                        <img src={spot.previewImage} alt={spot.name} title={spot.name}></img>
                        <div className="spot-info-container">
                            <div>{spot.city}, {spot.state}</div>
                            {spot.avgRating ? (
                                <div className="review-info">★<strong>{spot.avgRating.toFixed(1)}</strong></div>
                            ) : (
                                <div className="review-info"><strong>New</strong></div>
                            )}
                        </div>
                            <div><strong>${spot.price}</strong> night</div>
                    </NavLink>
                ))}
            </ul>
        </>
    )
}

export default AllSpots
