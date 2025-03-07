import { useState, useReducer } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Alert,
  Input,
  FormGroup,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import {
  authorizeWeeklySummaries,
  authorizeWeeklySummariesReportError,
} from '../../actions/weeklySummariesReportRecepients';
import { weeklySummaryRecipientsReducer } from '../../reducers/weeklySummaryRecipientsReducer';

export default function PasswordInputModal({
  onClose,
  open,
  checkForValidPwd,
  isValidPwd,
  setSummaryRecepientsPopup,
  setAuthpassword,
  authEmailWeeklySummaryRecipient,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [state, dispatch] = useReducer(weeklySummaryRecipientsReducer, {
    passwordMatch: '',
    passwordMatchErr: '',
  });
  const [passwordField, setPasswordField] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChangeFunc = event => {
    setPasswordField(event.target.value);
  };

  const revealPassword = () => {
    setShowPassword(prev => !prev);
  };

  const authorizeWeeklySummariesButton = async () => {
    const url = ENDPOINTS.AUTHORIZE_WEEKLY_SUMMARY_REPORTS();
    try {
      await axios
        .post(url, { currentPassword: passwordField, currentUser: authEmailWeeklySummaryRecipient })
        .then(response => {
          // console.log(response);
          if (response.status !== 200) {
            dispatch(authorizeWeeklySummariesReportError('Incorrect Password! Unauthorised User!'));
            checkForValidPwd(false);
            setSummaryRecepientsPopup(false);
          } else {
            dispatch(authorizeWeeklySummaries(response.data.message));
            checkForValidPwd(true);
            toast.success('Authorization successful! Please wait to see Recipients table!');
            setAuthpassword(`${response.data.password}`);
            setSummaryRecepientsPopup(true);
            onClose();
          }
        });
    } catch (error) {
      checkForValidPwd(false);
      dispatch(authorizeWeeklySummariesReportError('Incorrect Password! Unauthorised User!'));
      throw Error(error);
    }
  };

  const onSubmit = () => {
    setPasswordField('');
    authorizeWeeklySummariesButton(passwordField);
  };

  return (
    <Container fluid>
      <Modal
        isOpen={open}
        toggle={onClose}
        autoFocus={false}
        size="md"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={onClose}>
          Password to Authorise User
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
          {!isValidPwd && state.passwordMatchErr && (
            <Alert color="danger">{state.passwordMatchErr}</Alert>
          )}
          {isValidPwd && state.passwordMatch !== '' && (
            <Alert color="success">{state.passwordMatch} </Alert>
          )}
          <FormGroup>
            <Input
              autoFocus
              type={showPassword ? 'text' : 'password'}
              name="passwordField"
              id="passwordField"
              value={passwordField}
              onChange={onChangeFunc}
              data-testid="password-input"
            />
            {showPassword ? (
              <FontAwesomeIcon
                icon={faEyeSlash}
                onClick={revealPassword}
                style={{ color: '#666a70', position: 'absolute', top: '26px', right: '32px' }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faEye}
                onClick={revealPassword}
                style={{ color: '#666a70', position: 'absolute', top: '26px', right: '32px' }}
              />
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={onSubmit} style={darkMode ? boxStyleDark : boxStyle}>
            Authorize
          </Button>
          <Button color="secondary" onClick={onClose} style={darkMode ? boxStyleDark : boxStyle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}
