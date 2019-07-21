import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames/bind'

import styles from './Main.css'
const cx = classnames.bind(styles)

const Main = ({ className, children }) =>
  <main className={cx('page-main', className)}>
    {children}
  </main>

Main.propTypes = {
  className: PropTypes.string
}

export default Main
