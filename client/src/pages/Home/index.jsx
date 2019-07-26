import * as React from 'react'
import _orderBy from 'lodash/orderBy'
import noScroll from 'no-scroll'

import { connect } from 'react-redux'
import { getPosts, openModal } from '~/actions/Dashboard'

// import t from '~/utils/locales'
import Logo from '~/assets/icons/logo_coupon.svg'
import Page from '~/components/Page'
import AirLine from '~/components/AirLine'
import CardModal from '~/components/CardModal'
import Posts from './Posts'
import Nav from './Nav'

import styles from './Home.css'
import '~/styles/global/global.css'

class Home extends React.Component {
  componentDidMount () {
    this.props.getPosts()
  }

  render () {
    this.props.isModalOpen ? noScroll.on() : noScroll.off()

    const { posts, openModal } = this.props
    return (
      <Page className={styles.container}>
        <Nav posts={posts} />
        <AirLine />
        <div className={styles.logo}>
          <Logo />
        </div>
        <h2 className={styles.intro}>Video Courses Aggregator</h2>
        <h5 className={styles.subheadline}>Free Fresh Coupons</h5>
        {Posts({ posts, openModal })}

        <CardModal />
      </Page>
    )
  }
}

const mapStateToProps = state => ({
  // posts: state.dashboard.posts,
  isModalOpen: state.dashboard.isModalOpen,
  posts: _orderBy(state.dashboard.posts, ['created_date'], ['desc'])
})
const mapDispatchToProps = {
  openModal,
  getPosts
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home)
