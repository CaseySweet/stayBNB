import { useDispatch } from "react-redux"
import { useModal } from "../../context/Modal"
import { useHistory } from "react-router-dom"
import * as spotActions from '../../store/spot'
import './DeleteSpot.css'

const DeleteASpot = ({ spotId }) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const { closeModal } = useModal()

    const handleDelete = (e) => {
        e.preventDefault()

        dispatch(spotActions.deleteSpot(spotId.id))
        closeModal()
        history.push('/spots/current')
    }

    return (
        <div className="delete-spot-container">
            <h1>Confirm Delete</h1>
            <p className="delete-spot-header">Are you sure you want to remove this spot from the listings?</p>
            <div>
                <button className="delete-spot" onClick={handleDelete}>Yes (Delete Spot)</button>
            </div>
            <div>
                <button className="keep-spot" onClick={() => closeModal()}>No (Keep Spot)</button>
            </div>
        </div>
    )
}

export default DeleteASpot
