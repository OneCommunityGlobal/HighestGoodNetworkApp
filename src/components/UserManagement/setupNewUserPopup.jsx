import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from 'utils/URL';

const SetupNewUserPopup = React.memo(props => {
  const [email, setEmail] = useState('');
  const [alert, setAlert] = useState({ visibility: 'hidden', message: '', state: 'success' });
  const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  const baseUrl = window.location.origin;

  const closePopup = e => {
    props.onClose();
  };

  const handelSendLink = () => {
    setAlert({ visibility: 'hidden', message: '', state: 'success' });
    if (!email.match(patt)) {
      {
        setAlert({ visibility: 'visible', message: 'Please enter a valid email', state: 'error' });
      }
    } else {
      httpService
        .post(ENDPOINTS.SETUP_NEW_USER(), { baseUrl, email })
        .then(res => {
          if (res.status === 200) {
            setAlert({
              visibility: 'visible',
              message: 'The setup link has been successfully generated',
              state: 'success',
            });
          } else {
            setAlert({ visibility: 'visible', message: 'An error has occurred', state: 'error' });
          }
        })
        .catch(err => {
          if (err.response.data === 'email already in use') {
            setAlert({
              visibility: 'visible',
              message: 'This email is associated with an existing user account.',
              state: 'error',
            });
          } else {
            setAlert({ visibility: 'visible', message: 'An error has occurred', state: 'error' });
          }
        });
    }
  };
  return (
    <Modal isOpen={props.open} toggle={closePopup} className={'modal-dialog modal-lg'}>
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Setup New User
      </ModalHeader>
      <ModalBody>
        <div className="setup-new-user-popup-section">
          <label htmlFor="email" className="setup-new-user-popup-label">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
            }}
            className="form-control setup-new-user-popup-input"
            placeholder="Please enter the email address for the new user"
          />
          <button
            className="btn btn-primary"
            id="setup-new-user-popup-btn"
            onClick={handelSendLink}
          >
            Send Link
          </button>
          <div
            className={`setup-new-user-popup-${alert.state}`}
            style={{ visibility: alert.visibility }}
          >
            {alert.message}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default SetupNewUserPopup;
