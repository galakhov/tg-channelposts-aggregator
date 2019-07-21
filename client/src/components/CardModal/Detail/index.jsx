import React from 'react'
import ReactMarkdown from 'react-markdown'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'

import { getCleanText, formatDate } from '~/utils'
import Tag from '~/components/Tag'
import styles from './Detail.css'

const Detail = ({ msg }) => {
  const imgSrc = _get(msg, 'preview.mercury.lead_image_url')
  const markContent = _get(msg, 'preview.mark.text')
  const author = _get(msg, 'preview.mark.author')
  const date = _get(msg, 'preview.mark.date')

  const onTagClick = () => ({})

  return _isEmpty(msg) ? null : (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.msg}>
          {imgSrc && (
            <img className={styles.leadImg} src={imgSrc} alt="lead-img" />
          )}
          <div
            className={styles.main}
            dangerouslySetInnerHTML={{ __html: getCleanText(msg.raw.text) }}
          />
        </div>
        <ul className={styles.tags}>
          {msg.tags.map(tag => (
            <Tag key={tag} text={tag} onTagClick={onTagClick} />
          ))}
        </ul>
      </div>
      {markContent && (
        <div className={styles.right}>
          <h3>
            <a href={msg.preview.mark.url} alt="title">
              {msg.preview.mark.title}
            </a>
          </h3>
          {author && <div>Author: {author}</div>}
          {date && <div>Date: {formatDate(date)}</div>}
          {msg.preview.mark.keywords && <div>{msg.preview.mark.keywords}</div>}
          <hr />
          <ReactMarkdown source={markContent} className={styles.mark} />
        </div>
      )}
    </div>
  )
}

export default Detail
