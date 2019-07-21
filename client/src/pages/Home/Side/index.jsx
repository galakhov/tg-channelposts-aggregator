import React from 'react'

import _format from 'date-fns/format'
import styles from './Side.css'

const Side = ({ msgs }) => (
  <div className={styles.wrapper}>
    <ul>
      {msgs && msgs.map((msg, idx) => (
        <li key={idx} className={styles.card}>
          <span className={styles.date}>
            {_format(new Date(msg.created_date), 'YYMMDD')}
          </span>
          <span className={styles.intro}>
            {msg.tags && msg.tags.join(' ')}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

export default Side
