import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Input } from 'reactstrap';
import styles from './OwnerMessage.css';
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
  const [modalWrongPictureFormatWarning, setModalWrongPictureFormatWarning] = useState(false);

  const isImage = (/;base64/g);

  const toggle = () => setModal(!modal);
  const toggleDeleteWarning = () => setModalDeleteWarning(!modalDeleteWarning);
  const toggleWrongPictureFormatWarning = () => setModalWrongPictureFormatWarning(!modalWrongPictureFormatWarning);

  useEffect(() => {
    getOwnerMessage();
    setMessage(ownerMessage);
  }, []);

  const handleImageUpload = async event => {
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
      };
    }
  };

  async function handleMessage() {
    const ownerMessage = {
      newMessage: newMessage,
    }

    if(newMessage) {
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
      isImage.test(message) ? <img src={message} alt="" /> : <span className="message">{message}</span>
      }

      {
        user.role == 'Owner' && (
          <div className="icons-wrapper">
            <FontAwesomeIcon
              icon={faEdit}
              className=" text-primary"
              onClick={toggle}
              size={16}
            />
            <FontAwesomeIcon
              icon={faTrashAlt}
              className="text-danger"
              onClick={toggleDeleteWarning}
              size={16}
            />
          </div>
        )
      }


      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Create message</ModalHeader>
        <ModalBody className="modal-body">
          <p>Write a message:</p>
          <Input
            id="text-area"
            name="text"
            type="textarea"
            placeholder="Write your message here..."
            onChange={event => setNewMessage(event.target.value)}
          />
          <p className="paragraph">or upload a picture:</p>
          <Input
            id="image"
            name="file"
            type="file"
            label="Choose Image"
            onChange={handleImageUpload}
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