import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import styles from './OwnerMessage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';

import { connect } from 'react-redux';
import { getOwnerMessage, createOwnerMessage, updateOwnerMessage, deleteOwnerMessage } from '../../actions/ownerMessageAction';

function OwnerMessage({ auth, getOwnerMessage, ownerMessage, ownerMessageId, createOwnerMessage, updateOwnerMessage, deleteOwnerMessage }) {
  const { user } = auth;

  const [disableTextInput, setDisableTextInput] = useState(false);
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);
  const [modalWrongPictureFormatWarning, setModalWrongPictureFormatWarning] = useState(false);

  const isImage = (/;base64/g);

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
  }, []);

  async function handleImageUpload(event) {
    if (event) event.preventDefault();
    const file = event.target.files[0];
    if (typeof file != 'undefined') {
      const imageType = (/jpg|jpeg|png/g);
      const validFormats = imageType.test(file.name);

      //Input validation: file type
      if  (!validFormats) {
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
  };

  async function handleMessage() {
    const ownerMessage = {
      newMessage: newMessage,
    }

    if(message) {
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
    toggle();
    toast.error('Message deleted!');
    setMessage('');
  }

  return(
    <div className="message-container">
      {
      isImage.test(message) ? <img src={message} alt="" /> : <span className="message">{message}</span>
      }

      {
        user.role == 'Owner' && (
          <div className="icon-wrapper">
            <FontAwesomeIcon
              icon={faEdit}
              className=" text-primary"
              onClick={toggle}
            />
          </div>
        )
      }


      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create message</ModalHeader>
        <ModalBody className="modal-body">
          <p>Write a message:</p>
          <Input
            type="textarea"
            placeholder="Write your message here..."
            onChange={event => setNewMessage(event.target.value)}
            maxLength="100"
            disabled={disableTextInput}
            className="inputs"
          />
          <p className="paragraph">or upload a picture:</p>
          <Input
            id="image"
            name="file"
            type="file"
            label="Choose Image"
            onChange={handleImageUpload}
            className="inputs"
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
          <Button color="danger" onClick={toggleDeleteWarning} style={message ? {display: 'block'} : {display: 'none'}}>
            Delete
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
});

const mapDispatchToProps = dispatch => ({
  getOwnerMessage: () => dispatch(getOwnerMessage()),
  createOwnerMessage: (ownerMessage) => dispatch(createOwnerMessage(ownerMessage)),
  updateOwnerMessage: (ownerMessageId, ownerMessage) => dispatch(updateOwnerMessage(ownerMessageId, ownerMessage)),
  deleteOwnerMessage: () => dispatch(deleteOwnerMessage())
})

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);