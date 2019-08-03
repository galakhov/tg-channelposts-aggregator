import * as React from 'react'

import { connect } from 'react-redux'
import { setCurrentId, getPosts, openModal } from '~/actions/Dashboard'

// import t from '~/utils/locales'
import { currentPostSelector } from '~/reducers/selector.js'
import Page from '~/components/Page'

import '~/styles/global/global.css'
import styles from './Edit.css'

class Edit extends React.Component {
  componentWillMount () {
    const {
      match: {
        params: { postId }
      }
    } = this.props
    this.props.setCurrentId(postId)
  }
  componentDidMount () {
    this.props.getPosts()
  }

  render () {
    const { currentPost } = this.props

    return (
      <Page>
        <pre className={styles.raw}>{JSON.stringify(currentPost, null, 2)}</pre>
      </Page>
    )
  }
}

const mapStateToProps = state => ({
  currentPost: currentPostSelector(state),
  isModalOpen: state.dashboard.isModalOpen,
  posts: state.dashboard.posts
})
const mapDispatchToProps = {
  openModal,
  getPosts,
  setCurrentId
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Edit)
