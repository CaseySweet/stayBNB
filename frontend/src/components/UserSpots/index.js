import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as spotActions from '../../store/spot'
import { NavLink } from 'react-router-dom'

const UserSpots = () => {
    const dispatch = useDispatch()

    const spots = useSelector(state => state.spots)
    const userId = useSelector(state => state.session.user.id)

    let spotsArr = Object.values(spots)

    const ownedSpots = spotsArr.filter((spot) => {
        return spot.ownerId === userId
    })

    useEffect(() => {
        dispatch(spotActions.getSpots())
    }, [dispatch])

    if (!spots) {
        return (
            <div>LOADING</div>
        )
    } else {
        return (
            <div>
                <h1>Manage Your Spots</h1>
                <NavLink to={"/spots/new"}>
                    <button>Create a New Spot</button>
                </NavLink>
                <div>
                    <ul className="spot-list">
                        <div>
                            {ownedSpots.map(spot => (
                                <div key={spot.id}>
                                <NavLink className="each-spot" to={`/spots/${spot.id}`}>
                                    <img src={spot.previewImage} alt={spot.name} title={spot.name}></img>
                                    <div className="spot-info-container">
                                        <div>{spot.city}, {spot.state}</div>
                                        {spot.avgRating ? (
                                            <div className="review-info">★<strong>{spot.avgRating}</strong></div>
                                        ) : (
                                            <div className="review-info"><strong>New</strong></div>
                                        )}
                                    </div>
                                    <div><strong>${spot.price}</strong> night</div>
                                </NavLink>
                                <NavLink to={`/spots/${spot.id}/edit`}><button>Update</button></NavLink>
                                </div>
                            ))}
                        </div>
                    </ul>
                </div>
            </div>
        )
    }
}

export default UserSpots
