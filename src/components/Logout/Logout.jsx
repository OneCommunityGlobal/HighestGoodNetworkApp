import { Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { logoutUser } from '../../actions/authActions';

function Logout({ setLogoutPopup, open }) {
  const darkMode = useSelector(state => state.theme.darkMode);
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
    <Modal isOpen={open} toggle={closePopup} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        Are you sure you want to logout?
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div>
          <p>Don&apos;t forget to log your time before logout!</p>
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="danger" onClick={onLogout} style={darkMode ? boxStyleDark : boxStyle}>
          Logout
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default Logout;
