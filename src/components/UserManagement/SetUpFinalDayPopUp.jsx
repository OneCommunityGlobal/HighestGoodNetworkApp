import moment from 'moment';
import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';
import httpService from '../../services/httpService';
import { ApiEndpoint } from 'utils/URL';

/**
 * Modal popup to show the user profile in create mode
 */
const SetUpFinalDayPopUp = React.memo(props => {
  const [finalDayDate, onDateChange] = useState(Date.now());
  const [dateError, setDateError] = useState(false);

  const closePopup = e => {
    props.onClose();
  };

  const sendDeactivationEmail = async () => {
    const emailData = {
      userId: props.userId,  // Assuming you have access to userId from props
      finalDayDate: finalDayDate
    };
    try {
      await httpService.post(`${ApiEndpoint}/userProfile/deactivationNotice`, emailData);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const deactiveUser = async () => {
    if (moment().isBefore(moment(finalDayDate))) {
      await props.onSave(finalDayDate);
      sendDeactivationEmail();  // Send email after deactivating the user    
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
        {dateError && <Alert color="danger">{'Please choose a future date.'}</Alert>}
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
