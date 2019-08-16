import React from 'react'
import StackGrid from 'react-stack-grid'
import _get from 'lodash/get'

import { getCleanText } from '~/utils'
import Card from '~/components/Card'
import Spinner from '~/assets/icons/spinning-wheel.svg'
import styles from './Posts.css'

class Posts extends React.Component {
  // constructor (props) {
  //   super(props)
  // }

  render () {
    const { posts, openModal, searchResults, searchResultsCount } = this.props
    return searchResults && searchResults.length > 0 ? (
      <div className={styles.wrapper}>
        <div className="spinning-wheel">
          {searchResults.length === 0 && <Spinner className={styles.spinner} />}
        </div>
        {searchResultsCount && searchResultsCount > 0 && (
          <div className="search-results">
            <h5 className={styles.searchResultsCount}>
              Courses found: {searchResultsCount}
            </h5>
            <StackGrid columnWidth={340} gutterWidth={40} gutterHeight={20}>
              {
                // searchResults // &&
                ((console.log('searchResultsCount', searchResultsCount),
                  console.log('searchResults received: ', searchResults)),
                  searchResults &&
                  searchResults.map((post, index) => {
                    return (
                      <Card
                        key={post._id}
                        _id={post._id}
                        createdDate={post._source.created_date}
                        onCardClick={openModal}
                        text={getCleanText(
                          post._source.preview.courseContents.title
                            ? post._source.preview.courseContents.title
                            : 'Udemy Course'
                        )}
                        headline={
                          post._source.preview.courseContents.headline
                            ? post._source.preview.courseContents.headline
                            : ''
                        }
                        img={
                          post._source.preview.courseContents.url
                            ? post._source.preview.courseContents.url
                            : ''
                        }
                        tags={
                          post._source.preview.courseContents.keywords
                            ? post._source.preview.courseContents.keywords
                            : ''
                        }
                        discount={
                          post._source.preview.courseContents.discountInPercent
                            ? post._source.preview.courseContents
                              .discountInPercent
                            : null
                        }
                        expirationDate={
                          post._source.preview.courseContents
                            .discountExpirationDate
                            ? post._source.preview.courseContents
                              .discountExpirationDate
                            : null
                        }
                        listPrice={
                          post._source.preview.courseContents.initialPrice
                            ? post._source.preview.courseContents.initialPrice
                            : null
                        }
                        nr={index}
                      />
                    )
                  }))
              }
            </StackGrid>
          </div>
        )}
      </div>
    ) : (
      <div className={styles.wrapper}>
        <div className="spinning-wheel">
          {posts.length === 0 && <Spinner className={styles.spinner} />}
        </div>

        <StackGrid columnWidth={340} gutterWidth={40} gutterHeight={20}>
          {posts &&
            posts.map((post, index) => {
              return (
                <Card
                  key={post._id}
                  _id={post._id}
                  onCardClick={openModal}
                  createdDate={post.created_date}
                  discount={
                    post.preview.courseContents.discountInPercent
                      ? post.preview.courseContents.discountInPercent
                      : null
                  }
                  rating={
                    post.preview.courseContents.rating
                      ? post.preview.courseContents.rating
                      : null
                  }
                  studentsEnrolled={
                    post.preview.courseContents.enrolled
                      ? post.preview.courseContents.enrolled
                      : null
                  }
                  expirationDate={
                    post.preview.courseContents &&
                    post.preview.courseContents.discountExpirationDate
                      ? post.preview.courseContents.discountExpirationDate
                      : null
                  }
                  listPrice={post.preview.courseContents.initialPrice}
                  text={getCleanText(
                    post.preview
                      ? post.preview.courseContents
                        ? post.preview.courseContents.title
                        : 'Udemy Course'
                      : 'Udemy Course'
                  )}
                  headline={
                    post.preview
                      ? post.preview.courseContents
                        ? post.preview.courseContents.headline
                        : ''
                      : ''
                  }
                  img={_get(post, ['preview', 'courseContents', 'url'], '')}
                  tags={
                    post.preview
                      ? post.preview.courseContents
                        ? post.preview.courseContents.keywords
                        : post.tags
                      : post.tags
                  }
                  language={
                    post.preview.courseContents.language
                      ? post.preview.courseContents.language
                      : null
                  }
                  nr={index}
                />
              )
            })}
        </StackGrid>
      </div>
    )
  }
}

export default Posts
