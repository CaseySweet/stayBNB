import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import * as spotActions from '../../store/spot'
import { NavLink } from 'react-router-dom'
import DeleteASpot from "../DeleteSpot"
import OpenModalButton from '../OpenModalButton';
import './UserSpots.css'

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
            <div className="manage-spots-container">
                <div className="manage-spots-header">
                <h1>Manage Spots</h1>
                <NavLink to={"/spots/new"}>
                    <button className="manage-spots-buttons">Create a New Spot</button>
                </NavLink>
                </div>
                <ul className="spot-list">
                    {ownedSpots.map(spot => (
                        <div key={spot.id}>
                            <NavLink className="each-spot" to={`/spots/${spot.id}`}>
                                <img src={spot.previewImage} alt={spot.name} title={spot.name}></img>
                                <div className="spot-info-container">
                                    <div>{spot.city}, {spot.state}</div>
                                    {spot.avgRating ? (
                                        <div className="review-info">★<strong>{spot.avgRating.toFixed(1)}</strong></div>
                                    ) : (
                                        <div className="review-info">★<strong>New</strong></div>
                                    )}
                                </div>
                                <div><strong>${spot.price}</strong> night</div>
                            </NavLink>
                            <NavLink to={`/spots/${spot.id}/edit`}><button className="manage-spots-update-buttons">Update</button></NavLink>
                            <OpenModalButton
                                buttonText={'Delete'}
                                modalComponent={<DeleteASpot spotId={spot}/>}
                                className={'manage-spots-buttons'}
                            />
                        </div>
                    ))}
                </ul>
            </div>
        )
    }
}

export default UserSpots
