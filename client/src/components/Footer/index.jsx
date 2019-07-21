import React from 'react'
import { Link } from 'react-router-dom'

import styles from './Footer.css'

const Footer = () => (
  <footer>
    <div>
      <div>
        <Link className={styles.Link} to="/">Home</Link>
        <Link className={styles.Link} to="/about">About</Link>
      </div>
    </div>
  </footer>
)
