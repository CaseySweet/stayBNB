import { csrfFetch } from "./csrf";

const GET_REVIEWS = 'reviews/get'

const getAllReview = (spot) => {
    return {
        type: GET_REVIEWS,
        payload: spot
    }
}

export const getReviews = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/reviews`)

    if(response.ok){
        const reviews = await response.json()
        dispatch(getAllReview(reviews.Reviews))
        return reviews
    }
}

const initialState = {}

const reviewReducer = (state = initialState, action) => {
    let newState
    switch(action.type){
        case GET_REVIEWS:
            newState = Object.assign({}, state);
            newState.review = action.payload;
            return newState;
        default:
            return state
    }
}
export default reviewReducer
