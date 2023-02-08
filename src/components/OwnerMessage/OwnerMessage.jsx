import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import styles from './OwnerMessage.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

export default function OwnerMessage({props}) {
  const { isAuthenticated, user, firstName, profilePic } = props.auth;

  const [newMessage, setNewMessage] = useState('');
  const [message, setMessage] = useState('Edit message');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);

  const toggle = () => setModal(!modal);
  const toggleDeleteWarning = () => setModalDeleteWarning(!modalDeleteWarning);

  function handleCreateMessage() {
    setMessage(newMessage);
    toggle();
  }

  function handleDeleteMessage() {
    setMessage('');
    toggleDeleteWarning();
  }

  return(
    <div className="message-container">
      <span className="message">{message}</span>
      <FontAwesomeIcon
        icon={faEdit}
        size="md"
        className="mr-3 text-primary"
        onClick={toggle}
      />
      <FontAwesomeIcon
        icon={faTrashAlt}
        size="md"
        className="mr-3 text-danger"
        onClick={toggleDeleteWarning}
      />

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create message</ModalHeader>
        <ModalBody>
          <textarea 
          cols="30" 
          rows="10" 
          onChange={event => setNewMessage(event.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleCreateMessage}>
            Create
          </Button>{' '}
        </ModalFooter>
      </Modal>
      <Modal isOpen={modalDeleteWarning} toggle={toggleDeleteWarning}>
        <ModalBody>
          <h4>Do you really want to delete the message?</h4>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleDeleteWarning}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteMessage}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}