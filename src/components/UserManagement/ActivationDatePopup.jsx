import moment from 'moment';
import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';
/**
 * Modal popup to show the user profile in create mode
 */
const ActivationDatePopup = React.memo(props => {
  const [activationDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = () => {
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
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Pause until</ModalHeader>
      <ModalBody>
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
        {dateError && <Alert color="danger">Please choose a future date.</Alert>}
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={pauseUser} style={boxStyle}>
          Pause the user
        </Button>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default ActivationDatePopup;
