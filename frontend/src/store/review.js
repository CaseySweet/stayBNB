import { csrfFetch } from "./csrf";

const GET_REVIEWS = 'reviews/get'

const getAReview = (spot) => {
    return {
        type: GET_REVIEWS,
        payload: spot
    }
}

export const getReview = (id) => async dispatch => {
    const response = await csrfFetch(`/api/spots/${id}/reviews`)

    if(response.ok){
        const reviews = await response.json()
        dispatch(getAReview(reviews))
        return reviews
    }
}

const initialState = {}

const reviewReducer = (state = initialState, action) => {
    let newState
    switch(action.type){
        case GET_REVIEWS:
            newState = Object.assign({}, state)
            const reviewArr = action.payload.reviews
            reviewArr.map((reviewObj) => newState[reviewObj] = reviewObj)
            return newState
        default:
            return state
    }
}
export default reviewReducer
