import { showLoading, hideLoading } from 'react-redux-loading-bar'
import _filter from 'lodash/filter'
// import _includes from 'lodash/includes'
import _intersection from 'lodash/intersection'
import elasticClient from '~/services/search/elasticsearch.js'
import SearchService from '~/services/search/index.js'
import * as ACTION_TYPES from './types'
import Dashboard from '~/utils/api/Dashboard'

const filterByTags = dash => {
  const { posts, tags } = dash
  const tagsArray = tags.map(el => el.type)
  console.log('tags in the global state', tags)
  const filtered = _filter(
    posts,
    post =>
      _intersection(post.preview.courseContents.keywords.split(', '), tagsArray)
        .length > 0
  )
  // console.log('these posts were filtered', filtered)
  if (filtered.length > 0) {
    return filtered
  }
}

const search = async (term, start, limit) => {
  const searchService = new SearchService(elasticClient)
  console.log('-------- async: search -> term', term)
  const results = await searchService.find(term, start, limit)
  // const elasticResults = results.hits.hits.map(res => res._id)
  return results
}

export const getPostsCount = () => dispatch => {
  Dashboard.Posts.count()
    .then(({ data }) => {
      dispatch({
        type: ACTION_TYPES.GET_POSTS_COUNT,
        data
      })
    })
    .catch(err => {
      console.log(`GET_POSTS_COUNT_FAILED:\n${err}`)
    })
}

export const getPosts = (skip, limit) => dispatch => {
  dispatch(showLoading())
  dispatch({ type: ACTION_TYPES.FETCHING })

  Dashboard.Posts.get(skip, limit)
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
    searchResults: [],
    searchResultsCount: 0
  })
}

export const handleSearch = event => (dispatch, getState) => {
  event.preventDefault()
  const currentDash = getState().dashboard

  dispatch({
    type: ACTION_TYPES.SEARCHING,
    isSearching: true
  })

  const start = 0
  const limit = 50
  const term = currentDash.currentSearchTerm

  try {
    const searchResults = async () => {
      const result = await search(term, start, limit)
      // console.log(`handleSearch ES response:\n${result}`)
      dispatch({
        type: ACTION_TYPES.SET_SEARCH_RESULTS,
        elasticResults: result.hits.hits,
        elasticResultsCount: result.hits.total.value
      })
      dispatch({
        type: ACTION_TYPES.SEARCHING_END,
        isSearching: false
      })
    }
    searchResults()
  } catch (e) {
    dispatch({
      type: ACTION_TYPES.SEARCHING_FAILED,
      isSearching: false
    })
  }
}
