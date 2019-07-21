import * as React from 'react'
import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'
import Logo from '~/assets/icons/logo_coupon.svg'

import styles from './Menu.css'

const Menu = ({ tags = [] }) => (
  <div className={styles.menu}>
    <div className={styles.logo}>
      <Link to="/">
        <Logo />
      </Link>
    </div>
    <ul>
      {tags.map((link, idx) => (
        <li key={idx}>
          <Link className={styles.Link} to={link.to}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
)

Menu.propTypes = {
  tags: PropTypes.array
}

export default Menu
