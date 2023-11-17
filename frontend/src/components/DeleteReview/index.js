import { useDispatch } from "react-redux"
import { useModal } from "../../context/Modal"
import * as reviewActions from '../../store/review'

const DeleteAReview = ({reviewId}) => {
    const dispatch = useDispatch()
    const { closeModal } = useModal()

    console.log(reviewId, 'Review id')

    const handleDelete = (e) => {
        e.preventDefault()
        dispatch(reviewActions.deleteReview(reviewId))
        closeModal()
    }
    return (
        <div>
            <h1>Confirm Delete</h1>
            <p>Are you sure you wnat to delete this review?</p>
            <button onClick={handleDelete}>Yes (Delete Review)</button>
            <button onClick={() => closeModal()}>No (Keep Review)</button>
        </div>
    )
}

export default DeleteAReview
