import React from 'react'
import LoadingBar from 'react-redux-loading-bar'
import { colors } from '~/styles/vars'
import { Switch, Route, Redirect } from 'react-router-dom'
import routes from '~/routes'

import './styles/main.css'

class App extends React.Component {
  render () {
    return (
      <div id="mainApp">
        <header>
          <LoadingBar
            style={{
              backgroundColor: colors.actionColor,
              height: '5px'
            }}
          />
        </header>
        <Switch>
          {routes.map((route, key) => (
            <Route key={key} {...route} />
          ))}
          <Redirect from="*" to="/" />
        </Switch>
      </div>
    )
  }
}

export default App
