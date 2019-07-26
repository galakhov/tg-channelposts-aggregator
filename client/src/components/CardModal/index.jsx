import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { openModal, closeModal } from '~/actions/Dashboard'
import { currentPostSelector } from '~/reducers/selector.js'

import CloseIcon from '~/assets/icons/close.svg'
import EditIcon from '~/assets/icons/edit.svg'
import Modal from '~/components/Modal'
import Detail from './Detail'

import styles from './CardModal.css'

class CardModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    console.log('currentPost', this.props.currentPost)
    const { currentPost, currentPostId } = this.props

    return (
      <Modal
        modalIsOpen={this.props.isModalOpen}
        onRequestClose={this.props.closeModal}
      >
        <div className={styles.container}>
          <span className={styles.close} onClick={this.props.closeModal}>
            <CloseIcon />
          </span>
          <Detail post={currentPost} />
          <Link to={`/edit/${currentPostId}`}>
            <span className={styles.edit}>
              <EditIcon />
            </span>
          </Link>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  currentPost: currentPostSelector(state),
  isModalOpen: state.dashboard.isModalOpen,
  currentPostId: state.dashboard.currentPostId
})
const mapDispatchToProps = {
  openModal,
  closeModal
}
const Connect = connect(
  mapStateToProps,
  mapDispatchToProps
)(CardModal)
export default Connect
