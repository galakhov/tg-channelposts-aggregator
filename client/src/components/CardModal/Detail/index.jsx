import React from 'react'
// import ReactMarkdown from 'react-markdown'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'

// import { getCleanText, formatDate } from '~/utils'
import { getCleanText } from '~/utils'
import Tag from '~/components/Tag'
import styles from './Detail.css'

const Detail = ({ msg }) => {
  const imgSrc = _get(msg, 'preview.mark.url')
  const markContent = _get(msg, 'preview.mark.text')
  const author = _get(msg, 'preview.mark.author')
  // const date = _get(msg, 'preview.mark.date')
  const lastUpdate = _get(msg, 'preview.mark.date')
  const courseUrl = _get(msg, 'preview.courseUrl') || _get(msg, 'preview.url')
  let keywords = _get(msg, 'preview.mark.keywords')
  if (keywords) {
    keywords = keywords.split(', ')
  }

  const onTagClick = () => ({})

  return _isEmpty(msg) ? null : (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.msg}>
          {imgSrc && (
            <img className={styles.leadImg} src={imgSrc} alt="lead-img" />
          )}
          <div>
            <a href={courseUrl} alt="title">
              Get the course!
            </a>
          </div>
          <div
            className={styles.main}
            dangerouslySetInnerHTML={{ __html: getCleanText(msg.raw.text) }}
          />
        </div>
        <ul className={styles.tags}>
          {keywords &&
            keywords.map(tag => (
              <Tag key={tag} text={tag} onTagClick={onTagClick} />
            ))}
        </ul>
      </div>
      {markContent && (
        <div className={styles.right}>
          <h3>
            <a href={courseUrl} alt="title">
              {msg.preview.mark.title}
            </a>
          </h3>
          {author && <div>Author: {author}</div>}
          {lastUpdate && (
            <div>
              {/* {formatDate(date)} */}
              {lastUpdate}
            </div>
          )}
          {msg.preview.mark.keywords && <div>{msg.preview.mark.keywords}</div>}
          <hr />
          {/* <ReactMarkdown source={markContent} className={styles.mark} /> */}
          <div dangerouslySetInnerHTML={{ __html: markContent }} />
        </div>
      )}
    </div>
  )
}

export default Detail
