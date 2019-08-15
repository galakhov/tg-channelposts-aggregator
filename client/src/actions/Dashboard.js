import { showLoading, hideLoading } from 'react-redux-loading-bar'
import _filter from 'lodash/filter'
// import _includes from 'lodash/includes'
import _intersection from 'lodash/intersection'

import * as ACTION_TYPES from './types'
import Dashboard from '~/utils/api/Dashboard'

const filterByTags = dash => {
  const { posts, tags } = dash
  const tagsArray = tags.map(el => el.type)
  console.log('tags in state', tags)
  const filtered = _filter(
    posts,
    post =>
      _intersection(post.preview.courseContents.keywords.split(', '), tagsArray)
        .length > 0
  )
  console.log('these posts were filtered', filtered)
  if (filtered.length > 0) {
    return filtered
  }
}

export const getPosts = () => dispatch => {
  dispatch(showLoading())
  dispatch({ type: ACTION_TYPES.FETCHING })

  Dashboard.Posts.get()
    .then(({ data }) => {
      dispatch(hideLoading())
      dispatch({
        type: ACTION_TYPES.GET_POSTS,
        data
      })
      dispatch({ type: ACTION_TYPES.FETCHING_END })
    })
    .catch(err => {
      dispatch({ type: ACTION_TYPES.FETCHING_FAILED, err })
    })
}

const setFilteredPosts = filteredPosts => dispatch => {
  dispatch({
    type: ACTION_TYPES.SET_FILTERED_POSTS,
    filteredPosts
  })
}

export const getPostsByTag = tag => (dispatch, getState) => {
  dispatch({
    type: ACTION_TYPES.ADD_TAG,
    tag
  })
  const currentDash = getState().dashboard
  const filteredPosts = filterByTags(currentDash)
  currentDash.filteredPosts = filteredPosts
  dispatch(setFilteredPosts(filteredPosts))
  return filteredPosts
}

export const clearAllTags = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.CLEAR_TAGS
  })
}

// Modal window actions
export const openModal = _id => dispatch => {
  dispatch({
    type: ACTION_TYPES.OPEN_MODAL,
    _id
  })
}

export const closeModal = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.CLOSE_MODAL
  })
}

export const setCurrentId = id => dispatch => {
  dispatch({
    type: ACTION_TYPES.SET_CURRENT_ID,
    _id: id
  })
}

// Search component actions
export const handleSearchChange = term => dispatch => {
  dispatch({
    type: ACTION_TYPES.SET_SEARCH_TERM,
    term: term
  })
}

export const handleClearSearch = () => dispatch => {
  dispatch({
    type: ACTION_TYPES.CLEAR_SEARCH_TERM,
    term: '',
    searchResults: []
  })
}

export const handleSearch = async event => {
  event.preventDefault()
  this.setState({ isSearching: true })
  // const result = await API.graphql(
  //   graphqlOperation(searchMarkets, {
  //     filter: {
  //       or: [
  //         { name: { match: this.state.searchTerm } },
  //         //   regexp: `.*${this.state.searchTerm}.*`
  //         { owner: { match: this.state.searchTerm } },
  //         { tags: { match: this.state.searchTerm } }
  //       ]
  //     },
  //     sort: {
  //       field: 'createdAt',
  //       direction: 'desc'
  //     }
  //   })
  // )
  this.setState({
    // searchResults: result.data.searchMarkets.items,
    isSearching: false
  })
}
