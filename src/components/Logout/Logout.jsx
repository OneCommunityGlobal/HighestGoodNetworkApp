import React from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/authActions';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export const Logout = props => {
  const dispatch = useDispatch();

  const closePopup = () => {
    props.setLogoutPopup(false);
  };

  const onLogout = () => {
    closePopup();
    dispatch(logoutUser());
    return <Redirect to="/login" auth={false} />;
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Are you sure you want to logout?</ModalHeader>
      <ModalBody>
        <div>
          <p>Don't forget to log your time before logout!</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onLogout}>
          Logout
        </Button>{' '}
        <Button color="primary" onClick={closePopup}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// export default Logout;
