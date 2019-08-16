import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

import reducers from '~/reducers'

const enhancers = []
const middleware = [thunk]

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__
  middleware.push(createLogger())

  if (typeof devToolsExtension === 'function') {
    // enhancers.push(devToolsExtension())
    enhancers.push(devToolsExtension())
  }
}

const composeEnhances = compose(
  applyMiddleware(...middleware),
  ...enhancers
)
/* eslint-disable no-underscore-dangle */
export default createStore(
  reducers,
  composeEnhances
  /* process.env.NODE_ENV === 'development'
    ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    : '' */
)
/* eslint-enable */
