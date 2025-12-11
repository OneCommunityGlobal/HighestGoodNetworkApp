import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';
// import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyleDark, boxStyle } from '../../styles';
import '../Header/index.css';
/**
 * Modal popup to show the user profile in create mode
 */
const SetUpFinalDayPopUpComponent = ({ open, onClose, onSave, darkMode }) => {
  const [finalDayDate, onDateChange] = useState(moment().add(1, 'day').format('YYYY-MM-DD'));
  const [dateError, setDateError] = useState(false);

  const closePopup = () => {
    onClose();
  };

  const deactiveUser = () => {
    const picked = moment(finalDayDate, 'YYYY-MM-DD', true);
    if (!picked.isValid() || picked.isSameOrBefore(moment(), 'day')) {
      setDateError(true);
      return;
    }
    // Critical: store end-of-day so it stays the SAME calendar day in all timezones.
    const finalDayEndOfDayISO = picked.endOf('day').toISOString();
    onSave(finalDayEndOfDayISO);
  };
  const inputRef = useRef(null);

useEffect(() => {
  if (open && inputRef.current) {
    inputRef.current.focus();
  }
}, [open]);

  return (
    <Modal
      isOpen={open}
      toggle={closePopup}
      // autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Set Your Final Day
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Input
          // autoFocus
          innerRef={inputRef}
          type="date"
          name="inactiveDate"
          id="inactiveDate"
          value={finalDayDate}
          min={moment().add(1, 'day').format('YYYY-MM-DD')}
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
};

const SetUpFinalDayPopUp = React.memo(SetUpFinalDayPopUpComponent);
SetUpFinalDayPopUp.displayName = 'SetUpFinalDayPopUp';

export default SetUpFinalDayPopUp;
