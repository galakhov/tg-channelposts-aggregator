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
  let targetAudiences = _get(post, 'preview.courseContents.audiences')
  targetAudiences = targetAudiences
    ? `<hr><p class='detail-audience'>The course suits the best for:<br /><hr>${targetAudiences.join(
      ', '
    )}</p>`
    : ''
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
          <div className={styles.link}>
            <a target="_blank" href={courseUrl} alt="title">
              Get the course!
            </a>
          </div>
          <div className={styles.headline}>
            <h3>
              {post.preview
                ? post.preview.courseContents
                  ? post.preview.courseContents.headline
                  : ''
                : ''}
            </h3>
          </div>
          <div
            className={styles.main}
            dangerouslySetInnerHTML={{
              __html: getCleanText(targetAudiences)
            }}
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
            <a target="_blank" href={courseUrl} alt="title">
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
