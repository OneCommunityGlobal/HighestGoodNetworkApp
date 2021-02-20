import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DELETE, PAUSE, RESUME } from '../../languages/en/ui';
import { UserStatus } from '../../utils/enums';
import ActivationDatePopup from './ActivationDatePopup';
import { updateUserStatus } from '../../actions/userManagement'

const PauseAndResumeButton = (props) => {
  debugger;
  const [isChanging, onReset] = useState(false);
  const [activationDateOpen, setActivationDateOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const forceUpdate = () => setCounter(counter + 1);

  const activationDatePopupClose = () => {
    setActivationDateOpen(false);
  }

  const dispatch = useDispatch();

  useEffect(() => {
    onReset(false);
  }, [props.user.isActive]);


  /**
 * Call back on Pause confirmation button click to trigger the action to update user status
 */
  const pauseUser = (reActivationDate) => {
    dispatch(updateUserStatus(props.user, UserStatus.InActive, reActivationDate));
    setActivationDateOpen(false);
    forceUpdate();
  }

  /**
  * Call back on Pause or Resume button click to trigger the action to update user status
  */
  const onPauseResumeClick = (user, status) => {
    if (status === UserStatus.Active) {
      dispatch(updateUserStatus(user, status, Date.now()));
    } else {
      setActivationDateOpen(true);

    }
  }


  return (
    <React.Fragment>
      <ActivationDatePopup
        open={activationDateOpen}
        onClose={activationDatePopupClose}
        onPause={pauseUser}
      />
      <button
        type="button"
        className={`btn btn-outline-${props.user.isActive ? 'warning' : 'success'} btn-sm`}
        onClick={(e) => {
          onReset(true);
          onPauseResumeClick(props.user, (props.user.isActive ? UserStatus.InActive : UserStatus.Active));
        }}
      >
        {isChanging ? '...' : (props.user.isActive ? PAUSE : RESUME)}
      </button>
    </React.Fragment>
  )
}
export default PauseAndResumeButton;