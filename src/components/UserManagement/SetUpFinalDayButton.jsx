import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { SET_FINAL_DAY, CANCEL } from '../../languages/en/ui';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { updateUserFinalDayStatus } from 'actions/userManagement';
import { toast } from 'react-toastify';

/**
 * @param {*} props
 * @param {Boolean} props.isBigBtn
 * @param {*} props.userProfile.isSet
 * @returns
 */
const SetUpFinalDayButton = props => {
  const [isSet, setIsSet] = useState(false);
  const [finalDayDateOpen, setFinalDayDateOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (props.userProfile?.endDate !== undefined) setIsSet(true);
  }, []);

  const onFinalDayClick = (user, status) => {
    if (isSet) {
      updateUserFinalDayStatus(props.userProfile, 'Active', undefined)(dispatch);
      setIsSet(!isSet);
      toast.success("This user's final day has been deleted.");
      let profile = props.userProfile;
      delete profile.endDate;
      props.setUserProfile(profile);
    } else {
      setFinalDayDateOpen(true);
    }
  };

  const setUpFinalDayPopupClose = () => {
    setFinalDayDateOpen(false);
  };

  const deactiveUser = finalDayDate => {
    updateUserFinalDayStatus(props.userProfile, 'Active', finalDayDate)(dispatch);
    setIsSet(true);
    setFinalDayDateOpen(false);
    toast.success("This user's final day has been set.");
    props.setUserProfile(prevUser => ({
      ...prevUser,
      endDate: finalDayDate,
    }));
  };

  return (
    <React.Fragment>
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
          onFinalDayClick(props.userProfile, isSet);
        }}
      >
        {isSet ? CANCEL : SET_FINAL_DAY}
      </Button>
    </React.Fragment>
  );
};
export default SetUpFinalDayButton;
