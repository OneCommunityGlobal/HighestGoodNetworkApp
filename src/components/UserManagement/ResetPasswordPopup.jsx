import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Alert } from 'reactstrap';
import { useState } from 'react';

/**
 * Modal popup to show the reset password action
 */
const ResetPasswordPopup = React.memo((props) => {

  const [newPassword, onNewPasswordChange] = useState('')
  const [confirmPassword, onConfirmPasswordChange] = useState('')
  const [errorMessage, serError] = useState('')
  const closePopup = (e) => { props.onClose() };

  const resetPassword = () => {
    if (newPassword === '') {
      serError("Please enter the new password.")
    } else if (newPassword === confirmPassword) {
      props.onReset(newPassword, confirmPassword)
    } else {
      serError("Your password and confirmation password do not match.")
    }
  }

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Reset Password</ModalHeader>
    <ModalBody>
      <Label>{'New Password'}</Label>
      <Input type="password" name="newpassword" id="newpasssword"
        value={newPassword}
        onChange={(event) => {
          onNewPasswordChange(event.target.value)
        }} />
      <Label>{'Confirm Password'}</Label>
      <Input type="password" name="confirmpassword" id="confirmpassword"
        value={confirmPassword}
        onChange={(event) => {
          onConfirmPasswordChange(event.target.value)
        }} />
    </ModalBody>
    <ModalFooter>
      {errorMessage === '' ? <React.Fragment></React.Fragment> :
        <Alert color="danger">
          {errorMessage}
        </Alert>}
      <Button color="primary" onClick={resetPassword}>Reset Password</Button>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});

export default ResetPasswordPopup;