import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { USER_STATUS_CHANGE_CONFIRMATION } from '../../languages/en/messages';
import { useSelector } from 'react-redux';

/**
 * Modal popup to show the user profile to confirm activation/deactivtion
 */
const ActiveInactiveConfirmationPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = e => {
    props.onClose();
  };
  const setActiveInactive = () => {
    props.setActiveInactive(!props.isActive);
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={darkMode ? 'text-light' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>Change the user status</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          {USER_STATUS_CHANGE_CONFIRMATION(props.fullName, props.isActive ? 'INACTIVE' : 'ACTIVE')}
        </p>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="primary" onClick={setActiveInactive}>
          Ok
        </Button>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default ActiveInactiveConfirmationPopup;
