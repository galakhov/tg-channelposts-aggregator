import React from 'react'
import ReactModal from 'react-modal'

import './Modal.css'

const customStyles = {
  content: {
    top: '50%',
    left: 'calc(50% - 10px)',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fffbf7',
    borderRadius: '17px',
    padding: '20px 10px 20px 20px',
    margin: '0 10px 0 10px',
    width: '90vw',
    overflowX: 'hidden'
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
