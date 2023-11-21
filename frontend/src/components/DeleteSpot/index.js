import { useDispatch } from "react-redux"
import { useModal } from "../../context/Modal"
import { useHistory } from "react-router-dom"
import * as spotActions from '../../store/spot'

const DeleteASpot = ({spotId}) => {
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
        <div>
        <h1>Confirm Delete</h1>
        <p>Are you sure you want to remove this spot from the listings?</p>
        <button onClick={handleDelete}>Yes (Delete Spot)</button>
        <button onClick={() => closeModal()}>No (Keep Spot)</button>
        </div>
    )
}

export default DeleteASpot