import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as spotActions from '../../store/spot'


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
                    <div key={spot.id}>{spot.name}</div>
                    ))}
            </ul>

        </>
    )
}

export default AllSpots
