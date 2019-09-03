import React from 'react'
// import ReactMarkdown from 'react-markdown'
import _isEmpty from 'lodash/isEmpty'
import _get from 'lodash/get'
import _format from 'date-fns/format'
import DownArrow from '~/assets/icons/down-arrow.svg'
// import { getCleanText, formatDate } from '~/utils'
import { getCleanText } from '~/utils'
import Tag from '~/components/Tag'
import styles from './Detail.css'

const unescapeHTML = html => {
  const escapeEl = document.createElement('textarea')
  escapeEl.innerHTML = html
  return escapeEl.textContent
}

const getCourseDuration = courseDurationStr => {
  let courseDuration = null
  if (courseDurationStr && courseDurationStr !== '00:00') {
    courseDuration = courseDurationStr.split(':')
    let hours = ``
    let index = 0
    if (courseDurationStr.length > 5) {
      // course duration including hours
      hours = parseInt(courseDuration[index], 10)
      hours = hours <= 1 ? `${hours} hour ` : `${hours} hours `
    } else {
      index -= 1 // course duration excluding hours
    }
    let minutes = parseInt(courseDuration[index + 1], 10)
    minutes =
      minutes >= 1 && minutes < 2 ? `${minutes} minute` : `${minutes} minutes`
    let seconds = parseInt(courseDuration[index + 2], 10)
    seconds = seconds
      ? seconds < 2
        ? `and ${seconds} second`
        : `and ${seconds} seconds`
      : ``
    // yes, no space between hours and minutes (hours are optional)
    courseDuration = `${hours}${minutes} ${seconds}`
  }
  return courseDuration
}

const Detail = ({ post }) => {
  const imgSrc = _get(post, 'preview.courseContents.url')
  const courseContent = _get(post, 'preview.courseContents.text')
  let targetAudiences = _get(post, 'preview.courseContents.audiences')
  targetAudiences = targetAudiences
    ? `<hr><p class='detail-audience'>The course is best suited to:<br />${targetAudiences.join(
      ', '
    )}</p>`
    : ''
  const author = _get(post, 'preview.courseContents.author')
  // const date = _get(post, 'preview.courseContents.date')
  const lastUpdate = _get(post, 'preview.courseContents.date')
  const courseUrl = _get(post, 'preview.courseUrl') // || _get(post, 'preview.url')
  let keywords = _get(post, 'preview.courseContents.keywords')
  if (keywords) {
    keywords = keywords.split(', ')
  }
  let courseDurationText = _get(
    post,
    'preview.courseContents.lectures.courseLength'
  )

  const courseDuration = getCourseDuration(courseDurationText)

  const onTagClick = () => ({})

  const discounted = _get(post, 'preview.courseContents.discountInPercent')
    ? `The ${_get(post, 'preview.courseContents.discountInPercent')}% `
    : ''

  const expirationDate = _get(
    post,
    'preview.courseContents.discountExpirationDate'
  )
    ? _get(post, 'preview.courseContents.discountExpirationDate')
    : null
  const expiration =
    expirationDate !== null
      ? `${discounted}discount coupon code is valid until ${_format(
        new Date(expirationDate),
        'DD.MM.YYYY HH:mm'
      )}`
      : ''
  const freeCourse =
    _get(post, 'preview.courseContents.initialPrice') === 0
      ? 'The course is FREE of charge'
      : ''

  const hadleDownArrowClick = event => {
    event.preventDefault()
    // console.log('closest:', event.target.closest('div').getAttribute('class'))
    const parentDiv = event.target.closest('div')
    parentDiv.scroll({
      top: 820,
      behavior: 'smooth'
    })
  }

  return _isEmpty(post) ? null : (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.post}>
          {imgSrc && (
            <img className={styles.leadImg} src={imgSrc} alt="lead-img" />
          )}
          <div className={styles.downIcon}>
            <DownArrow onClick={hadleDownArrowClick} />
          </div>
          <div className={styles.link}>
            <div className={styles.expirationDateModal}>
              {expiration || freeCourse}
            </div>
            <a target="_blank" href={courseUrl} alt="title">
              Join the course!
            </a>
            {courseDuration && courseDuration !== null && (
              <div className={styles.courseDuration}>
                {courseDuration} of contents
              </div>
            )}
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
          <div
            className={styles.courseContent}
            dangerouslySetInnerHTML={{ __html: unescapeHTML(courseContent) }}
          />
        </div>
      )}
    </div>
  )
}

export default Detail
