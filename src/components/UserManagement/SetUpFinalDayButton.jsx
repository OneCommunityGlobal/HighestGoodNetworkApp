import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { updateUserFinalDayStatusIsSet } from '../../actions/userManagement';
import { boxStyle, boxStyleDark } from '../../styles';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { FinalDay } from '../../utils/enums';

function SetUpFinalDayButton(props) {
  const { darkMode, userProfile, onFinalDaySave } = props;
  const [isSet, setIsSet] = useState(!!userProfile.endDate); // Determine if the final day is already set
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const dispatch = useDispatch();

  const handleButtonClick = async () => {
    if (isSet) {
      // Delete the final day
      try {
        await updateUserFinalDayStatusIsSet(
          userProfile,
          userProfile.isActive ? 'Active' : 'Inactive',
          undefined,
          FinalDay.NotSetFinalDay,
        )(dispatch);

        setIsSet(false);
        onFinalDaySave({ ...userProfile, endDate: undefined });
        toast.success("This user's final day has been deleted.");
      } catch (error) {
        console.error('Error deleting final day:', error);
        toast.error("An error occurred while deleting the user's final day.");
      }
    } else {
      // Open the popup to set the final day
      setFinalDayDateOpen(true);
    }
  };

  const handleSaveFinalDay = async (finalDayDate) => {
    try {
      await updateUserFinalDayStatusIsSet(
        userProfile,
        'Active',
        finalDayDate,
        FinalDay.FinalDay,
      )(dispatch);

      setIsSet(true);
      setFinalDayDateOpen(false);
      onFinalDaySave({ ...userProfile, endDate: finalDayDate });
      toast.success("This user's final day has been set.");
    } catch (error) {
      console.error('Error setting final day:', error);
      toast.error("An error occurred while setting the user's final day.");
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
        className={`btn btn-outline-${isSet ? 'warning' : 'success'} btn-sm`}
        onClick={handleButtonClick}
        style={{
          ...darkMode ? { boxShadow: '0 0 0 0', fontWeight: 'bold' } : boxStyle,
          padding: '5px', // Added 2px padding
        }}
        id={`btn-final-day-${userProfile._id}`}
        disabled={props.canChangeUserStatus}
      >
        {isSet ? CANCEL : SET_FINAL_DAY}
      </button>
    </>
  );
}

export default SetUpFinalDayButton;