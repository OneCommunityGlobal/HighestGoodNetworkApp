import React from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';

export const TeamStatusPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>Status Popup</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <span>{`Are you sure you want to change the status of this team ${props.selectedTeamName} to ${props.selectedStatus ? 'inactive' : 'active'}?`}</span>
        <br />
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="danger"
          onClick={async () => {
            await props.onConfirmClick(
              props.selectedTeamName,
              props.selectedTeamId,
              !props.selectedStatus,
              props.selectedTeamCode,
            );
          }}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Confirm
        </Button>
        <Button color="primary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default TeamStatusPopup;
