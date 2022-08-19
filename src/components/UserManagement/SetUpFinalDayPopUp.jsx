import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import store from 'store';

/**
 * Modal popup to show the user profile in create mode
 */
const SetUpFinalDayPopUp= React.memo((props) => {
 
  const [finalDayDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = (e) => {
    props.onClose();
  };
  const deactiveUser = () => {
    if (Date.parse(finalDayDate) > Date.now()) {
      props.onSave(finalDayDate);
      //toast.success('Your Final Day has been set.');
    } else {
      setDateError(true);
    }
    
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Set Your Final Day</ModalHeader>
      <ModalBody>
        <Input
          type="date"
          name="inactiveDate"
          id="inactiveDate"
          value={finalDayDate}
          onChange={(event) => {
            setDateError(false);
            onDateChange(event.target.value);
          }}
          data-testid="date-input"
        />
        {dateError && <Alert color="danger">{'Please choose a future date.'}</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={deactiveUser}>
          Save 
        </Button>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default SetUpFinalDayPopUp;
