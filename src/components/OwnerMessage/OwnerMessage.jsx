import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { connect, useDispatch } from 'react-redux';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from '../../styles';
import './OwnerMessage.css';

import editIcon from './assets/edit.png';
import deleteIcon from './assets/delete.png';

import {
  getOwnerMessage,
  updateOwnerMessage,
  deleteOwnerMessage,
} from '../../actions/ownerMessageAction';

function OwnerMessage({
  auth,
  ownerMessage,
  ownerStandardMessage,
  darkMode,
  getMessage,
  updateMessage,
  deleteMessage,
}) {
  const dispatch = useDispatch();
  const { user } = auth;

  const [disableTextInput, setDisableTextInput] = useState(false);
  const [disableButtons, setDisableButtons] = useState(true);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [modalDeleteWarning, setModalDeleteWarning] = useState(false);
  const [modalWrongPictureFormatWarning, setModalWrongPictureFormatWarning] = useState(false);

  const canEditHeaderMessage = dispatch(hasPermission('editHeaderMessage'));

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
        setMessage(fileReader.result);
        setDisableTextInput(true);
      };
    }
  }

  async function handleMessage(isStandard) {
    const newOwnerMessages = { newMessage: message, isStandard };
    const response = await updateMessage(newOwnerMessages);
    if ([200, 201].includes(response?.status)) {
      toast.success(
        isStandard ? 'Standard message update successfully!' : 'Message update successfully!',
      );
    } else {
      toast.error(`Standard message save failed! Error: ${response}`);
    }
    setDisableButtons(true);
    toggle();
  }

  async function handleDeleteMessage() {
    const response = await deleteMessage();
    if (response.status === 200) {
      toast.success('Message deleted successfully!');
    } else {
      toast.error(`Message deletion failed! Error: ${response}`);
    }
    toggleDeleteWarning();
  }

  function getContent(messages) {
    if (isImage.test(messages)) {
      return <img src={messages} alt="" />;
    }
    return <span className="message">{messages}</span>;
  }

  useEffect(() => {
    async function fetchMessages() {
      await getMessage();
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    if (message !== ownerMessage) {
      setDisableButtons(false);
    } else {
      setDisableButtons(true);
    }
  }, [message]);

  useEffect(() => {
    setMessage(ownerMessage);
  }, [ownerMessage]);

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';
  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  return (
    <div className="message-container">
      {ownerMessage ? getContent(ownerMessage) : getContent(ownerStandardMessage)}

      {(user.role === 'Owner' || canEditHeaderMessage) && (
        <div className="icon-wrapper">
          <button type="submit" onClick={toggle}>
            <img src={editIcon} alt="edit icon" title="Edit this header" />
          </button>

          {ownerMessage && (
            <button type="submit" onClick={toggleDeleteWarning} style={{ marginLeft: '0.25rem' }}>
              <img
                src={deleteIcon}
                alt="edit icon"
                title="Click to restore header to standard message"
              />
            </button>
          )}
        </div>
      )}

      <Modal isOpen={modal} toggle={() => toggle()} className={fontColor}>
        <ModalHeader toggle={() => toggle()} className={headerBg}>
          Create message
        </ModalHeader>
        <ModalBody className={`modal-body ${bodyBg}`}>
          <p>Write a message:</p>
          <Input
            type="textarea"
            placeholder="Write your message here... (Max 100 characters)"
            value={message}
            onChange={event => setMessage(event.target.value)}
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
        <ModalFooter
          className={bodyBg}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Button
            color="info"
            onClick={() => handleMessage(true)}
            disabled={disableButtons}
            style={boxStyling}
          >
            {ownerStandardMessage ? (
              <span style={{ color: 'white' }}>Update as Standard Message</span>
            ) : (
              <span style={{ color: 'white' }}>Create as Standard Message</span>
            )}
          </Button>
          <Button
            color="primary"
            onClick={() => handleMessage(false)}
            disabled={disableButtons}
            style={boxStyling}
          >
            {ownerMessage ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={modalDeleteWarning} toggle={() => toggleDeleteWarning()} className={fontColor}>
        <ModalBody className={headerBg}>
          <h4>Do you really want to delete the message?</h4>
        </ModalBody>
        <ModalFooter className={bodyBg}>
          <Button color="secondary" onClick={() => toggleDeleteWarning()} style={boxStyling}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => handleDeleteMessage()} style={boxStyling}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={modalWrongPictureFormatWarning}
        toggle={() => toggleWrongPictureFormatWarning()}
        className={fontColor}
      >
        <ModalBody className={headerBg}>
          <strong>Please insert a valid image!</strong>
          <span>Only .jpg, .jpeg and .png formats are accepted.</span>
        </ModalBody>
        <ModalFooter className={bodyBg}>
          <Button
            color="danger"
            onClick={() => toggleWrongPictureFormatWarning()}
            style={boxStyling}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  ownerMessage: state.ownerMessage.message,
  ownerStandardMessage: state.ownerMessage.standardMessage,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getMessage: () => dispatch(getOwnerMessage()),
  updateMessage: ownerMessage => dispatch(updateOwnerMessage(ownerMessage)),
  deleteMessage: () => dispatch(deleteOwnerMessage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);
