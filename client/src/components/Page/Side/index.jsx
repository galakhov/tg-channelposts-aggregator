import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames/bind'

import styles from './Side.css'
const cx = classnames.bind(styles)

const Side = ({ className, children }) =>
  <aside className={cx('page-side', className)}>
    {children}
  </aside>

Side.propTypes = {
  className: PropTypes.string
}

export default Side
