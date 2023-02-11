import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import styles from './OwnerMessage.css';
import logo from './assets/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { getMessage } from 'actions/badgeManagement';

export default function OwnerMessage({props}) {
  const { user } = props.auth;

  const [ownerMessageId, setOwnerMessageId] = useState('')
  const [newMessage, setNewMessage] = useState('');
  const [displayingMessage, setDisplayingMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);

  const toggle = () => setModal(!modal);
  const toggleDeleteWarning = () => setModalDeleteWarning(!modalDeleteWarning);

  async function handleMessage() {
    const ownerMessage = {
      newMessage: newMessage
    }

    if(displayingMessage === '') {
      await axios.post(ENDPOINTS.OWNERMESSAGE(), ownerMessage)
      .then(console.log(ownerMessage))
      setDisplayingMessage(newMessage);
      toast.success('Message successfully created!');
      toggle();
    } else {
      axios.put(ENDPOINTS.OWNERMESSAGE_BY_ID(ownerMessageId), ownerMessage)
      setDisplayingMessage(newMessage);
      toast.success('Message successfully updated!');
      toggle();
    }
  }

  async function handleDeleteMessage() {
    await axios.delete(ENDPOINTS.OWNERMESSAGE());
    toggleDeleteWarning();
    setDisplayingMessage('');
  }

  async function getMessage() {
    const { data } = await axios.get(ENDPOINTS.OWNERMESSAGE());
    if(data[0]) {
      const message = data[0].message;
      const id = data[0]._id;
      setDisplayingMessage(message);
      setOwnerMessageId(id);
    } else {
      return;
    }
  }

 useEffect(() => {
    getMessage()
  }, [])

  return(
    <div className="message-container">
      {
      displayingMessage ? (<span className="message">{displayingMessage}</span>) : (<img src={logo} width="100" height="50"/>)
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