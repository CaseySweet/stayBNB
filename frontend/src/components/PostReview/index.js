import React, { useState } from "react";
import { useDispatch } from 'react-redux'
import * as reviewActions from '../../store/review'
import { useModal } from "../../context/Modal"

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
                    console.log(data)
                    if (data && data.errors) {
                        setErrors(data.errors)
                    }
                })
        }
    }

    const star1ClassName = (stars === 1 ? 'fa-solid fa-star' : 'fa-regular fa-star')
    const star2ClassName = (stars === 2 ? 'fa-solid fa-star' : 'fa-regular fa-star')
    const star3ClassName = (stars === 3 ? 'fa-solid fa-star' : 'fa-regular fa-star')
    const star4ClassName = (stars === 4 ? 'fa-solid fa-star' : 'fa-regular fa-star')
    const star5ClassName = (stars === 5 ? 'fa-solid fa-star' : 'fa-regular fa-star')

    const submitDisabled = review.length < 10 || stars === 0;

    return (
        <div>
            <div>How was your stay?</div>
            <form onSubmit={onSubmit}>
                {errors && <p>{errors.review || errors.stars}</p>}
                <textarea
                    onChange={e => setReview(e.target.value)}
                    value={review}
                    placeholder="Leave your review here..."
                />

                <div>
                <span className="post-review-stars">
                    <div className={star1ClassName} onClick={(e) => setStars(1)}></div>
                    <div className={star2ClassName} onClick={(e) => setStars(2)}></div>
                    <div className={star3ClassName} onClick={(e) => setStars(3)}></div>
                    <div className={star4ClassName} onClick={(e) => setStars(4)}></div>
                    <div className={star5ClassName} onClick={(e) => setStars(5)}></div>
                    Stars
                </span>
                </div>

                <div>
                    <button disabled={submitDisabled}>Submit your review</button>
                </div>

            </form>
        </div>
    )
}

export default PostReview
