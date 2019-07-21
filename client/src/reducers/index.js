import { combineReducers } from 'redux'
import { loadingBarReducer } from 'react-redux-loading-bar'

import dashboard from './Dashboard'

export default combineReducers({
  dashboard,
  loadingBar: loadingBarReducer
})
