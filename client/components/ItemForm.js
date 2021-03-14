import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { debounce } from 'lodash'

const debouncedSave = debounce((searchQuery, updateSearchResults) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?country=gb&access_token=pk.eyJ1IjoidXJ1MzgiLCJhIjoiY2ttNnBveXQ2MHFnaDJ4anhtdmhnbHBmeSJ9.OWgGgvZU2cJlbxp-jAJh_g`)
    .then(({ data }) => {
      const search = data.features.map(location => {
        return {
          id: location.id,
          placeName: location.place_name,
          location: {
            lat: location.center[1],
            long: location.center[0]
          }
        }
      })
      updateSearchResults(search)
    })
}, 500)

const inputFields = ['name', 'typeof', 'category', 'description', 'image', 'listed']


export default function ItemForm({ formData, handleSubmit, handleChange, updateFormData }) {
  
  // const [creationSuccess, updateCreationSuccess] = useState(false)
  const [searchQuery, updateSearchQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])

  useEffect(() => {
    debouncedSave(searchQuery, updateSearchResults)
  }, [searchQuery])

  function createSearchQuery(event) {
    updateSearchQuery(event.target.value)
    updateFormData({ ...formData, search: event.target.value })
  }

  function handlePlaceSelect({ placeName, location }) {
    updateFormData({ ...formData, address: placeName, lat: location.lat, lng: location.long, search: placeName })
    updateSearchQuery('')
    updateSearchResults([])
  }

  return <div className="section">
    <div className="container">
      <form onSubmit={handleSubmit}>
        {inputFields.map(field => {
          return <div key={field} className="field">
            <label className="label">
              {field[0].toUpperCase() + field.slice(1)}
            </label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={formData[field]}
                onChange={handleChange}
                name={field}
              />
            </div>
          </div>
        })}
        {/* ---------------- James ----------------- */}
        <div className='field'>
          <label className='label'>Your Location</label>
          <div className='control'>
            <input
              className='input'
              placeholder='Search...'
              type='text'
              value={formData.search || ''}
              onChange={createSearchQuery}
              name={'search'}
            />
          </div>
          {searchResults.length > 0 &&
            <div className='dropdown is-active is-fullwidth'>
              <div className='dropdown-menu'>
                <div className='dropdown-content'>
                  {searchResults.map((place) => {
                    return <div key={place.id}>
                      <div className='dropdown-item' id='cardHover' onClick={() => handlePlaceSelect(place)}>{place.placeName}</div>
                      <hr className="dropdown-divider"></hr></div>
                  })}
                </div>
              </div>
            </div>}
        </div>
        <button className="button mt-5 is-success">Submit</button>
      </form>
    </div>
  </div>
}