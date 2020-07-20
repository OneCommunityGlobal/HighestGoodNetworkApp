import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, Alert, FormGroup } from 'reactstrap';
import { useState } from 'react';
import { useEffect } from 'react';

/**
 * Modal popup to show the reset password action
 */
const ResetPasswordPopup = React.memo((props) => {

  const [newPassword, onNewPasswordChange] = useState({ password: '', isValid: false });
  const [confirmPassword, onConfirmPasswordChange] = useState({ password: '', isValid: false });
  const [errorMessage, setError] = useState('');
  const closePopup = (e) => { props.onClose() };

  useEffect(() => {
    // Resetting the initail state upon close and reopen.
    onNewPasswordChange({ password: '', isValid: false });
    onConfirmPasswordChange({ password: '', isValid: false });
    setError('');
  }, [props.open]);

  const resetPassword = () => {
    if (!newPassword.isValid) {
      setError("Please choose a strong password with atleast one digit, one capital letter and a special character.");
    } else if (newPassword.isValid && newPassword.password === confirmPassword.password) {
      props.onReset(newPassword.password, confirmPassword.password)
    } else {
      setError("Your password and confirmation password do not match.");
    }
  }

  const isValidPassword = (password) => {
    let regex = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    return regex.test(password);
  }

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Reset Password</ModalHeader>
    <ModalBody>
      <FormGroup>
        <Label for="newpassword">{'New Password'}</Label>
        <Input type="password" name="newpassword" id="newpasssword"
          value={newPassword.password}
          onChange={(event) => {
            onNewPasswordChange({ password: event.target.value, isValid: isValidPassword(event.target.value) });
            setError('');
          }} />
      </FormGroup>
      <FormGroup>
        <Label for="confirmpassword">{'Confirm Password'}</Label>
        <Input type="password" name="confirmpassword" id="confirmpassword"
          value={confirmPassword.password}
          onChange={(event) => {
            onConfirmPasswordChange({ password: event.target.value, isValid: isValidPassword(event.target.value) });
            setError('');
          }} />
      </FormGroup>
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