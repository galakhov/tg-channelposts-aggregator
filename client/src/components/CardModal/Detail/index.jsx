import React from 'react'
// import ReactMarkdown from 'react-markdown'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'

// import { getCleanText, formatDate } from '~/utils'
import { getCleanText } from '~/utils'
import Tag from '~/components/Tag'
import styles from './Detail.css'

const Detail = ({ post }) => {
  const imgSrc = _get(post, 'preview.courseContents.url')
  const courseContent = _get(post, 'preview.courseContents.text')
  const author = _get(post, 'preview.courseContents.author')
  // const date = _get(post, 'preview.courseContents.date')
  const lastUpdate = _get(post, 'preview.courseContents.date')
  const courseUrl = _get(post, 'preview.courseUrl') || _get(post, 'preview.url')
  let keywords = _get(post, 'preview.courseContents.keywords')
  if (keywords) {
    keywords = keywords.split(', ')
  }

  const onTagClick = () => ({})

  return _isEmpty(post) ? null : (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.post}>
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
            dangerouslySetInnerHTML={{ __html: getCleanText(post.raw.text) }}
          />
        </div>
        <ul className={styles.tags}>
          {keywords &&
            keywords.map(tag => (
              <Tag key={tag} text={tag} onTagClick={onTagClick} />
            ))}
        </ul>
      </div>
      {courseContent && (
        <div className={styles.right}>
          <h3>
            <a href={courseUrl} alt="title">
              {post.preview.courseContents.title}
            </a>
          </h3>
          {author && <div>Author: {author}</div>}
          {lastUpdate && (
            <div>
              {/* {formatDate(date)} */}
              {lastUpdate}
            </div>
          )}
          {post.preview.courseContents.keywords && (
            <div>{post.preview.courseContents.keywords}</div>
          )}
          <hr />
          {/* <ReactMarkdown source={courseContent} className={styles.course} /> */}
          <div dangerouslySetInnerHTML={{ __html: courseContent }} />
        </div>
      )}
    </div>
  )
}

export default Detail
