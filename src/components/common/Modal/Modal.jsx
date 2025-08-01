import { useState } from 'react';
// import { useSelector } from 'react-redux';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
} from 'reactstrap';
import parse from 'html-react-parser';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../Header/DarkMode.css';

// eslint-disable-next-line react/function-component-definition
const ModalExample = props => {
  // const darkMode = useSelector(state => state.theme.darkMode);
  const {
    isOpen,
    closeModal,
    confirmModal,
    setInactiveModal,
    setActiveModal,
    setInactiveButton,
    isSetInactiveDisabled = false,
    setActiveButton,
    isSetActiveDisabled = false,
    modalTitle,
    modalMessage,
    type,
    linkType,
    darkMode,
    confirmButtonText = 'Confirm',
    isConfirmDisabled = false,
  } = props;

  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');

  const handleChange = event => {
    event.preventDefault();

    if (event.target.id === 'linkName') {
      setLinkName(event.target.value.trim());
    } else {
      setLinkURL(event.target.value.trim());
    }
  };

  const buttonDisabled = !(linkName && linkURL);
  const parsedMessage = typeof modalMessage === 'string' ? parse(modalMessage) : null;
  if (type) {
    // console.log('Type of Modal is ', type, linkName, linkURL, buttonDisabled);
  }

  return (
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
        {modalTitle}
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        {type === 'input' ? (
          <>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText style={{ width: '80px' }}>Name</InputGroupText>
              </InputGroupAddon>
              <Input id="linkName" placeholder="Name of the link" onChange={handleChange} />
            </InputGroup>
            <br />
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText style={{ width: '80px' }}>Link URL</InputGroupText>
              </InputGroupAddon>
              <Input id="linkURL" placeholder="URL of the link" onChange={handleChange} />
            </InputGroup>
          </>
        ) : (
          parsedMessage
        )}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {setInactiveModal != null ? (
          <Button color="danger" onClick={closeModal} style={darkMode ? boxStyleDark : boxStyle}>
            Nope, changed my mind
          </Button>
        ) : null}
        {setActiveModal != null ? (
          <Button color="danger" onClick={closeModal} style={darkMode ? boxStyleDark : boxStyle}>
            Nope, leave it buried
          </Button>
        ) : null}
        {confirmModal != null ? (
          <Button color="primary" onClick={closeModal} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>
        ) : null}

        {confirmModal != null ? (
          <Button
            color="danger"
            onClick={confirmModal}
            disabled={isConfirmDisabled}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {confirmButtonText || 'Confirm'}
          </Button>
        ) : null}
        {setInactiveModal != null ? (
          <Button
            color="success"
            disabled={isSetInactiveDisabled}
            onClick={setInactiveModal}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {/* Yes, hide it all */}
            {setInactiveButton}
          </Button>
        ) : null}
        {setActiveModal != null ? (
          <Button
            color="success"
            disabled={isSetActiveDisabled}
            onClick={setActiveModal}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {/* Yes, revive the monster */}
            {setActiveButton}
          </Button>
        ) : null}

        {type === 'input' && (
          <Button
            color="danger"
            onClick={() => confirmModal(linkName, linkURL, linkType)}
            disabled={buttonDisabled}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Add
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ModalExample;
