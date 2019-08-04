import React from 'react'
import classnames from 'classnames/bind'

import styles from './Tag.css'
const cx = classnames.bind(styles)

const Tag = ({ text, onTagClick }) => (
  <li className={styles.container} onClick={() => onTagClick(text)}>
    <a className={cx('tag', 'primaryColor')}>{text}</a>
  </li>
)

export default Tag
