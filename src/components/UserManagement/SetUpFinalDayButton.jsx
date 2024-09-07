import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { updateUserFinalDayStatusIsSet } from 'actions/userManagement';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
import { FinalDay } from '../../utils/enums';
/**
 * @param {*} props
 * @param {Boolean} props.isBigBtn
 * @param {*} props.userProfile.isSet
 * @returns
 */
const SetUpFinalDayButton = props => {
  const {darkMode} = props;
  const [isSet, setIsSet] = useState(false);
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.userProfile?.endDate !== undefined) setIsSet(true);
  }, []);

  const onFinalDayClick = async (user, status) => {
    const activeStatus = props.userProfile.isActive? 'Active':'Inactive';
    if (isSet) {
      // updateUserFinalDayStatus(props.userProfile, activeStatus, undefined)(dispatch);
      setIsSet(!isSet);
      setTimeout(async () => {
        await props.loadUserProfile();
        await updateUserFinalDayStatusIsSet(props.userProfile, activeStatus, undefined, FinalDay.NotSetFinalDay)(dispatch)
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
    // await updateUserFinalDayStatus(props.userProfile, 'Active', finalDayDate)(dispatch);
    setIsSet(true);
    setFinalDayDateOpen(false);
    setTimeout(async () => {
      await props.loadUserProfile();
      await updateUserFinalDayStatusIsSet(props.userProfile, 'Active', finalDayDate, FinalDay.FinalDay)(dispatch)
      toast.success("This user's final day has been set.");
    }, 1000);
  };

  return (
    <React.Fragment>
      <SetUpFinalDayPopUp
        open={finalDayDateOpen}
        onClose={setUpFinalDayPopupClose}
        onSave={deactiveUser}
      />
      <Button
        {...(darkMode ? { outline: false } : {outline: true})}
        color={isSet ? 'warning' : 'success'}
        className={`btn ${darkMode ? '' : `btn-outline-${isSet ? 'warning' : 'success'}`} ${
          props.isBigBtn ? '' : 'btn-sm'
        }  mr-1`}
        onClick={e => {
          onFinalDayClick(props.userProfile, isSet);
        }}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {isSet ? CANCEL : SET_FINAL_DAY}
      </Button>
    </React.Fragment>
  );
};
export default SetUpFinalDayButton;