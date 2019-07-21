import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames/bind'

import styles from './Row.css'
const cx = classnames.bind(styles)

const Row = ({ className, children }) =>
  <div className={cx('page-row', className)}>
    {children}
  </div>

Row.propTypes = {
  className: PropTypes.string
}

export default Row
