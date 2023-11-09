import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useParams } from 'react-router-dom'

const AReveiw = () => {
    const dispatch = useDispatch()
    const { spotId } = useParams()
    // const reveiws = useSelector(state => state.reveiws)

    // const spotReviews = Object.values(reveiws).filter((review) => review.spotId === spotId)

    useEffect(() => {
        dispatch(reviewActions.getReviews(spotId))
    },[dispatch])

    return (
        <div>
            <div>Hello</div>
        </div>
    )
}

export default AReveiw
