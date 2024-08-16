import moment from 'moment';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css'
/**
 * Modal popup to show the user profile in create mode
 */
const ActivationDatePopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [activationDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = e => {
    props.onClose();
  };
  const pauseUser = async () => {
    if (moment().isBefore(moment(activationDate))) {
      await props.onPause(activationDate);
    } else {
      setDateError(true);
    }
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>Pause until</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Input
          type="date"
          name="pauseUntilDate"
          id="pauseUntilDate"
          value={activationDate}
          onChange={event => {
            setDateError(false);
            onDateChange(event.target.value);
          }}
          data-testid="date-input"
        />
        {dateError && <Alert color="danger">{'Please choose a future date.'}</Alert>}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="primary" onClick={pauseUser} style={darkMode ? boxStyleDark : boxStyle}>
          Pause the user
        </Button>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default ActivationDatePopup;
