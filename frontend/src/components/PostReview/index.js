import React, { useState } from "react";
import { useDispatch } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useModal } from "../../context/Modal"
import './PostReview.css'

const PostReview = ({ spotId }) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()
    const [review, setReview] = useState('')
    const [stars, setStars] = useState(0)
    const [errors, setErrors] = useState({})

    const onSubmit = async (e) => {
        e.preventDefault()

        const reviewInfo = { review, stars }

        if (!Object.values(errors).length) {
            await dispatch(reviewActions.postReview(spotId, reviewInfo))
                .then(closeModal)
                .catch(async (res) => {
                    const data = await res.json()
                    if (data && data.errors) {
                        setErrors(data.errors)
                    }
                })
        }
    }

    const starClassName = (index) => (index <= stars ? 'fa-solid fa-star' : 'fa-regular fa-star');

    const submitDisabled = review.length < 10 || stars === 0;

    return (
        <div className="post-review-container">
            <div className="post-review-header">How was your stay?</div>
            <form onSubmit={onSubmit}>
                {errors && <p>{errors.review || errors.stars}</p>}
                <textarea
                    className="input-box"
                    onChange={e => setReview(e.target.value)}
                    value={review}
                    placeholder="Leave your review here..."
                />

                <span className="post-review-stars">
                        {[1, 2, 3, 4, 5].map(index => (
                            <div
                            key={index}
                            className={starClassName(index)}
                            onClick={() => setStars(index)}
                            ></div>
                            ))}
                        Stars
                    </span>

                <div>
                    <button className="submit-review-button" disabled={submitDisabled}>Submit your review</button>
                </div>

            </form>
        </div>
    )
}

export default PostReview
