import React from 'react'
import classnames from 'classnames/bind'

import styles from './ToggleButton.css'
const cx = classnames.bind(styles)

const ToggleButton = ({ showClose, color = 'bright' }) => (
  <label className={cx('toggle', { showClose })}>
    <b className={cx('bar')} />
    <b className={cx('bar')} />
    <b className={cx('bar')} />
    <b className={cx('bar')} />
  </label>
)

export default ToggleButton
