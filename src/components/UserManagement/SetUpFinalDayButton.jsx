import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { updateUserFinalDayStatus } from 'actions/userManagement';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';

/**
 * @param {*} props
 * @param {Boolean} props.isBigBtn
 * @param {*} props.userProfile.isSet
 * @returns
 */
function SetUpFinalDayButton(props) {
  const [isSet, setIsSet] = useState(false);
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const dispatch = useDispatch();
  const { userProfile } = props;

  useEffect(() => {
    if (userProfile?.endDate !== undefined) setIsSet(true);
  }, []);

  const onFinalDayClick = async (user, status) => {
    if (isSet) {
      await updateUserFinalDayStatus(userProfile, 'Active', undefined)(dispatch);
      setIsSet(!isSet);
      setTimeout(async () => {
        await props.loadUserProfile();
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
    await updateUserFinalDayStatus(userProfile, 'Active', finalDayDate)(dispatch);
    setIsSet(true);
    setFinalDayDateOpen(false);
    setTimeout(async () => {
      await props.loadUserProfile();
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
        outline
        color="primary"
        className={`btn btn-outline-${isSet ? 'warning' : 'success'} ${
          props.isBigBtn ? '' : 'btn-sm'
        }  mr-1`}
        onClick={e => {
          onFinalDayClick(userProfile, isSet);
        }}
        style={boxStyle}
      >
        {isSet ? CANCEL : SET_FINAL_DAY}
      </Button>
    </>
  );
}
export default SetUpFinalDayButton;
