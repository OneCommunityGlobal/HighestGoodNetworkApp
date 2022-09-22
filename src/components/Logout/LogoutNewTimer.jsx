import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/authActions';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { client, PAUSE_TIMER } from 'services/timerService';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export const Logout = props => {
  const dispatch = useDispatch();
  const { paused } = useSelector(state => state.timer);
  const [isConnected, setIsConnected] = useState(client.isConnected());

  /**
   * Checking websocket connection -
   *
   * If the connection fails, the UI will update accordingly.
   */
  useEffect(() => client.onStateChange(setIsConnected), [setIsConnected]);

  const pauseTimerAndClearWebsocketSession = () => {
    if (isConnected && !paused) {
      client.getClient().send(
        PAUSE_TIMER({
          isUserPaused: true,
          isApplicationPaused: false,
          saveTimerData: true,
        }),
      );
    }

    client.getClient().close();
  };

  const closePopup = () => {
    props.setLogoutPopup(false);
  };

  const onLogout = () => {
    closePopup();
    pauseTimerAndClearWebsocketSession();
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
