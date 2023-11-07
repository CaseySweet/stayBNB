import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'
import { NavLink } from "react-router-dom";


const AllSpots = () => {
    const dispatch = useDispatch()
    const spots = useSelector(state => state.spots)
    // console.log(spots)

    useEffect(() => {
        dispatch(spotActions.getSpots())
    }, [dispatch])

    return (
        <>
            <ul>
                {Object.values(spots).map(spot => (
                    <NavLink to={`/spots/${spot.id}`} key={spot.id}>
                        <img src={spot.previewImage} alt={spot.name}></img>
                        <div>{spot.name}</div>
                        <div>{spot.city}, {spot.state}</div>
                        {spot.avgRating ? (
                            <div>{spot.avgRating}</div>
                        ) : (
                            <div>New</div>
                        )}
                        <div>${spot.price}/ night</div>
                    </NavLink>
                ))}
            </ul>

        </>
    )
}

export default AllSpots
