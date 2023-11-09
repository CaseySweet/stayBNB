import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/get'
const GET_SPOT = 'spots/get'

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

    if(response.ok){
        const spot = await response.json()
        console.log(spot)
        dispatch(getASpot(spot))
        return spot
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
            return {...state, [action.spot.id]: action.spot}
        default:
            return state
    }
}

export default spotReducer
