import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reveiwActions from '../../store/review'
import { useParams, NavLink } from 'react-router-dom'

const AReveiw = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    const reveiws = useSelector(state => state.reveiws)

    const spotReviews = Object.values(reveiws).filter((review) => review.spotId === spotId)

    useEffect(() => {
        dispatch(reveiwActions.getReviews(spotId))
    },[dispatch])

    return (
        <div>
            <div>Hello</div>

        </div>
    )
}

export default AReveiw
