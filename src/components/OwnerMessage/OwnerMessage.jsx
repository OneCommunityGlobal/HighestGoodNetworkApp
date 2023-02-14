import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import styles from './OwnerMessage.css';
import logo from './assets/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';

import { connect } from 'react-redux';
import { getOwnerMessage, createOwnerMessage, updateOwnerMessage, deleteOwnerMessage } from '../../actions/ownerMessageAction';

function OwnerMessage({ auth, getOwnerMessage, ownerMessage, ownerMessageId, createOwnerMessage, updateOwnerMessage, deleteOwnerMessage }) {
  const { user } = auth;

  const [message, setMessage] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);

  const toggle = () => setModal(!modal);
  const toggleDeleteWarning = () => setModalDeleteWarning(!modalDeleteWarning);

  useEffect(() => {
    getOwnerMessage();
    setMessage(ownerMessage);
  }, []);

  async function handleMessage() {
    const ownerMessage = {
      newMessage: newMessage,
    }

    if(message === null) {
      createOwnerMessage(ownerMessage);
      toggle();
      toast.success('Message created!');
      setMessage(newMessage);
    } else {
      updateOwnerMessage(ownerMessageId, ownerMessage);
      toggle();
      toast.success('Message updated!');
      setMessage(newMessage);
    }
  }

  async function handleDeleteMessage() {
    deleteOwnerMessage();
    toggleDeleteWarning();
    toast.error('Message deleted!');
    setMessage(null);
  }

  return(
    <div className="message-container">
      {
      message ? (<span className="message">{message}</span>) : (<img src={logo} width="100" height="50"/>)
      }

      {
        user.role == 'Owner' && (
          <div>
            <FontAwesomeIcon
              icon={faEdit}
              className="mr-3 text-primary"
              onClick={toggle}
            />
            <FontAwesomeIcon
              icon={faTrashAlt}
              className="mr-3 text-danger"
              onClick={toggleDeleteWarning}
            />
          </div>
        )
      }


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
          <Button color="primary" onClick={handleMessage}>
            {message ? 'Update' : 'Create'}
          </Button>
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

const mapStateToProps = state => (
  {
  auth: state.auth,
  ownerMessage: state.ownerMessage[0] ? state.ownerMessage[0].message : null,
  ownerMessageId: state.ownerMessage[0] ? state.ownerMessage[0]._id : null,
});

const mapDispatchToProps = dispatch => ({
  getOwnerMessage: () => dispatch(getOwnerMessage()),
  createOwnerMessage: (ownerMessage) => dispatch(createOwnerMessage(ownerMessage)),
  updateOwnerMessage: (ownerMessageId, ownerMessage) => dispatch(updateOwnerMessage(ownerMessageId, ownerMessage)),
  deleteOwnerMessage: () => dispatch(deleteOwnerMessage())
})

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);