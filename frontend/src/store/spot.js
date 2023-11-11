import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/get'
const GET_SPOT = 'spot/get'
const POST_SPOT = 'spot/post'
const POST_IMAGE = 'spot/post/image'

const getAllSpots = (spots) => {
    return {
        type: GET_SPOTS,
        payload: spots
    }
}

const getASpot = (spot) => {
    return {
        type: GET_SPOT,
        payload: spot
    }
}

const postASpot = (spot) => {
    return {
        type: POST_SPOT,
        payload: spot
    }
}

const postAImage = (spot) => {
    return {
        type: POST_IMAGE,
        payload: spot
    }
}

export const getSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots')

    if (response.ok) {
        const spots = await response.json()
        dispatch(getAllSpots(spots))
        return spots
    }
}

export const getSpot = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`)

    if (response.ok) {
        const spot = await response.json()
        dispatch(getASpot(spot))
        return spot
    }
}

export const postSpot = (spotInfo) => async (dispatch) => {
    console.log('coming from THUNK', JSON.stringify(spotInfo))
    const newSpot = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(spotInfo)
    })

    if (newSpot.ok) {
        const spot = await newSpot.json()
        dispatch(postASpot(spot))
        return spot
    }
}

export const postImage = (spotId, image) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}/images`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(image)
    })

    const newSpot = await csrfFetch(`/api/spots/${spotId}`)

    if (response.ok && newSpot.ok) {
        const spotInfo = await newSpot.json()
        dispatch(postAImage(spotInfo))
        return spotInfo
    }
}

const initialState = {};

const spotReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_SPOTS:
            newState = Object.assign({}, state)
            const spotArr = action.payload.Spots
            spotArr.map((spotObj) => newState[spotObj.id] = spotObj)
            return newState
        case GET_SPOT:
            newState = Object.assign({}, state)
            newState.spot = action.payload;
            return newState;
        case POST_SPOT:
            newState = Object.assign({}, state)
            newState.spot = action.payload
            return newState
        case POST_IMAGE:
            newState = Object.assign({}, state)
            newState.spot = action.payload

            return newState
        default:
            return state
    }
}

export default spotReducer
