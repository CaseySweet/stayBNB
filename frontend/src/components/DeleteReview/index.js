import { useDispatch } from "react-redux"
import React from "react";
import { useModal } from "../../context/Modal"
import * as reviewActions from '../../store/review'
import './DeleteReview.css'

const DeleteAReview = ({ reviewId }) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()


    const handleDelete = (e) => {
        e.preventDefault()
        dispatch(reviewActions.deleteReview(reviewId))
        closeModal()
    }

    return (
        <div className="delete-review-container">
            <h1>Confirm Delete</h1>
            <p>Are you sure you wnat to delete this review?</p>
            <button className="delete-review" onClick={handleDelete}>Yes (Delete Review)</button>
            <button className="keep-review" onClick={() => closeModal()}>No (Keep Review)</button>
        </div>
    )
}

export default DeleteAReview
