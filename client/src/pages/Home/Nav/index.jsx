import React from 'react'
import classnames from 'classnames/bind'
import ClickOutside from 'react-click-outside'
import _orderBy from 'lodash/orderBy'

import { connect } from 'react-redux'
import {
  getPosts,
  getPostsByTag,
  // setFilteredPosts,
  clearAllTags
} from '~/actions/Dashboard'

import ToggleButton from '~/components/ToggleButton'

import styles from './Nav.css'
const cx = classnames.bind(styles)

class Nav extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      navOpened: false,
      filtered: []
    }

    this.toggleNav = () => {
      this.setState({ navOpened: !this.state.navOpened })
    }
    this.closeNav = () => {
      this.setState({ navOpened: false })
    }
    this.getTags = () => {
      const { posts } = this.props

      let allTypes = []
      posts.forEach(post => {
        // allTypes = allTypes.concat(post.tags)
        allTypes = allTypes.concat(
          post.preview.courseContents.keywords.split(', ')
        )
      })

      let typeCounts = allTypes.reduce((prev, curr) => {
        if (curr) prev[curr] = (prev[curr] || 0) + 1
        return prev
      }, {})

      const types = Object.keys(typeCounts).map(type => ({
        type: type,
        count: typeCounts[type]
      }))

      return _orderBy(types, ['count'], ['desc'])
    }
    this.tagClickHandler = tag => {
      const { getPostsByTag } = this.props
      const filteredPostsByTag = getPostsByTag(tag)
      this.setState({ filtered: filteredPostsByTag }) // local state: seefiltered.length
      // this.props.setFilteredPosts(filteredPostsByTag)
      // console.log('state after filteredPostsByTag', this.state)
    }
    this.clearTags = () => {
      const { clearAllTags, getPosts } = this.props
      clearAllTags()
      this.setState({ filtered: [] })
      getPosts()
    }
  }

  render () {
    return (
      <ClickOutside onClickOutside={this.closeNav}>
        <div className={cx('nav', { open: this.state.navOpened })}>
          <div className={styles.strip} onClick={this.toggleNav}>
            <ToggleButton showClose={this.state.navOpened} />
            <span className={styles.slogan}>
              Aggregates coupons for video courses from various Telegram
              Channels.
            </span>
          </div>
          <div className={styles.bg}>
            <section>
              <h4>Filter By Tags</h4>
              <ul>
                {this.getTags().map((tag, idx) => (
                  <li
                    key={idx}
                    className={styles.type}
                    onClick={() => this.tagClickHandler(tag)}
                  >
                    <a className={cx('tag', 'blue')}>
                      {tag.type}
                      <span>{tag.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {this.state.filtered.length > 0 && (
                <a className={styles.clearTag} onClick={() => this.clearTags()}>
                  Clear Selected Tags
                </a>
              )}
            </section>
          </div>
        </div>
      </ClickOutside>
    )
  }
}

const mapStateToProps = state => ({
  posts:
    state.dashboard.filteredPosts && state.dashboard.filteredPosts.length > 0
      ? state.dashboard.filteredPosts
      : state.dashboard.posts
})
const mapDispatchToProps = {
  getPostsByTag,
  // setFilteredPosts,
  clearAllTags,
  getPosts
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)
