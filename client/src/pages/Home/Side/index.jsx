import React from 'react'

import _format from 'date-fns/format'
import styles from './Side.css'

const Side = ({ posts }) => (
  <div className={styles.wrapper}>
    <ul>
      {posts &&
        posts.map((post, idx) => (
          <li key={idx} className={styles.card}>
            <span className={styles.date}>
              {_format(new Date(post.created_date), 'YYMMDD')}
            </span>
            <span className={styles.intro}>
              {post.tags && post.tags.join(' ')}
            </span>
          </li>
        ))}
    </ul>
  </div>
)

export default Side
