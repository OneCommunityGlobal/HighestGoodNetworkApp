import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import { logoutUser } from '../../actions/authActions';

function Logout({ setLogoutPopup, open }) {
  const dispatch = useDispatch();

  const closePopup = () => {
    setLogoutPopup(false);
  };

  const onLogout = () => {
    const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
    if (sessionStorageData) {
      sessionStorage.removeItem('viewingUser');
      window.dispatchEvent(new Event('storage'));
    }

    closePopup();
    dispatch(logoutUser());
    return <Redirect to="/login" auth={false} />;
  };

  return (
    <Modal isOpen={open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Are you sure you want to logout?</ModalHeader>
      <ModalBody>
        <div>
          <p>Don&apos;t forget to log your time before logout!</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onLogout} style={boxStyle}>
          Logout
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default Logout;
