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
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.userProfile?.endDate !== undefined) setIsSet(true);
  }, []);

  const onFinalDayClick = async () => {
    const activeStatus = props.userProfile.isActive ? 'Active' : 'Inactive';
    
    if (isSet) {
      setIsSet(false); 
      setTimeout(async () => {
        await updateUserFinalDayStatusIsSet(
          props.userProfile,
          activeStatus,
          undefined,
          FinalDay.NotSetFinalDay
        )(dispatch);
  
        
        props.setUserProfile(prevProfile => ({
          ...prevProfile,
          endDate: undefined 
        }));
  
        toast.success("This user's final day has been deleted.");
      }, 1000);
    } else {
      setFinalDayDateOpen(true);
    }
  };
  

  const setUpFinalDayPopupClose = () => {
    setFinalDayDateOpen(false);
  };

  const deactiveUser = async finalDayDate => {
    setIsSet(true);
    setFinalDayDateOpen(false);
  
    setTimeout(async () => {
      await updateUserFinalDayStatusIsSet(
        props.userProfile,
        'Active',
        finalDayDate,
        FinalDay.FinalDay
      )(dispatch);
  
      
      props.setUserProfile(prevProfile => ({
        ...prevProfile,
        endDate: finalDayDate 
      }));
  
      toast.success("This user's final day has been set.");
    }, 1000);
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
        className={`btn ${darkMode ? '' : `btn-outline-${isSet ? 'warning' : 'success'}`} ${
          props.isBigBtn ? '' : 'btn-sm'
        }  mr-1`}
        onClick={() => {
          onFinalDayClick(props.userProfile, isSet);
        }}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {isSet ? CANCEL : SET_FINAL_DAY}
      </Button>
    </>
  );
}
export default SetUpFinalDayButton;
