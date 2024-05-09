import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Label,
  Alert,
  Form,
} from 'reactstrap';
import CustomModalHeader from 'components/common/Modal/CustomModalHeader';
import Input from 'components/common/Input';
import { boxStyle, boxStyleDark } from 'styles';
import { useSelector } from 'react-redux';
/**
 * Modal popup to show the reset password action
 */
const ResetPasswordPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

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
      <CustomModalHeader title="Reset Password" toggle={() => closePopup()}/>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form>
          <div className="flex justify-between items-center">
            <Label className={`mr-2 ${darkMode ? 'text-light' : ''}`} for="newpassword">New Password</Label>
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

          <div className="flex justify-between items-center mt-4">
            <Label className={`mr-2 ${darkMode ? 'text-light' : ''}`} for="confirmpassword">Confirm Password</Label>
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
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {errorMessage === '' ? <React.Fragment /> : <Alert color="danger">{errorMessage}</Alert>}
        <Button color="primary" onClick={resetPassword} style={darkMode ? boxStyleDark : boxStyle}>
          Reset Password
        </Button>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default ResetPasswordPopup;
