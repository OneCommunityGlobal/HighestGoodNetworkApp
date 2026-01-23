import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Table } from 'reactstrap';
import { connect, useDispatch } from 'react-redux';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '../../styles';

import styles from './OwnerMessage.module.css';

import editIcon from './assets/edit.png';
import deleteIcon from './assets/delete.png';

import {
  getOwnerMessage,
  updateOwnerMessage,
  deleteOwnerMessage,
  getOwnerMessageHistory,
} from '../../actions/ownerMessageAction';

function OwnerMessage({
  auth,
  ownerMessage,
  ownerStandardMessage,
  ownerMessageHistory,
  darkMode,
  getMessage,
  updateMessage,
  deleteMessage,
  getMessageHistory,
}) {
  const dispatch = useDispatch();
  const { user } = auth;

  const [disableTextInput, setDisableTextInput] = useState(false);
  const [disableButtons, setDisableButtons] = useState(true);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
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
      return <img src={messages} alt="" className={styles.ownerMessageImg} />;
    }
    return <span className={styles.message}>{messages}</span>;
  }

  const formatDateTimePST = date =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date));

  useEffect(() => {
    async function fetchMessages() {
      await getMessage();
      await getMessageHistory();
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    setDisableButtons(message === ownerMessage);
  }, [message]);

  useEffect(() => {
    setMessage(ownerMessage);
  }, [ownerMessage]);

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';
  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  return (
    <div className={styles.messageContainer}>
      {ownerMessage ? getContent(ownerMessage) : getContent(ownerStandardMessage)}

      {(user.role === 'Owner' || canEditHeaderMessage) && (
        <span className={styles.iconWrapper}>
          <button
            type="submit"
            className={styles.ownerMessageButton}
            onClick={toggle}
            aria-label="Edit header message"
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundImage: `url(${editIcon})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              title="Edit this header"
              role="img"
              aria-label="Edit icon"
            />
          </button>

          {ownerMessage && (
            <button
              type="submit"
              className={styles.ownerMessageButton}
              onClick={toggleDeleteWarning}
              style={{ marginLeft: '0.25rem' }}
              aria-label="Delete header message"
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundImage: `url(${deleteIcon})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                title="Click to restore header to standard message"
                role="img"
                aria-label="Delete icon"
              />
            </button>
          )}
          <button
            type="submit"
            className={styles.ownerMessageButton}
            onClick={() => setHistoryModalOpen(true)}
            aria-label="View owner message edit history"
          >
            <i
              style={{
                fontSize: '24px',
                marginLeft: '0.25rem',
                color: 'white',
              }}
              className="fa fa-history"
              aria-label="View owner message edit history"
            ></i>
          </button>
        </span>
      )}

      <Modal isOpen={modal} toggle={() => toggle()} className={fontColor}>
        <ModalHeader toggle={() => toggle()} className={headerBg}>
          Create message
        </ModalHeader>
        <ModalBody className={`${styles.modalBody} ${bodyBg}`}>
          <p>Write a message:</p>
          <Input
            type="textarea"
            placeholder="Write your message here... (Max 100 characters)"
            value={message}
            onChange={event => setMessage(event.target.value)}
            maxLength="100"
            disabled={disableTextInput}
            className={styles.inputs}
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
            className={styles.inputs}
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

      {/* Owner Edit History Modal */}
      <Modal
        size="xl"
        isOpen={historyModalOpen}
        toggle={() => setHistoryModalOpen(false)}
        className={fontColor}
      >
        <ModalHeader toggle={() => setHistoryModalOpen(false)}>
          Owner Message Edit History
        </ModalHeader>
        <ModalBody className={headerBg}>
          {!ownerMessageHistory || ownerMessageHistory.length === 0 ? (
            <p>No edit history available.</p>
          ) : (
            <Table>
              <thead className={`${darkMode ? 'bg-space-cadet' : ''}`}>
                <tr>
                  <th className={`${darkMode ? 'bg-space-cadet' : ''}`}>Date</th>
                  <th className={`${darkMode ? 'bg-space-cadet' : ''}`}>Edited By</th>
                  <th className={`${darkMode ? 'bg-space-cadet' : ''}`}>Old Message</th>
                  <th className={`${darkMode ? 'bg-space-cadet' : ''}`}>New Message</th>
                </tr>
              </thead>
              <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>
                {ownerMessageHistory.map((historyItem, index) => (
                  <tr key={index}>
                    <td>{formatDateTimePST(historyItem.createdAt)} PST</td>
                    <td>
                      {historyItem.requestorName} ({historyItem.requestorEmail})
                    </td>
                    <td>
                      <p>
                        <b>Message:</b> {historyItem.oldMessage}
                      </p>
                      <p>
                        <b>Standard Message:</b> {historyItem.oldStandardMessage}
                      </p>
                    </td>
                    <td>
                      <p>
                        <b>Message:</b> {historyItem.newMessage}
                      </p>
                      <p>
                        <b>Standard Message:</b> {historyItem.newStandardMessage}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter className={bodyBg}>
          <Button color="secondary" onClick={() => setHistoryModalOpen(false)} style={boxStyling}>
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
  ownerMessageHistory: state.ownerMessage.history,
});

const mapDispatchToProps = dispatch => ({
  getMessage: () => dispatch(getOwnerMessage()),
  updateMessage: ownerMessage => dispatch(updateOwnerMessage(ownerMessage)),
  deleteMessage: () => dispatch(deleteOwnerMessage()),
  getMessageHistory: () => dispatch(getOwnerMessageHistory()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OwnerMessage);
