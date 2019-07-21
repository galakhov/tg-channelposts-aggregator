import React from 'react'
import ReactModal from 'react-modal'

import './Modal.css'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

const Modal = ({ modalIsOpen, onRequestClose, children }) => (
  <ReactModal
    isOpen={modalIsOpen}
    style={customStyles}
    onRequestClose={onRequestClose}
    contentLabel="Example"
  >
    {children}
  </ReactModal>
)

export default Modal
