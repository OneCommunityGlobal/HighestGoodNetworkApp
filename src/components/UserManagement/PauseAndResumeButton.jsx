import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { PAUSE, RESUME, PROCESSING } from '../../languages/en/ui';
import { UserStatus } from '../../utils/enums';
import ActivationDatePopup from './ActivationDatePopup';
import { updateUserStatus } from '../../actions/userManagement';
import { boxStyle, boxStyleDark } from '../../styles';

/**
 * @param {*} props
 * @param {Boolean} props.isBigBtn
 * @param {*} props.userProfile
 * @returns
 */
function PauseAndResumeButton(props) {
  const { darkMode } = props;
  const [activationDateOpen, setActivationDateOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const activationDatePopupClose = () => {
    setActivationDateOpen(false);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (props.userProfile?.isActive !== undefined) setIsActive(props.userProfile.isActive);
  }, [props.userProfile?.isActive]);

  /**
   * Call back on Pause confirmation button click to trigger the action to update user status
   */
  const pauseUser = async reActivationDate => {
    setIsLoading(true); // Start loading indicator
    try {
      await updateUserStatus(props.userProfile, UserStatus.InActive, reActivationDate)(dispatch);
      setIsActive(false);
      setActivationDateOpen(false);

      // Optimistically update the UI
      toast.success('Your Changes were saved successfully.');
    } catch (error) {
      toast.error('Failed to update the user status.');
      console.error(error);
    } finally {
      setIsLoading(false); // Stop loading indicator
      await props.loadUserProfile(); // Ensure state sync
    }
  };

  /**
   * Call back on Pause or Resume button click to trigger the action to update user status
   */
  const onPauseResumeClick = async (user, status) => {
    if (status === UserStatus.Active) {
      setIsLoading(true); // Start loading indicator
      try {
        await updateUserStatus(user, status, Date.now())(dispatch);
        setIsActive(true);

        // Optimistically update the UI
        toast.success('Your Changes were saved successfully.');
      } catch (error) {
        toast.error('Failed to update the user status.');
        console.error(error);
      } finally {
        setIsLoading(false); // Stop loading indicator
        await props.loadUserProfile(); // Ensure state sync
      }
    } else {
      setActivationDateOpen(true);
    }
  };
  return (
    <>
      <ActivationDatePopup
        open={activationDateOpen}
        onClose={activationDatePopupClose}
        onPause={pauseUser}
      />
      <Button
        outline={!darkMode}
        color={isActive ? 'warning' : 'success'}
        disabled={isLoading} // Disable the button while loading
        className={`btn ${darkMode ? '' : `btn-outline-${isActive ? 'warning' : 'success'}`} ${
          props.isBigBtn ? '' : 'btn-sm'
        }  mr-1`}
        onClick={() => {
          onPauseResumeClick(props.userProfile, isActive ? UserStatus.InActive : UserStatus.Active);
        }}
        style={darkMode ? boxStyleDark : boxStyle}
        data-testid="pause-resume-button"
      >
        {isLoading ? PROCESSING : isActive ? PAUSE : RESUME} {/* Show loading state */}
      </Button>
    </>
  );
}
export default PauseAndResumeButton;
