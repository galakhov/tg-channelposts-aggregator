import * as ACTION_TYPES from '~/actions/types'
import _uniq from 'lodash/uniq'

const initialState = {
  isFetching: false,
  isModalOpen: false,
  currentPostId: '',
  posts: [],
  tags: [],
  filteredPosts: [],
  errorMessage: '',
  isSearching: false,
  currentSearchTerm: '',
  currentSearchResults: [],
  currentSearchResultsCount: 0
}

const addTagFilter = (state, newTag) => {
  const currentState = state.tags.map(t => t.type)
  if (!currentState.includes(newTag.type)) {
    return _uniq(state.tags.concat(newTag))
  }
  return state.tags
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ACTION_TYPES.GET_POSTS:
      return {
        ...state,
        posts: action.data
      }
    case ACTION_TYPES.SET_FILTERED_POSTS:
      return {
        ...state,
        filteredPosts: action.filteredPosts ? action.filteredPosts : []
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
    case ACTION_TYPES.FETCHING_FAILED:
      return {
        ...state,
        isFetching: false,
        errorMessage: action.err
      }
    case ACTION_TYPES.ADD_TAG:
      return {
        ...state,
        tags: addTagFilter(state, action.tag)
      }
    case ACTION_TYPES.CLEAR_TAGS: {
      return {
        ...state,
        filteredPosts: [],
        tags: []
      }
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
    case ACTION_TYPES.SEARCHING:
      return {
        ...state,
        isSearching: true
      }
    case ACTION_TYPES.SEARCHING_END:
      return {
        ...state,
        isSearching: false
      }
    case ACTION_TYPES.SEARCHING_FAILED:
      return {
        ...state,
        isSearching: false,
        errorMessage: action.err
      }
    case ACTION_TYPES.CLEAR_SEARCH_TERM:
      return {
        ...state,
        currentSearchTerm: action.term,
        currentSearchResults: action.searchResults,
        currentSearchResultsCount: action.searchResultsCount
      }
    case ACTION_TYPES.SET_SEARCH_TERM:
      return {
        ...state,
        currentSearchTerm: action.term
      }
    case ACTION_TYPES.SET_SEARCH_RESULTS:
      return {
        ...state,
        currentSearchResults: action.elasticResults,
        currentSearchResultsCount: action.elasticResultsCount
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
