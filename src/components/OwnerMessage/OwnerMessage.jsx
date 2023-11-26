import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { boxStyle } from '../../styles';
import './OwnerMessage.css';

import editIcon from './assets/edit.png';
import deleteIcon from './assets/delete.png';

import {
  getOwnerMessage as getOwnerMessages,
  createOwnerMessage as createOwnerMessages,
  updateOwnerMessage as updateOwnerMessages,
  deleteOwnerMessage as deleteOwnerMessages,
} from '../../actions/ownerMessageAction';
import {
  getOwnerStandardMessage as getOwnerStandardMessages,
  createOwnerStandardMessage as createOwnerStandardMessages,
  updateOwnerStandardMessage as updateOwnerStandardMessages,
  deleteOwnerStandardMessage as deleteOwnerStandardMessages,
} from '../../actions/ownerStandardMessageAction';

function OwnerMessage({
  auth,
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
    getOwnerMessages();
    if (ownerMessage) {
      setMessage(ownerMessage);
    }
    getOwnerStandardMessage();
    if (ownerStandardMessage) {
      setStandardMessage(ownerStandardMessage);
    }
    // newMessage ? setDisableButtons(false) : setDisableButtons(true);
    if (newMessage) {
      setDisableButtons(false);
    } else {
      setDisableButtons(true);
    }
  }, [newMessage]);

  async function handleImageUpload(event) {
    if (event) event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== 'undefined') {
      const imageType = /jpg|jpeg|png/g;
      const validFormats = imageType.test(file.name);

      // Input validation: file type
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
    const ownerMessages = {
      newMessage,
    };

    if (message) {
      updateOwnerMessage(ownerMessageId, ownerMessages);
      toggle();
      toast.success('Message updated!');
      setMessage(newMessage);
    } else {
      createOwnerMessage(ownerMessages);
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
    const ownerStandardMessages = {
      newStandardMessage: newMessage,
    };

    if (standardMessage) {
      updateOwnerStandardMessage(ownerStandardMessageId, ownerStandardMessages);
      toggle();
      toast.success('Standard Message updated!');
      setStandardMessage(newMessage);
    } else {
      createOwnerStandardMessage(ownerStandardMessages);
      toggle();
      toast.success('Standard Message created!');
      setStandardMessage(newMessage);
    }
  }

  function getContent(messages) {
    if (isImage.test(messages)) {
      return <img src={messages} alt="" />;
    }
    return <span className="message">{messages}</span>;
  }

  return (
    <div className="message-container">
      {message !== '' ? getContent(message) : getContent(standardMessage)}

      {user.role === 'Owner' && (
        <div className="icon-wrapper">
          <button type="submit" onClick={toggle}>
            <img src={editIcon} alt="edit icon" />
          </button>

          {message && (
            <button type="submit" onClick={toggleDeleteWarning} style={{ marginLeft: '0.5rem' }}>
              <img src={deleteIcon} alt="edit icon" />
            </button>
          )}
        </div>
      )}

      <Modal isOpen={modal} toggle={() => toggle()}>
        <ModalHeader toggle={() => toggle()}>Create message</ModalHeader>
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
          <p className="paragraph" style={{ marginTop: '1rem' }}>
            Or upload a picture:
          </p>
          <span style={{ marginTop: '-1.25rem', marginBottom: '1rem', fontSize: '.8rem' }}>
            (max size 1000 x 400 pixels and 100 KB)
          </span>
          <Input
            id="image"
            name="file"
            type="file"
            label="Choose Image"
            onChange={event => handleImageUpload(event)}
            className="inputs"
          />
        </ModalBody>
        <ModalFooter style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            color="info"
            onClick={() => handleStandardMessage()}
            disabled={disableButtons}
            style={boxStyle}
          >
            {standardMessage ? (
              <span style={{ color: 'white' }}>Update as Standard Message</span>
            ) : (
              <span style={{ color: 'white' }}>Create as Standard Message</span>
            )}
          </Button>
          <Button
            color="primary"
            onClick={() => handleMessage()}
            disabled={disableButtons}
            style={boxStyle}
          >
            {message ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={modalDeleteWarning} toggle={() => toggleDeleteWarning()}>
        <ModalBody>
          <h4>Do you really want to delete the message?</h4>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => toggleDeleteWarning()} style={boxStyle}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => handleDeleteMessage()} style={boxStyle}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={modalWrongPictureFormatWarning}
        toggle={() => toggleWrongPictureFormatWarning()}
      >
        <ModalBody>
          <strong>Please insert a valid image!</strong>
          <span>Only .jpg, .jpeg and .png formats are accepted.</span>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={() => toggleWrongPictureFormatWarning()} style={boxStyle}>
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
  getOwnerMessage: () => dispatch(getOwnerMessages()),
  createOwnerMessage: ownerMessage => dispatch(createOwnerMessages(ownerMessage)),
  updateOwnerMessage: (ownerMessageId, ownerMessage) =>
    dispatch(updateOwnerMessages(ownerMessageId, ownerMessage)),
  deleteOwnerMessage: () => dispatch(deleteOwnerMessages()),

  getOwnerStandardMessage: () => dispatch(getOwnerStandardMessages()),
  createOwnerStandardMessage: ownerStandardMessage =>
    dispatch(createOwnerStandardMessages(ownerStandardMessage)),
  updateOwnerStandardMessage: (ownerStandardMessageId, ownerStandardMessage) =>
    dispatch(updateOwnerStandardMessages(ownerStandardMessageId, ownerStandardMessage)),
  deleteOwnerStandardMessage: () => dispatch(deleteOwnerStandardMessages()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);
