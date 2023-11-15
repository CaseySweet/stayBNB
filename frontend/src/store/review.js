import { csrfFetch } from "./csrf";

const GET_REVIEWS = 'reviews/get'
const POST_REVIEW = 'review/post'

const getAllReview = (spot) => {
    return {
        type: GET_REVIEWS,
        payload: spot
    }
}

const postAReview = (review) => {
    return {
        type: POST_REVIEW,
        payload: review
    }
}

export const getReviews = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`)

    if (response.ok) {
        const reviews = await response.json()
        dispatch(getAllReview(reviews.Reviews))
        return reviews
    }
}

export const postReview = (spotId, reviewInfo) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewInfo)
    })

    if (response.ok) {
        const review = await response.json()
        dispatch(postAReview(review))
        return review
    }
}

const initialState = {}

const reviewReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_REVIEWS:
            newState = Object.assign({}, state);
            newState.review = action.payload;
            return newState;
        case POST_REVIEW:
            newState = Object.assign({}, state)
            console.log(newState, 'Before')
            newState.review = action.payload;
            console.log(newState, 'After')
            return newState;
        default:
            return state
    }
}
export default reviewReducer
