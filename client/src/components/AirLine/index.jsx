import React from 'react'
import classnames from 'classnames/bind'

import styles from './AirLine.css'

const cx = classnames.bind(styles)

class AirLine extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className={cx('container', { open: this.props.open })}>
        AirLine
      </div>
    )
  }
}

export default AirLine
