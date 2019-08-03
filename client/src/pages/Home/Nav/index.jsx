import React from 'react'
import classnames from 'classnames/bind'
import ClickOutside from 'react-click-outside'
import _orderBy from 'lodash/orderBy'

import { connect } from 'react-redux'
import { addTag } from '~/actions/Dashboard'

import ToggleButton from '~/components/ToggleButton'

import styles from './Nav.css'
const cx = classnames.bind(styles)

class Nav extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      navOpened: false
    }

    this.toggleNav = () => {
      this.setState({ navOpened: !this.state.navOpened })
    }
    this.closeNav = () => {
      this.setState({ navOpened: false })
    }
    this.getTypes = () => {
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
      this.props.addTag(tag)
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
                {this.getTypes().map((tag, idx) => (
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
            </section>
          </div>
        </div>
      </ClickOutside>
    )
  }
}

const mapStateToProps = state => ({
  filteredPosts: state.dashboard.posts
})
const mapDispatchToProps = {
  addTag
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Nav)
