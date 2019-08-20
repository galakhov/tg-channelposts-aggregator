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
  rating,
  studentsEnrolled,
  expirationDate,
  discount,
  listPrice,
  currentPrice,
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

  const discounted =
    discount && discount !== null
      ? `${discount}% OFF`
      : listPrice > 0 ||
        listPrice === 'undefined' ||
        (currentPrice && currentPrice <= 0)
        ? `100% OFF`
        : `99.9% OFF`

  const expiration =
    expirationDate !== null
      ? `Coupon code is valid until ${_format(
        new Date(expirationDate),
        'DD.MM.YYYY HH:mm'
      )}`
      : ''
  const freeCourse =
    listPrice === 0
      ? 'FREE'
      : currentPrice !== undefined && currentPrice > 0
        ? `Coupon expired: ${currentPrice}€`
        : ''

  const addedOnDate = createdDate
    ? `Coupon added on ${_format(new Date(createdDate), 'DD.MM.YYYY HH:mm')}`
    : ''

  const courseRating =
    rating && rating !== null
      ? rating.length > 3
        ? rating.substr(0, 3)
        : rating
      : null
  const courseStudentsNr = studentsEnrolled !== null ? studentsEnrolled : null

  let studentsEnrolledCleared =
    courseStudentsNr && courseStudentsNr !== null
      ? studentsEnrolled.replace(/(\\n)/g, '')
      : courseStudentsNr
  const startEnrolledText = courseStudentsNr
    ? courseStudentsNr.indexOf(' students enrolled')
    : -1
  if (
    courseStudentsNr &&
    courseStudentsNr !== null &&
    startEnrolledText !== -1
  ) {
    // studentsEnrolledCleared.substring(0, startEnrolledText + 18)
    studentsEnrolledCleared = studentsEnrolledCleared.replace(
      ' students enrolled',
      ''
    )
  } else {
    // is there still some crappy string? Replace it.
    studentsEnrolledCleared = studentsEnrolledCleared
      ? (studentsEnrolledCleared = studentsEnrolledCleared.replace(
        ' students',
        ''
      ))
      : courseStudentsNr
  }
  studentsEnrolledCleared += ` students joined`

  return (
    <div className={styles.card} onClick={() => onCardClick(_id)}>
      {img && (
        <div className={styles.leadImg}>
          <img src={img} alt="lead-img" />
        </div>
      )}
      <div className={styles.breadcrumbs}>
        <div className={styles.courseStats}>
          {courseStudentsNr !== null && (
            <div className={styles.courseStudents}>
              {studentsEnrolledCleared}
            </div>
          )}
          {courseRating && courseRating !== null && courseRating !== '0.0' && (
            <div className={styles.courseRating}>Rating: {courseRating}/5</div>
          )}
        </div>
        {(expirationDate && discounted !== null && expirationDate !== '') ||
        freeCourse === '' ? (
            <div className={styles.expirationDate}>
              <div className={styles.couponOff}>{discounted}</div> {expiration}
            </div>
          ) : (
            <div className={styles.expirationDate}>
              <div className={styles.couponOff}>{freeCourse}</div>
            </div>
          )}
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
              tagsArray.length === idx + 1 ? (
                <li key={idx}>{`${tag}`}</li>
              ) : (
                <li className={styles.nextTag} key={idx}>{`${tag}, `}</li>
              )
            ) : (
              ''
            )
          )}
      </ul>
      <div className={styles.addedDate}>{addedOnDate}</div>
      <div className={styles.cardNumber}>
        <p>{nr + 1 ? `- ${nr + 1} -` : ''}</p>
      </div>
    </div>
  )
}
export default Card
