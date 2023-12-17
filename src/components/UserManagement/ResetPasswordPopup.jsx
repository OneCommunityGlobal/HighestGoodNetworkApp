import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Alert,
  Form,
} from 'reactstrap';
import { boxStyle } from 'styles';
/**
 * Modal popup to show the reset password action
 */
const ResetPasswordPopup = React.memo(props => {
  const [newPassword, onNewPasswordChange] = useState({ password: '', isValid: false });
  const [confirmPassword, onConfirmPasswordChange] = useState({ password: '', isValid: false });
  const [errorMessage, setError] = useState('');
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const closePopup = e => {
    props.onClose();
  };

  useEffect(() => {
    // Resetting the initail state upon close and reopen.
    onNewPasswordChange({ password: '', isValid: false });
    onConfirmPasswordChange({ password: '', isValid: false });
    setError('');
  }, [props.open]);

    const togglePasswordVisibility = (field) => {
    setShowPassword(prevState => ({
      ...prevState,
      [field]: !prevState[field]
    }));
  };

  const resetPassword = () => {
    if (!newPassword.isValid) {
      setError(
        'Please choose a strong password which is at least 8 characters long and should contains a digit , a capital letter and a special character.',
      );
    } else if (newPassword.isValid && newPassword.password === confirmPassword.password) {
      props.onReset(newPassword.password, confirmPassword.password);
    } else {
      setError('Your password and confirmation password do not match.');
    }
  };

  const isValidPassword = password => {
    const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*\\-])(?=.{8,})');
    return regex.test(password);
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} autoFocus={false}>
      <ModalHeader toggle={closePopup}>Reset Password</ModalHeader>
      <ModalBody>
        <Form>
          <div className="flex justify-between items-center mb-2">
              <Label className="mr-2" for="newpassword">New Password</Label>
              <span 
                className={`fa ${showPassword.newPassword ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer`} 
                onClick={() => togglePasswordVisibility('newPassword')} 
              ></span>
          </div>
          <Input
            autoFocus
            type={showPassword.newPassword ? 'text' : 'password'}
            name="newpassword"
            id="newpassword"
            value={newPassword.password}
            onChange={event => {
              const value = event.target.value;
              onNewPasswordChange({
                password: value,
                isValid: isValidPassword(value),
              });
              if (!isValidPassword(value)) {
                setError('Please choose a strong password which is at least 8 characters long and should contains a digit, a capital letter, and a special character.');
              } else {
                setError('');
              }
            }}
          />
          
          <div className="flex justify-between items-center mt-4 mb-2">
              <Label className="mr-2" for="confirmpassword">Confirm Password</Label>
              <span 
                className={`fa ${showPassword.confirmPassword ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer`} 
                onClick={() => togglePasswordVisibility('confirmPassword')} 
              ></span>
          </div>
          <Input
            type={showPassword.confirmPassword ? 'text' : 'password'}
            name="confirmpassword"
            id="confirmpassword"
            value={confirmPassword.password}
            onChange={event => {
              onConfirmPasswordChange({
                password: event.target.value,
                isValid: isValidPassword(event.target.value),
              });
              if (newPassword.password !== event.target.value) {
                setError('Your password and confirmation password do not match.');
              } else {
                setError('');
              }
            }}
          />
        </Form>
      </ModalBody>
      <ModalFooter>
        {errorMessage === '' ? <React.Fragment /> : <Alert color="danger">{errorMessage}</Alert>}
        <Button color="primary" onClick={resetPassword} style={boxStyle}>
          Reset Password
        </Button>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
);
});

export default ResetPasswordPopup;
