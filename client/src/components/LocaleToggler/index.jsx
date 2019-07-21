import React from 'react'

import { getLanguage, setLanguage } from '~/utils'

class LocaleToggler extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      locale: getLanguage()
    }
  }

  onLocaleChange = (e) => {
    const locale = e.target.value
    setLanguage(locale)
  }

  render () {
    return (
      <span>
        <select onChange={this.onLocaleChange} value={this.state.locale}>
          <option value="zh-hk">HK</option>
          <option value="zh-cn">CN</option>
          <option value="en">EN</option>
        </select>
      </span>
    )
  }
}

export default LocaleToggler
