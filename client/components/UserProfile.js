import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { isCreator, getLoggedInUserId } from '../lib/auth.js'
import { buildStyles, CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function UserProfile({ match, history }) {

  const [profile, updateProfile] = useState([])
  const [loading, updateLoading] = useState(true)
  const [positiveRating, updatePositiveRating] = useState(0)
  const [negativeRating, updateNegativeRating] = useState(0)
  const [rated, updateRated] = useState(false)
  const [currentUser, updateCurrentUser] = useState([])
  const [commentData, updateCommentData] = useState({
    content: '',
    positive_rating: false,
    negative_rating: false
  })
  const token = localStorage.getItem('token')

  const userId = match.params.userId

  async function fetchData() {
    const { data } = await axios.get(`/api/users/${userId}`)
    updateProfile(data)
    const totalRatings = data.positive_rating + data.negative_rating
    const positivePercent = data.positive_rating / totalRatings * 100
    const negativePercent = data.negative_rating / totalRatings * 100
    updatePositiveRating(positivePercent)
    updateNegativeRating(negativePercent)
    updateLoading(false)
  }


  async function fetchCurrentUser() {
    const token = localStorage.getItem('token')
    try {
      const { data } = await axios.get('/api/current_user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateCurrentUser(data)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  useEffect(() => {
    fetchData()
    fetchCurrentUser()
  }, [])

  async function handleDelete() {
    await axios.delete(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    history.push('/')
  }

  async function handleFollow() {
    try {
      await axios.post(`/api/users/${currentUser['id']}/users/${userId}`)
    } catch (err) {
      console.log(err.response.data)
    }
  }

  async function handlePositive() {
    console.log(rating)
    updateRated(true)
  }

  async function handleNegative() {
    console.log(rating)
    updateRated(true)
  }

  function mapWishlist(itemArray) {
    const limitedItems = itemArray.slice(0, 9)
    console.log(limitedItems)
    return limitedItems.map((item, i) => {
      return <div className="column is-one-third" key={i}>
        <Link to={`/items/${item.id}`}>
          
            <div className="thumbnail-container" style={{
              width: '33%',
              height: '33%',
              backgroundImage: `url(${item.image})`
            }}>
              

             
           
            </div>
          
        </Link>
      </div>
    })
  }


  function handleCommentChange(event) {
    updateCommentData({ ...commentData, [event.target.name]: event.target.value })
  }

  async function handleCommentSubmit(event) {
    event.preventDefault()
    const newCommentData = {
      ...commentData
    }
    try {
      const { data } = await axios.post(`/api/users/${userId}/comments`, newCommentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        })
      history.push(`/users/${userId}`)
    } catch (err) {
      console.log(err.response.data)
    }
  }


  if (loading) {
    return <div>Page is Loading</div>
  }

  console.log(profile.follows)

  return <div className="main">

    <div className="container">

      {/*
    // * TITLE SECTION
    */}

      <section className="hero is-dark is-small">
        <div className="hero-body banner-with-image" style={{
          backgroundImage: `url(${profile.image})`,
          backgroundSize: 'cover'
        }}>
          <div className="container has-text-centered">
            <div className="banner-profile-image-container">
              <img src={profile.profile_image} />
            </div>
            <div className="banner-text">
              <p>{profile.username}</p>
            </div>
          </div>
        </div>

        {/*
        // * NAVBAR SECTION
        */}

        <div className="hero-foot">
          <nav className="tabs is-boxed is-fullwidth">
            <div className="container">
              <ul>
                <li className="is-active">
                  <a>Profile</a>
                </li>
                <li>
                  <a>Up for Baggle</a>
                </li>
                <li>
                  <a>Wishlist</a>
                </li>
                <li>
                  <a>Followers</a>
                </li>
                <li>
                  <a>Following</a>
                </li>
                <li><a>Edit Profile</a></li>
                <li><a>Delete Profile</a></li>
                <li><a>Follow</a></li>
                <li><a>Contact</a></li>
              </ul>
            </div>
          </nav>
        </div>
      </section>

      {/*
        // * BODY SECTION
      */}

      <section className="section">
        <div className="columns">

          <div className="column">

            {/*
            // * ABOUT SECTION
            */}

            <div className="tile box">
              <div className="contents">
                <h2 className="title">About</h2>
                <p>Information about user goes here</p>
                <div className="contents">
                  <label>Username</label>
                  <p>{profile.username}</p>
                  <label>Location</label>
                  <p>{profile.location}</p>
                  <label>Bio</label>
                  <p>{profile.bio}</p>
                  {profile.created_at && <p>Baggling since {profile.created_at}</p>}
                </div>
              </div>
              <div className="contents">
                <div style={{ width: "200px" }}>
                  <CircularProgressbarWithChildren
                    value={positiveRating}
                    strokeWidth={8}
                    styles={buildStyles({
                      pathColor: "#2B9D14",
                      trailColor: "transparent"
                    })}
                  >
                    <div style={{ width: "84%" }}>
                      <CircularProgressbar
                        value={negativeRating}
                        styles={buildStyles({
                          trailColor: "transparent",
                          pathColor: "#EC2B0C"
                        })}
                      />
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                {positiveRating < 50 && <div>{profile.username} is a bad Baggler!</div>}
                {positiveRating >= 50 && positiveRating < 70 && <div>{profile.username} is rated Neutral</div>}
                {positiveRating >= 70 && positiveRating < 95 && <div>{profile.username} is rated Good</div>}
                {positiveRating >= 95 && <div>{profile.username} is a Top Baggler</div>}
              </div>
            </div>

            <div className="tile box is-vertical">
              <div className="contents">
                <h2 className="title">Wishlist</h2>
                <hr />
                <div className="contents">

                  {/*
            // * WISHLIST SECTION
            */}

                  <div className="container"></div>
                    <h1>Your wishlist</h1>
                    <div className="grid-container">
                    <div className="columns is-multiline">
                      {mapWishlist(profile.wishlist)}
                    </div>
                    </div>
                  

                </div>
              </div>
            </div>
            <div className="tile box">
              <div className="contents">
                <h2 className="title">Following</h2>
                <hr />
                <p>Information about follows goes here</p>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="tile box">
              <div className="contents">
                <h2 className="title">Inventory</h2>
                <hr />
                <p>Information about inventory goes here</p>
              </div>
            </div>
            <div className="tile box">
              <div className="contents">
                <h2 className="title">Reviews</h2>
                <hr />
                <p>user reviews go here</p>
              </div>
            </div>
          </div>

        </div>
      </section>



      <section className="section">
        <div className="container">
          <h1>User Profile</h1>
        </div>
      </section>

      {/*
    // * BODY SECTION
    */}

      <section className="section">
        <button className="button" onClick={handleDelete}>Delete profile</button>
        <button className="button">Update profile</button>

        <div className="container">
          <div className="avatar-container">
            <img src={profile.profile_image} />
          </div>
          <div className="container">
            <p>This Baggler is rated Good</p>
            <p>Baggler: {profile.username}</p>
            <p>Bio: {profile.bio}</p>
            <p>Location: {profile.location}</p>
            <p>Rating: {profile.rating}</p>
            <p>Number of Baggles:{profile.barter_number}</p>
            <p>Successful Baggles:{profile.successful_trans}</p>
            <p>Bungled Baggles:{profile.failed_trans}</p>
          </div>
        </div>
        {currentUser['id'] !== userId && <button className="button" onClick={handleFollow}>Follow {profile.username}</button>}

      </section>

      {/*
    // * INVENTORY SECTION
    */}

      <section className="section">
        <div className="container">
          <h1>Up for baggle</h1>
          <div className="columns is-multiline">
            {profile.inventory.map((item) => {
              return <div className="column is-one-quarter" key={item.id}>
                <Link to={`/items/${item.id}`}>
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={item.image} />
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content"></div>
                      <p>{item.name}</p>
                      <p>{item.typeof}</p>
                      <p>{item.category}</p>
                      <p>Posted {item.created_at}</p>
                      <p>Wishlists: {item.wishlisted}</p>
                      <p>Comments: {item.comments.length}</p>
                    </div>
                  </div>
                </Link>
              </div>
            })}
          </div>
        </div>
      </section>

      {/*
    // * WISHLIST SECTION
    */}

      <section className="section">
        <div className="container">
          <h1>Your wishlist</h1>
          <div className="columns is-multiline">
            {profile.wishlist.map((item) => {
              return <div className="column is-one-quarter" key={item.id}>
                <Link to={`/items/${item.id}`}>
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={item.image} />
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content"></div>
                      <p>{item.name}</p>
                      <p>Belongs to {item.owner.username}</p>
                      <p>Located {item.owner.location}</p>
                      <p>Posted {item.created_at}</p>
                      <p>{item.category}</p>
                      <p>Wishlists: {item.wishlisted}</p>
                      <p>Comments: {item.comments.length}</p>
                    </div>
                  </div>
                </Link>
              </div>
            })}
          </div>
        </div>
      </section>

      {/*
    // * FOLLOWED USER SECTION
    */}

      <section className="section">
        <div className="container">
          <h1>Bagglers you follow</h1>
          <div className="columns is-multiline">
            {profile.follows.map((follow) => {
              return <div className="column is-one-quarter" key={follow.id}>
                <Link to={`/users/${follow.id}`}>
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={follow.profile_image} />
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content"></div>
                      <p>{follow.username}</p>
                      <p>Located {follow.location}</p>
                      <p>Rating {follow.rating}</p>
                    </div>
                  </div>
                </Link>
              </div>
            })}
          </div>
        </div>
      </section>

      {/*
    // * FOLLOWER SECTION
    */}

      <section className="section">
        <div className="container">
          <h1>Bagglers who follow you</h1>
          <div className="columns is-multiline">
            {profile.followers.map((follower) => {
              return <div className="column is-one-quarter" key={follower.id}>
                <Link to={`/users/${follower.id}`}>
                  <div className="card">
                    <div className="card-image">
                      <figure className="image is-4by3">
                        <img src={follower.profile_image} />
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content"></div>
                      <p>{follower.username}</p>
                      <p>Located {follower.location}</p>
                      <p>Rating {follower.rating}</p>
                    </div>
                  </div>
                </Link>
              </div>
            })}
          </div>
        </div>
      </section>


      {/*
    // * COMMENTS SECTION
    */}

      <section className="section">
        <button className="button" onClick={handlePositive}>Give positive feedback</button>
        <button className="button" onClick={handleNegative}>Give negative feedback</button>
        <div>



        </div>
        <h1>{profile.username}'s Baggle board</h1>
        <h2>Submit a comment or review</h2>
        {profile.comments.map(comment => {
          return <article key={comment.id} className="media">
            <div className="media-content">
              <div className="content">
                <p className="title">{comment.user.username}</p>
                <p className="text">{comment.created_at}</p>
                <p className="text">{comment.content}</p>
              </div>
            </div>

            <div className="container">
              <button className="button">Delete Comment</button>
              <button className="button">Edit Comment</button>
            </div>
          </article>
        })}

        <article className="media">
          <div className="media-content">
            <div className="field">
              <p className="control">
                <textarea
                  className="textarea"
                  placeholder="Make a comment..."
                  onChange={handleCommentChange}
                  value={commentData.content}
                  name={'content'}
                />
              </p>
            </div>
            <div className="field">
              <p className="control">
                <button
                  onClick={handleCommentSubmit}
                  className="button is-info"
                >
                  Submit
              </button>
              </p>
            </div>
          </div>
        </article>
      </section>

      <div className="container">
        <div className="contents" style={{ height: '200px' }}>



          <div style={{ width: "200px" }}>
            <CircularProgressbarWithChildren
              value={positiveRating}
              strokeWidth={8}
              styles={buildStyles({
                pathColor: "#2B9D14",
                trailColor: "transparent"
              })}
            >
              {/*
          Width here needs to be (100 - 2 * strokeWidth)% 
          in order to fit exactly inside the outer progressbar.
        */}
              <div style={{ width: "84%" }}>
                <CircularProgressbar
                  value={negativeRating}
                  styles={buildStyles({
                    trailColor: "transparent",
                    pathColor: "#EC2B0C"
                  })}
                />
              </div>
            </CircularProgressbarWithChildren>
          </div>
          {positiveRating < 50 && <div>This is a bad Baggler!</div>}
          {positiveRating >= 50 && positiveRating < 70 && <div>This Baggler is rated Neutral</div>}
          {positiveRating >= 70 && positiveRating < 95 && <div>This Baggler is rated Good</div>}
          {positiveRating >= 95 && <div>This is a Top Baggler</div>}
        </div>
      </div>

      <section className="section">
        <h1>Profile Page Contents:</h1>
        <ul>
          <li>Avatar</li>
          <li>Bio</li>
          <li>Location</li>
          <li>Inventory - public items only if not logged in user</li>
          <li>Followed users - logged in user only</li>
          <li>Item watchlist - logged in user only</li>
          <li>Previous items provided - if items were public show all, otherwise logged in user</li>
          <li>Previous items received - logged in user only</li>

        </ul>
      </section>

    </div>
  </div>

}