import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { useState } from 'react';
import { resetPassword } from '../../services/userProfileService';

const ResetPasswordUserPopup = React.memo((props) => {
  const closePopup = (e) => { props.onclose() };

  const [newPassword, onNewPasswordChange] = useState('');
  const [confirmPassword, onConfirmPasswordChange] = useState('');

  const onresetPassword = () => {
    debugger;
    let userData = { newpassowrd: newPassword, confirmnewpassword: confirmPassword };
    resetPassword(props.userId, userData).then(response => {
      alert("Password Updated");
    }).catch(Err => { alert('password updation failed') })
  }

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Reset Password</ModalHeader>
    <ModalBody>
      <span>New Password</span>
      <Input type='password' name='newpassword' id='newpassword'
        value={newPassword}
        onChange={(event) => {
          onNewPasswordChange(event.target.value)
        }} />
      <span>confirm Password</span>
      <Input type='password' name='confirmpassword' id='confirmpassword'
        value={confirmPassword}
        onChange={(event) => {
          onConfirmPasswordChange(event.target.value)
        }} />
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={onresetPassword}>Reset Password</Button>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});
export default ResetPasswordUserPopup