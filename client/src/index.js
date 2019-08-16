// React 16 global polyfill for IE < 11
import 'core-js/es6/map'
import 'core-js/es6/set'
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import * as React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'

import store from '~/store'
import App from './App'

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)
