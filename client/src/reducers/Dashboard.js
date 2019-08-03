import * as ACTION_TYPES from '~/actions/types'
import _uniq from 'lodash/uniq'

const initialState = {
  isFetching: false,
  isModalOpen: false,
  currentPostId: '',
  posts: [],
  tags: [],
  filteredPosts: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_POSTS:
      return {
        ...state,
        posts: action.data
      }
    case ACTION_TYPES.FETCHING:
      return {
        ...state,
        isFetching: true
      }
    case ACTION_TYPES.FETCHING_END:
      return {
        ...state,
        isFetching: false
      }
    case ACTION_TYPES.ADD_TAG:
      return {
        ...state,
        tags: _uniq(state.tags.concat(action.tag))
      }
    case ACTION_TYPES.REMOVE_TAG:
      return {
        ...state,
        tags: state.tags.filter(tag => tag !== action.tag)
      }
    case ACTION_TYPES.SET_CURRENT_ID:
      return {
        ...state,
        currentPostId: action._id
      }
    case ACTION_TYPES.OPEN_MODAL:
      return {
        ...state,
        isModalOpen: true,
        currentPostId: action._id
      }
    case ACTION_TYPES.CLOSE_MODAL:
      return {
        ...state,
        isModalOpen: false
      }
    default:
      return state
  }
}
