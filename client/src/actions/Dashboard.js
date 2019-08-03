import { showLoading, hideLoading } from 'react-redux-loading-bar'
import _filter from 'lodash/filter'
// import _includes from 'lodash/includes'
import _intersection from 'lodash/intersection'

import * as ACTION_TYPES from './types'
import Dashboard from '~/utils/api/Dashboard'

const filterByTags = (dash, dispatch) => {
  const { posts, tags } = dash
  const filtered = _filter(
    posts,
    post =>
      _intersection(post.preview.courseContents.keywords.split(', '), tags)
        .length > 0
  )
  console.log('these posts were filtered', filtered)
}

export const getPosts = () => dispatch => {
  dispatch(showLoading())
  dispatch({ type: ACTION_TYPES.FETCHING })

  Dashboard.Posts.get().then(({ data }) => {
    dispatch(hideLoading())
    dispatch({ type: ACTION_TYPES.FETCHING_END })
    dispatch({
      type: ACTION_TYPES.GET_POSTS,
      data
    })
  })
}

export const addTag = tag => (dispatch, getState) => {
  dispatch({
    type: ACTION_TYPES.ADD_TAG,
    tag
  })

  const currentDash = getState().dashboard
  filterByTags(currentDash, dispatch)
}

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
