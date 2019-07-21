import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { openModal, closeModal } from '~/actions/Dashboard'
import { currentMsgSelector } from '~/reducers/selector.js'

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
    console.log('currentMsg', this.props.currentMsg)
    const { currentMsg, currentMsgId } = this.props

    return (
      <Modal
        modalIsOpen={this.props.isModalOpen}
        onRequestClose={this.props.closeModal}
      >
        <div className={styles.container}>
          <span
            className={styles.close}
            onClick={this.props.closeModal}
          >
            <CloseIcon />
          </span>
          <Detail msg={currentMsg} />
          <Link to={`/edit/${currentMsgId}`}>
            <span className={styles.edit}>
              <EditIcon />
            </span>
          </Link>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  currentMsg: currentMsgSelector(state),
  isModalOpen: state.dashboard.isModalOpen,
  currentMsgId: state.dashboard.currentMsgId
})
const mapDispatchToProps = {
  openModal,
  closeModal
}
const Connect = connect(mapStateToProps, mapDispatchToProps)(CardModal)
export default Connect
