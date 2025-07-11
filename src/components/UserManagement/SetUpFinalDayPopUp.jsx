import moment from 'moment';
import React, { useState } from 'react';
// import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyleDark, boxStyle } from '../../styles';
import '../Header/DarkMode.css';
/**
 * Modal popup to show the user profile in create mode
 */
const SetUpFinalDayPopUp = React.memo(({ open, onClose, onSave, darkMode }) => {
  const [finalDayDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = () => {
    onClose();
  };

  const deactiveUser = () => {
    if (moment().isBefore(moment(finalDayDate))) {
      onSave(finalDayDate); // Pass the selected date to the parent component
    } else {
      setDateError(true);
    }
  };

  return (
    <Modal
      isOpen={open}
      toggle={closePopup}
      autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Set Your Final Day
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Input
          autoFocus
          type="date"
          name="inactiveDate"
          id="inactiveDate"
          value={finalDayDate}
          onChange={event => {
            setDateError(false);
            onDateChange(event.target.value);
          }}
          data-testid="date-input"
          className={darkMode ? 'bg-darkmode-liblack text-light border-0 calendar-icon-dark' : ''}
        />
        {dateError && <Alert color="danger">Please choose a future date.</Alert>}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="primary" onClick={deactiveUser} style={darkMode ? boxStyleDark : boxStyle}>
          Save
        </Button>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default SetUpFinalDayPopUp;
