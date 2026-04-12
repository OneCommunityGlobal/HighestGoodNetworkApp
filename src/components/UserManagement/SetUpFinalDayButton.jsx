import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { boxStyle } from '../../styles';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { scheduleDeactivationAction, activateUserAction } from '../../actions/userLifecycleActions';
import { toast } from 'react-toastify';
import styles from './usermanagement.module.css';

function SetUpFinalDayButton(props) {
  const { darkMode, userProfile, loadUserProfile, hasFinalDay } = props;
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const dispatch = useDispatch();

  const handleButtonClick = async () => {
    if (hasFinalDay) {
      // Cancel scheduled deactivation by activating the user
      try {
        await activateUserAction(dispatch, userProfile, loadUserProfile);
      } catch (error) {
        toast.error('Unable to cancel the scheduled deactivation right now.');
      }
    } else {
      setFinalDayDateOpen(true);
    }
  };

  const handleSaveFinalDay = async (finalDayDate) => {
    try {
      await scheduleDeactivationAction(dispatch, userProfile, finalDayDate, loadUserProfile);
      setFinalDayDateOpen(false);
    } catch (error) {
      toast.error('Unable to save the final day right now.');
    }
  };

  return (
    <>
      <SetUpFinalDayPopUp
        open={finalDayDateOpen}
        onClose={() => setFinalDayDateOpen(false)}
        onSave={handleSaveFinalDay}
        darkMode={darkMode}
      />
      <button
        type="button"
        className={`${styles.userManagementCellControl} btn btn-outline-${hasFinalDay ? 'warning' : 'success'} btn-sm`}
        onClick={handleButtonClick}
        style={{
          ...darkMode ? { boxShadow: '0 0 0 0', fontWeight: 'bold' } : boxStyle,
          padding: '5px',
        }}
        id={`btn-final-day-${userProfile._id}`}
      >
        {hasFinalDay ? CANCEL : SET_FINAL_DAY}
      </button>
    </>
  );
}

export default SetUpFinalDayButton;
