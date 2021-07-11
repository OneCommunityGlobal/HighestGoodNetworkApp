import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { DELETE, PAUSE, RESUME } from '../../languages/en/ui';
import { UserStatus } from '../../utils/enums';
import ActivationDatePopup from './ActivationDatePopup';
import { updateUserStatus } from '../../actions/userManagement';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';

const PauseAndResumeButton = (props) => {
  const [activationDateOpen, setActivationDateOpen] = useState(false);
  const [isActive, setIsActive] = useState(true)

  const activationDatePopupClose = () => {
    setActivationDateOpen(false);
  }

  const dispatch = useDispatch();

  useEffect(() => {
    setIsActive(props.user.isActive);
  }, [props.user.isActive]);


  /**
 * Call back on Pause confirmation button click to trigger the action to update user status
 */
  const pauseUser = (reActivationDate) => {
    dispatch(updateUserStatus(props.user, UserStatus.InActive, reActivationDate));
    setIsActive(false);
    setActivationDateOpen(false);
  }

  /**
  * Call back on Pause or Resume button click to trigger the action to update user status
  */
  const onPauseResumeClick = (user, status) => {
    if (status === UserStatus.Active) {
      dispatch(updateUserStatus(user, status, Date.now()));
      setIsActive(status);
      toast.success('Your Changes were saved successfully.')
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
      <Button
        outline
        color="primary"
        className={`btn btn-outline-${isActive ? 'warning' : 'success'} ${props.isBigBtn ? '' : 'btn-sm'}  mr-1`}
        onClick={(e) => {
          onPauseResumeClick(props.user, (isActive ? UserStatus.InActive : UserStatus.Active));
        }}
      >
        {isActive ? PAUSE : RESUME}
      </Button>
    </React.Fragment>
  )
}
export default PauseAndResumeButton;