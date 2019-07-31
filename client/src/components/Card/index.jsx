import React from 'react'

import _format from 'date-fns/format'
import styles from './Card.css'

const createMarkup = text => {
  return { __html: text }
}

let tagsArray

const Card = ({
  _id,
  onCardClick,
  createdDate,
  img,
  text,
  headline,
  tags,
  nr
}) => {
  if (tags && typeof tags === 'string') {
    tagsArray = tags.split(', ')
  } else {
    tagsArray = tags
  }

  return (
    <div className={styles.card} onClick={() => onCardClick(_id)}>
      {img && (
        <div className={styles.leadImg}>
          <img src={img} alt="lead-img" />
        </div>
      )}
      <div className={styles.breadcrumbs}>
        {_format(new Date(createdDate), 'DD.MM.YYYY HH:mm')}
      </div>
      <div
        className={styles.main}
        dangerouslySetInnerHTML={createMarkup(`<h2>${text}</h2>`)}
      />
      <div
        className={styles.headline}
        dangerouslySetInnerHTML={createMarkup(`<h3>${headline}</h3>`)}
      />

      <ul className={styles.tags}>
        {tagsArray &&
          tagsArray.map((tag, idx) =>
            tag !== 'untagged' ? (
              <li key={idx}>
                <a href="/">{tag}</a>
              </li>
            ) : (
              ''
            )
          )}
      </ul>
      <div className={styles.cardNumber}>
        <p>{nr ? `- ${nr} -` : ''}</p>
      </div>
    </div>
  )
}
export default Card
