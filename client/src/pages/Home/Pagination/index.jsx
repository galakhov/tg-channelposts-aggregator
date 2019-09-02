import React from 'react'
import { connect } from 'react-redux'
import styles from './Pagination.css'
import { Pagination } from 'element-react'
import 'element-theme-default/lib/pagination.css'
import { getPostsCount, getPosts } from '~/actions/Dashboard'

class PaginationComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      skip: 0, // entries to skip
      limit: 50
    }
  }

  componentDidMount () {
    this.props.getPostsCount()
    console.log('total posts: ', this.props.postsCount)
  }

  componentDidUpdate (prevProps, prevState) {
    // only update the pagination if the postsCount has changed
    if (
      prevProps.postsCount !== this.props.postsCount ||
      prevProps.currentPage !== this.props.currentPage
    ) {
      console.log('componentDidUpdate postsCount: ', this.props.postsCount)
      let offset =
        this.props.postsCount - this.state.limit * this.props.currentPage
      // upper bound
      if (offset <= this.state.limit) {
        offset = 0
      }
      this.setState({ skip: offset })
      console.log('entries skipped for the next page: ', offset)

      this.props.getPosts(offset, this.state.limit)
    }
  }

  render () {
    const { isFetching, filteredPosts, postsCount, currentPage } = this.props
    return (
      <div className={styles.pagination}>
        {!isFetching && filteredPosts.length <= 0 && (
          <div className={styles.paginationBlock}>
            <Pagination
              className={styles.paginationPager}
              layout="prev, pager, next"
              total={postsCount - this.state.limit || 2000}
              pageSize={this.state.limit}
              currentPage={currentPage}
              onCurrentChange={this.props.handlePageSwitch}
            />
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  filteredPosts: state.dashboard.filteredPosts,
  isFetching: state.dashboard.isFetching,
  postsCount: state.dashboard.postsCount
})
const mapDispatchToProps = {
  getPostsCount,
  getPosts
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PaginationComponent)
