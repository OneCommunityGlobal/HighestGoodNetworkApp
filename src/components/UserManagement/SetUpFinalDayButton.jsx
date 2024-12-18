import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { updateUserFinalDayStatusIsSet } from '../../actions/userManagement';
import { boxStyle, boxStyleDark } from '../../styles';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import { FinalDay } from '../../utils/enums';

/**
 * @param {*} props
 * @param {Boolean} props.isBigBtn
 * @param {*} props.userProfile.isSet
 * @returns
 */
function SetUpFinalDayButton(props) {
  const { darkMode } = props;
  const [isSet, setIsSet] = useState(false);
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.userProfile?.endDate !== undefined) setIsSet(true);
  }, []);

  const onFinalDayClick = async () => {
    setIsLoading(true); // Start loading indicator
    try {
      const activeStatus = props.userProfile.isActive ? 'Active' : 'Inactive';

      if (isSet) {
        await updateUserFinalDayStatusIsSet(
          props.userProfile,
          activeStatus,
          undefined,
          FinalDay.NotSetFinalDay,
        )(dispatch);

        setIsSet(false);
        await props.loadUserProfile(); // Ensure state sync
        toast.success("This user's final day has been deleted.");
      } else {
        setFinalDayDateOpen(true);
      }
    } catch (error) {
      console.error('Error handling final day click:', error);
      toast.error("An error occurred while updating the user's final day.");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  const setUpFinalDayPopupClose = () => {
    setFinalDayDateOpen(false);
  };

  const deactiveUser = async finalDayDate => {
    setIsLoading(true); // Start loading indicator
    try {
      await updateUserFinalDayStatusIsSet(
        props.userProfile,
        'Active',
        finalDayDate,
        FinalDay.FinalDay,
      )(dispatch);

      setIsSet(true);
      setFinalDayDateOpen(false);
      await props.loadUserProfile(); // Ensure state sync
      toast.success("This user's final day has been set.");
    } catch (error) {
      console.error('Error setting the final day:', error);
      toast.error("An error occurred while setting the user's final day.");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <>
      <SetUpFinalDayPopUp
        open={finalDayDateOpen}
        onClose={setUpFinalDayPopupClose}
        onSave={deactiveUser}
      />
      <Button
        outline={!darkMode}
        color={isSet ? 'warning' : 'success'}
        disabled={isLoading} // Disable the button while loading
        className={`btn ${darkMode ? '' : `btn-outline-${isSet ? 'warning' : 'success'}`} ${
          props.isBigBtn ? '' : 'btn-sm'
        }  mr-1`}
        onClick={() => {
          onFinalDayClick(props.userProfile, isSet);
        }}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {isLoading ? 'Processing...' : isSet ? CANCEL : SET_FINAL_DAY} {/* Show loading state */}
      </Button>
    </>
  );
}

export default SetUpFinalDayButton;
