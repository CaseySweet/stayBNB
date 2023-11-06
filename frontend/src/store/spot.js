import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/get'

const getAllSpots = (spots) => {
    return {
        type: GET_SPOTS,
        payload: spots
    }
}

export const getSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots')

    if (response.ok) {
        const data = await response.json()
        dispatch(getAllSpots(data))
        return data
    }
}

const initialState = {};

const spotReducer = (state = initialState, action) => {
    let newState
    switch (action.type) {
        case GET_SPOTS:
            newState = Object.assign({}, state)
            const getArr = action.payload.Spots
            getArr.map((spotObj) => newState[spotObj.id] = spotObj)
            return newState
        default:
            return state
    }
}

export default spotReducer
