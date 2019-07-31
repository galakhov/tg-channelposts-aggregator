import React from 'react'
import StackGrid from 'react-stack-grid'
import _get from 'lodash/get'

import { getCleanText } from '~/utils'
import Card from '~/components/Card'
import Spinner from '~/assets/icons/spinning-wheel.svg'
import styles from './Posts.css'

const Posts = ({ posts, openModal }) => (
  <div className={styles.wrapper}>
    <div className="spinning-wheel">{posts.length === 0 && <Spinner />}</div>
    <StackGrid columnWidth={340} gutterWidth={40} gutterHeight={20}>
      {posts &&
        posts.map(post => (
          <Card
            key={post._id}
            _id={post._id}
            onCardClick={openModal}
            createdDate={post.created_date}
            text={getCleanText(
              post.preview
                ? post.preview.courseContents
                  ? post.preview.courseContents.title
                  : post.raw.text
                : post.raw.text
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
          />
        ))}
    </StackGrid>
  </div>
)

export default Posts
