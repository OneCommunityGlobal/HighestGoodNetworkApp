import moment from 'moment';
import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';
/**
 * Modal popup to show the user profile in create mode
 */
const SetUpFinalDayPopUp = React.memo(props => {
  const [finalDayDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = () => {
    props.onClose();
  };

  const deactiveUser = () => {
    if (moment().isBefore(moment(finalDayDate))) {
      props.onSave(finalDayDate);
    } else {
      setDateError(true);
    }
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} autoFocus={false}>
      <ModalHeader toggle={closePopup}>Set Your Final Day</ModalHeader>
      <ModalBody>
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
        />
        {dateError && <Alert color="danger">Please choose a future date.</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={deactiveUser} style={boxStyle}>
          Save
        </Button>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default SetUpFinalDayPopUp;
