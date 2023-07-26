import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import { useState } from 'react';
import { useReducer } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { addReason } from 'actions/reasonsActions';

const BlueSquareLayout = props => {
  const fetchingReducer = (state, action) => {
    switch (action.type) {
      case 'FETCHING_STARTED':
        return { error: false, success: false, isFetching: true, fetchMessage: '', errorCode: null };
      case 'ERROR':
        return { isFetching: false, error: true, success: false, fetchMessage: action.payload.message, errorCode: action.payload.errorCode };
      case 'SUCCESS':
        return { isFetching: false, error: false, success: true };
      case 'FETCHING_FINISHED':
        return { error: false, success: false, isFetching: false, fetchMessage: '', errorCode: null };
      default:
        return state
    }
  };

  const {
    userProfile,
    handleUserProfile,
    handleBlueSquare,
    isUserSelf,
    role,
    roles,
    userPermissions,
    canEdit,
  } = props;
  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('')
  const [fetchState, fetchDispatch] = useReducer(fetchingReducer, {
    isFetching: false,
    error: false,
    success: false,
    fetchMessage: '',
    errorCode: null
  });

  const handleToggle = () => {
    setShow(prev => !prev);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setShow(false)
    fetchDispatch({ type: 'FETCHING_STARTED' });
    const response = await addReason(userProfile._id, {date: date, message: reason})
    console.log(response)
    if(response.status !== 200){
      fetchDispatch({type:'ERROR', payload: {message: response.message, errorCode: response.errorCode}})
    }else{
      fetchDispatch({type: 'SUCCESS'})
    }
    setShow(true)
  };

  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field">
        <div className="blueSquare-toggle">
          <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
          {canEdit ? (
            <ToggleSwitch
              style={{ display: 'inline-block' }}
              switchType="bluesquares"
              state={privacySettings?.blueSquares}
              handleUserProfile={handleUserProfile}
            />
          ) : null}
        </div>

        <BlueSquare
          blueSquares={userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
          role={role}
          roles={roles}
          userPermissions={userPermissions}
        />
        <div className="mt-4 w-100">
          <Button variant="primary" onClick={handleToggle} className="w-100" size="md">
            {fetchState.isFetching ? <Spinner size='sm' animation='border' />:'Schedule Blue Square Reason'}
          </Button>
        </div>
        {show && (
          <ScheduleReasonModal
            show={show}
            handleToggle={handleToggle}
            user={userProfile}
            reason={reason}
            setReason={setReason}
            handleSubmit={handleSubmit}
            fetchState={fetchState}
            date={date}
            setDate={setDate}
            fetchMessage={fetchState.fetchMessage}
            fetchDispatch={fetchDispatch}
            userId={userProfile._id}
          />
        )}
      </div>
    );
  }
  return (
    <div>
      {!privacySettings?.blueSquares ? (
        <p>Blue Square Info is Private</p>
      ) : (
        <div>
          <p>BLUE SQUARES</p>
          <BlueSquare
            blueSquares={userProfile?.infringements}
            handleBlueSquare={handleBlueSquare}
            role={role}
            userPermissions={userPermissions}
            roles={roles}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
