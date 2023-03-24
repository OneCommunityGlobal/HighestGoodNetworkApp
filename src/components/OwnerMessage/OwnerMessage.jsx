import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import styles from './OwnerMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import editIcon from './assets/edit.png';
import deleteIcon from './assets/delete.png';

import { connect } from 'react-redux';
import {
  getOwnerMessage,
  createOwnerMessage,
  updateOwnerMessage,
  deleteOwnerMessage,
} from '../../actions/ownerMessageAction';
import {
  getOwnerStandardMessage,
  createOwnerStandardMessage,
  updateOwnerStandardMessage,
  deleteOwnerStandardMessage,
} from '../../actions/ownerStandardMessageAction';

function OwnerMessage({
  auth,
  getOwnerMessage,
  ownerMessage,
  ownerMessageId,
  createOwnerMessage,
  updateOwnerMessage,
  deleteOwnerMessage,
  getOwnerStandardMessage,
  ownerStandardMessage,
  ownerStandardMessageId,
  createOwnerStandardMessage,
  updateOwnerStandardMessage,
  deleteOwnerStandardMessage,
}) {
  const { user } = auth;

  const [disableTextInput, setDisableTextInput] = useState(false);
  const [disableButtons, setDisableButtons] = useState(true);
  const [standardMessage, setStandardMessage] = useState('');
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);
  const [modalWrongPictureFormatWarning, setModalWrongPictureFormatWarning] = useState(false);

  const isImage = /;base64/g;

  function toggle() {
    setModal(!modal);
    setDisableTextInput(false);
  }

  function toggleDeleteWarning() {
    setModalDeleteWarning(!modalDeleteWarning);
    setDisableTextInput(false);
  }

  function toggleWrongPictureFormatWarning() {
    setModalWrongPictureFormatWarning(!modalWrongPictureFormatWarning);
    setDisableTextInput(false);
  }

  useEffect(() => {
    getOwnerMessage();
    if (ownerMessage) {
      setMessage(ownerMessage);
    }
    getOwnerStandardMessage();
    if (ownerStandardMessage) {
      setStandardMessage(ownerStandardMessage);
    }
    newMessage 
    ? setDisableButtons(false)
    : setDisableButtons(true)
  }, [newMessage]);

  async function handleImageUpload(event) {
    if (event) event.preventDefault();
    const file = event.target.files[0];
    if (typeof file != 'undefined') {
      const imageType = /jpg|jpeg|png/g;
      const validFormats = imageType.test(file.name);

      //Input validation: file type
      if (!validFormats) {
        toggle();
        toggleWrongPictureFormatWarning();
        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = () => {
        setNewMessage(fileReader.result);
        setDisableTextInput(true);
      };
    }
  }

  async function handleMessage() {
    const ownerMessage = {
      newMessage: newMessage,
    };

    if (message) {
      updateOwnerMessage(ownerMessageId, ownerMessage);
      toggle();
      toast.success('Message updated!');
      setMessage(newMessage);
    } else {
      createOwnerMessage(ownerMessage);
      toggle();
      toast.success('Message created!');
      setMessage(newMessage);
    }
  }

  async function handleDeleteMessage() {
    deleteOwnerMessage();
    toggleDeleteWarning();
    toast.error('Message deleted!');
    setMessage('');
  }

  async function handleStandardMessage() {
    const ownerStandardMessage = {
      newStandardMessage: newMessage,
    };

    if (standardMessage) {
      updateOwnerStandardMessage(ownerStandardMessageId, ownerStandardMessage);
      toggle();
      toast.success('Standard Message updated!');
      setStandardMessage(newMessage);
    } else {
      createOwnerStandardMessage(ownerStandardMessage);
      toggle();
      toast.success('Standard Message created!');
      setStandardMessage(newMessage);
    }
  }

  return (
    <div className="message-container">
      {message !== ''
        ? (isImage.test(message) 
            ? <img src={message} alt="" />
            : <span className="message">{message}</span>
          )
        : (isImage.test(standardMessage) 
            ? <img src={standardMessage} alt="" />
            : <span className="message">{standardMessage}</span>
          )
      }

      {user.role == 'Owner' && (
        <div className="icon-wrapper">
          <button onClick={toggle}>
            <img src={editIcon} alt="edit icon" />
          </button>
          
          {
            message 
            && <button onClick={toggleDeleteWarning} style={{ marginLeft: '0.5rem'}} >
                <img src={deleteIcon} alt="edit icon" />
               </button>
          }
        </div>
      )}

      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create message</ModalHeader>
        <ModalBody className="modal-body">
          <p>Write a message:</p>
          <Input
            type="textarea"
            placeholder="Write your message here... (Max 100 characters)"
            onChange={event => setNewMessage(event.target.value)}
            maxLength="100"
            disabled={disableTextInput}
            className="inputs"
          />
          <p className="paragraph" style={{marginTop: '1rem'}}>Or upload a picture:</p>
          <span style={{marginTop: '-1.25rem', marginBottom: '1rem', fontSize: '.8rem'}}>(max size 1000 x 400 pixels and 100 KB)</span>
          <Input
            id="image"
            name="file"
            type="file"
            label="Choose Image"
            onChange={handleImageUpload}
            className="inputs"
          />
        </ModalBody>
        <ModalFooter style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button color="info" onClick={handleStandardMessage} disabled={disableButtons}>
            {standardMessage ? <span style={{color: 'white'}}>Update as Standard Message</span> : <span style={{color: 'white'}}>Create as Standard Message</span>}
          </Button>
          <Button color="primary" onClick={handleMessage} disabled={disableButtons}>
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
      <Modal isOpen={modalWrongPictureFormatWarning} toggle={toggleWrongPictureFormatWarning}>
        <ModalBody>
          <strong>Please insert a valid image!</strong>
          <span>Only .jpg, .jpeg and .png formats are accepted.</span>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={toggleWrongPictureFormatWarning}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state?.auth,
  ownerMessage: state?.ownerMessage?.[0]?.message,
  ownerMessageId: state?.ownerMessage?.[0]?._id,
  ownerStandardMessage: state?.ownerStandardMessage?.[0]?.message,
  ownerStandardMessageId: state?.ownerStandardMessage?.[0]?._id,
});

const mapDispatchToProps = dispatch => ({
  getOwnerMessage: () => dispatch(getOwnerMessage()),
  createOwnerMessage: ownerMessage => dispatch(createOwnerMessage(ownerMessage)),
  updateOwnerMessage: (ownerMessageId, ownerMessage) =>
    dispatch(updateOwnerMessage(ownerMessageId, ownerMessage)),
  deleteOwnerMessage: () => dispatch(deleteOwnerMessage()),

  getOwnerStandardMessage: () => dispatch(getOwnerStandardMessage()),
  createOwnerStandardMessage: ownerStandardMessage => dispatch(createOwnerStandardMessage(ownerStandardMessage)),
  updateOwnerStandardMessage: (ownerStandardMessageId, ownerStandardMessage) =>
    dispatch(updateOwnerStandardMessage(ownerStandardMessageId, ownerStandardMessage)),
  deleteOwnerStandardMessage: () => dispatch(deleteOwnerStandardMessage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);
