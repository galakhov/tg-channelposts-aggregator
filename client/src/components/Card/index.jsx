import React from 'react'

import _format from 'date-fns/format'
import styles from './Card.css'

const createMarkup = text => {
  return { __html: text }
}

const Card = ({ _id, onCardClick, createdDate, img, text, tags }) => (
  <div className={styles.card} onClick={() => onCardClick(_id)}>
    <div className={styles.breadcrumbs}>
      {_format(new Date(createdDate), 'DD.MM.YYYY HH:mm')}
    </div>
    {img && (
      <div className={styles.leadImg}>
        <img src={img} alt="lead-img" />
      </div>
    )}
    <div className={styles.main} dangerouslySetInnerHTML={createMarkup(text)} />
    <ul className={styles.tags}>
      {tags &&
        tags.map((tag, idx) => (
          <li key={idx}>
            <a href="/">{tag}</a>
          </li>
        ))}
    </ul>
  </div>
)

export default Card
