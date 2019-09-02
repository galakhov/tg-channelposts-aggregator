import * as React from 'react'
import _orderBy from 'lodash/orderBy'
import noScroll from 'no-scroll'

import { connect } from 'react-redux'
import {
  getPosts,
  openModal,
  handleSearchChange,
  handleClearSearch,
  handleSearch
} from '~/actions/Dashboard'

// import t from '~/utils/locales'
import Logo from '~/assets/icons/logo_coupon.svg'
import Page from '~/components/Page'
import AirLine from '~/components/AirLine'
import CardModal from '~/components/CardModal'
import Posts from './Posts'
import PaginationComponent from './Pagination'
import Nav from './Nav'

import {
  // Table,
  // Notification,
  // MessageBox,
  // Message,
  // Tabs,
  Button,
  // Icon,
  Form,
  Input
  // Dialog,
  // Card,
  // Tag
} from 'element-react'
import 'element-theme-default/lib/form.css'
import 'element-theme-default/lib/form-item.css'
import 'element-theme-default/lib/button.css'
import 'element-theme-default/lib/input.css'
import 'element-theme-default/lib/icon.css'

import styles from './Home.css'
import '~/styles/global/global.css'

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // locale: getLanguage()
      currentPage: 1,
      searchTerm: ''
    }
  }

  componentDidMount () {
    this.props.getPosts(this.state.skip, this.state.limit)
  }

  handlePageSwitch = currentPageNumber => {
    console.log('handlePageSwitch: ' + currentPageNumber)
    this.setState({ currentPage: currentPageNumber })
  }

  render () {
    this.props.isModalOpen ? noScroll.on() : noScroll.off()

    const {
      posts,
      openModal,
      handleSearchChange,
      handleClearSearch,
      handleSearch,
      searchTerm,
      isSearching,
      searchResults,
      searchResultsCount
    } = this.props
    return (
      <Page id="mainPage" className={styles.container}>
        <Nav posts={posts} />
        <AirLine />
        <div className={styles.logo}>
          <Logo />
        </div>
        <h2 className={styles.intro}>Video Courses Aggregator</h2>
        <h5 className={styles.subheadline}>
          50+ Fresh Free Courses Every Day!
        </h5>

        <Form
          className={styles.searchForm}
          inline={true}
          onSubmit={handleSearch}
        >
          <Form.Item>
            <Input
              className={styles.searchInput}
              placeholder="Search..."
              icon="circle-cross"
              onChange={handleSearchChange}
              onIconClick={handleClearSearch}
              value={searchTerm || ''}
              disabled={isSearching}
            />
          </Form.Item>
          <Form.Item>
            <Button
              icon="search"
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isSearching}
            >
              Search
            </Button>
          </Form.Item>
        </Form>

        <Posts
          posts={posts}
          openModal={openModal}
          searchResults={searchResults}
          searchResultsCount={searchResultsCount}
          currentPage={this.state.currentPage}
        />
        <PaginationComponent
          handlePageSwitch={this.handlePageSwitch.bind(this)}
          currentPage={this.state.currentPage}
        />
        <CardModal />
      </Page>
    )
  }
}

const mapStateToProps = state => ({
  posts: _orderBy(
    state.dashboard.filteredPosts && state.dashboard.filteredPosts.length > 0
      ? state.dashboard.filteredPosts
      : state.dashboard.posts,
    ['created_date'],
    ['desc']
  ),
  isSearching: state.dashboard.isSearching,
  searchTerm: state.dashboard.currentSearchTerm,
  searchResults: state.dashboard.currentSearchResults,
  searchResultsCount: state.dashboard.currentSearchResultsCount,
  isModalOpen: state.dashboard.isModalOpen
})
const mapDispatchToProps = {
  openModal,
  getPosts,
  handleSearchChange,
  handleClearSearch,
  handleSearch
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
