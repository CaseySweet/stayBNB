import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import * as spotActions from '../../store/spot'
import { useHistory } from "react-router-dom"
import './NewSpotForm.css'

const NewSpotForm = () => {
    const dispatch = useDispatch()
    const history = useHistory()
    const [country, setCountry] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [lat, setLat] = useState(0)
    const [lng, setLng] = useState(0)
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [preview, setPreview] = useState('')
    const [image1, setImage1] = useState('')
    const [image2, setImage2] = useState('')
    const [image3, setImage3] = useState('')
    const [image4, setImage4] = useState('')
    const [errors, setErrors] = useState({});
    const [submit, setSubmit] = useState(false)

    useEffect(() => {
        const errors = {}
        if (!country) errors['country'] = 'Country is required'
        if (!address) errors['address'] = 'Address is required'
        if (!city) errors['city'] = 'City is required'
        if (!state) errors['state'] = 'State is required'
        if (isNaN(parseInt(lat))) errors['lat'] = 'Latitude needs to be a number'
        if (!lat) errors['lat'] = 'Latitude is required'
        if (lat < -90 || lat > 90) errors['lat'] = 'Latitude is not valid'
        if (isNaN(parseInt(lng))) errors['lng'] = 'Longitude needs to be a number'
        if (!lng) errors['lng'] = 'Longitude is required'
        if (lng < -180 || lng > 180) errors['lng'] = 'Longitude is not valid'
        if (!description) errors['description'] = 'Description is required'
        if (description.length < 30) errors['description'] = 'Description must be at least 30 characters'
        if (description.length > 1000) errors['description'] = 'Description must be less than 1000 characters'
        if (!name) errors['name'] = 'Name is required'
        if (name.length > 50) errors['name'] = 'Name must be less than 50 characters'
        if (!price) errors['price'] = 'Price is required'
        if (!preview) errors['preview'] = 'Preview image is required.'
        // if (image1 && !(image1.split('.')[image1.split('.').length - 1] === 'png' || image1.split('.')[image1.split('.').length - 1] === 'jpg' || image1.split('.')[image1.split('.').length - 1] === 'jpeg')) errors['image1'] = 'Image URL must end in .png, .jpg, or .jpeg'
        // if (image2 && !(image2.split('.')[image2.split('.').length - 1] === 'png' || image2.split('.')[image2.split('.').length - 1] === 'jpg' || image2.split('.')[image2.split('.').length - 1] === 'jpeg')) errors['image2'] = 'Image URL must end in .png, .jpg, or .jpeg'
        // if (image3 && !(image3.split('.')[image3.split('.').length - 1] === 'png' || image3.split('.')[image3.split('.').length - 1] === 'jpg' || image3.split('.')[image3.split('.').length - 1] === 'jpeg')) errors['image3'] = 'Image URL must end in .png, .jpg, or .jpeg'
        // if (image4 && !(image4.split('.')[image4.split('.').length - 1] === 'png' || image4.split('.')[image4.split('.').length - 1] === 'jpg' || image4.split('.')[image4.split('.').length - 1] === 'jpeg')) errors['image4'] = 'Image URL must end in .png, .jpg, or .jpeg'

        setErrors(errors)
    }, [country, address, city, state, lat, lng, description, name, price, preview, image1, image2, image3, image4])

    const onSubmit = async (e) => {
        e.preventDefault()

        setSubmit(true)

        const spotInfo = { country, address, city, state, lat: Number(lat), lng: Number(lng), description, name, price: +price }

        const previewImgInfo = {
            url: preview,
            preview: true
        }

        const Img1Info = {
            url: image1,
            preview: false
        }

        const Img2Info = {
            url: image2,
            preview: false
        }

        const Img3Info = {
            url: image3,
            preview: false
        }

        const Img4Info = {
            url: image4,
            preview: false
        }

        if (!Object.values(errors).length) {
            const createdSpot = await dispatch(spotActions.postSpot(spotInfo))
                .catch(async (res) => {
                    const data = await res.json()
                    if (data && data.errors) {
                        setErrors(data.errors)
                    }
                })

            if (createdSpot) {
                await dispatch(spotActions.postImage(createdSpot.id, previewImgInfo))
                if (image1) {
                    await dispatch(spotActions.postImage(createdSpot.id, Img1Info))
                }
                if (image2) {
                    await dispatch(spotActions.postImage(createdSpot.id, Img2Info))
                }
                if (image3) {
                    await dispatch(spotActions.postImage(createdSpot.id, Img3Info))
                }
                if (image4) {
                    await dispatch(spotActions.postImage(createdSpot.id, Img4Info))
                }

                // history.push(`/spots/${newSpotId}`)

            }
        }
    }

    return (
        <div>
            <form className="form-container" onSubmit={onSubmit}>
                <h2 className="create-spot-header">Create a new Spot</h2>
                <p className="under-create-spot-header">Where's your place located?</p>
                <p className="getting-info">Guests will only get your exact address once they booked a reservation</p>


                <div className="top-div">
                    <div className="country-container">
                        <label>Country {submit && errors.country && <div className="create-spot-error-text">{errors.country}</div>}</label>
                        <div>
                            <input
                                className="country-input-box"
                                type="text"
                                onChange={e => setCountry(e.target.value)}
                                value={country}
                                placeholder="Country"
                            />
                        </div>
                    </div>

                    <div>
                        <label>Street Address {submit && errors.address && <div className="create-spot-error-text">{errors.address}</div>}</label>
                        <div>
                            <input
                                type="text"
                                className="address-input-box"
                                onChange={e => setAddress(e.target.value)}
                                value={address}
                                placeholder="Address"
                            />
                        </div>
                    </div>

                    <div className="city-state-container">
                        <div>
                            City {submit && errors.city && <div className="create-spot-error-text">{errors.city}</div>}
                        </div>
                        <input
                            type="text"
                            className="city-input-box"
                            onChange={e => setCity(e.target.value)}
                            value={city}
                            placeholder="City"
                        />

                        <div>
                            State {submit && errors.state && <div className="create-spot-error-text">{errors.state}</div>}
                        </div>

                        <input
                            type="text"
                            className="state-input-box"
                            onChange={e => setState(e.target.value)}
                            value={state}
                            placeholder="STATE"
                        />

                    </div>
                    <div className="lat-lng-container">
                        <label>Latitude {submit && errors.lat && <div className="create-spot-error-text">{errors.lat}</div>}</label>

                        <input
                            type="text"
                            className="lat-input-box"
                            onChange={e => setLat(e.target.value)}
                            value={lat}
                            placeholder="Latitude"
                        />

                        <label> Longitude {submit && errors.lng && <div className="create-spot-error-text">{errors.lng}</div>}</label>

                        <input
                            type="text"
                            className="lng-input-box"
                            onChange={e => setLng(e.target.value)}
                            value={lng}
                            placeholder="Longitude"
                        />
                    </div>

                </div>
                <div className="describe-container">
                    <label className="describe-header">Describe your place to guests</label>
                    <p className="explain-header">Mention the best features of your space, any special amentities
                        like fast wifi or parking, and what you love about the neighborhood.
                    </p>
                    <textarea
                        type="text"
                        className="description-input-box"
                        onChange={e => setDescription(e.target.value)}
                        value={description}
                        placeholder="Please write at least 30 characters"
                    ></textarea>
                    {submit && errors.description && <p className="create-spot-error-text">{errors.description}</p>}
                </div>

                <div className="title-container">
                    <label className="title-label">Create a title for your spot</label>
                    <p className="explain-name">Catch guests' attention with a spot title that highlights what makes your place special.</p>
                    <input
                        type="text"
                        className="name-input-box"
                        onChange={e => setName(e.target.value)}
                        value={name}
                        placeholder="Name of your spot"
                    />
                    {submit && errors.name && <p className="create-spot-error-text">{errors.name}</p>}
                </div>

                <div className="price-container">
                    <label className="price-title">Set a base price for your spot</label>
                    <p className="explain-price">Competitive pricing can help your listing stand out and rank higher in search results</p>
                    <input
                        type="number"
                        className="price-input-box"
                        onChange={(e => setPrice(e.target.value))}
                        value={price}
                        placeholder="Price per night (USD)"
                    />
                    {submit && errors.price && <p className="create-spot-error-text">{errors.price}</p>}
                </div>

                <div className="img-container">
                    <div>
                        <label className="img-title">Liven up your spot with photos</label>
                        <p className="explain-img">Submit a link to at least one photo to publish your spot.</p>
                        <input
                            type="text"
                            className="img-input-box"
                            onChange={e => setPreview(e.target.value)}
                            value={preview}
                            placeholder="Preview Image URL"
                        />
                        {submit && errors.preview && <p className="create-spot-error-text">{errors.preview}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            className="img-input-box"
                            onChange={e => setImage1(e.target.value)}
                            value={image1}
                            placeholder="Image URL"
                        />
                        {submit && errors.image1 && <p className="create-spot-error-text">{errors.image1}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            className="img-input-box"
                            onChange={e => setImage2(e.target.value)}
                            value={image2}
                            placeholder="Image URL"
                        />
                        {submit && errors.image2 && <p className="create-spot-error-text">{errors.image2}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            className="img-input-box"
                            onChange={e => setImage3(e.target.value)}
                            value={image3}
                            placeholder="Image URL"
                        />
                        {submit && errors.image3 && <p className="create-spot-error-text">{errors.image3}</p>}
                    </div>
                    <div>
                        <input
                            type="text"
                            className="img-input-box"
                            onChange={e => setImage4(e.target.value)}
                            value={image4}
                            placeholder="Image URL"
                        />
                        {submit && errors.image4 && <p className="create-spot-error-text">{errors.image4}</p>}
                    </div>
                </div>

                <div>
                    <button className="create-spot-button">Create Spot</button>
                </div>
            </form>
        </div>
    )
}

export default NewSpotForm
