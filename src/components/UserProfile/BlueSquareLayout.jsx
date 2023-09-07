import React, { useCallback } from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import { useState } from 'react';
import { useReducer } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { addReason, patchReason } from 'actions/reasonsActions';
import moment from 'moment-timezone';
import { Modal } from 'react-bootstrap';
import { boxStyle } from 'styles';

const BlueSquareLayout = props => {
  const fetchingReducer = (state, action) => {
    switch (action.type) {
      case 'FETCHING_STARTED':
        return {
          error: false,
          success: false,
          isFetching: true,
          fetchMessage: '',
          errorCode: null,
        };
      case 'ERROR':
        return {
          isFetching: false,
          error: true,
          success: false,
          fetchMessage: action.payload.message,
          errorCode: action.payload.errorCode,
        };
      case 'SUCCESS':
        return { ...state, isFetching: false, error: false, success: true, isSet: true };
      case 'FETCHING_FINISHED':
        return {
          error: false,
          success: false,
          isFetching: false,
          fetchMessage: '',
          errorCode: null,
          isSet: action.payload.isSet,
        };
      default:
        return state;
    }
  };

  const { userProfile, handleUserProfile, handleBlueSquare, canEdit } = props;
  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(
    moment
      .tz('America/Los_Angeles')
      .endOf('week')
      .toISOString()
      .split('T')[0],
  );
  const [fetchState, fetchDispatch] = useReducer(fetchingReducer, {
    isFetching: false,
    error: false,
    success: false,
    fetchMessage: '',
    errorCode: null,
    isSet: false,
  });

  const handleOpen = useCallback(() => {
    setShow(true);
  }, []);

  const handleClose = useCallback(() => {
    setShow(false);
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    if (fetchState.isSet) {
      fetchDispatch({ type: 'FETCHING_STARTED' });
      const response = await patchReason(userProfile._id, { date: date, message: reason });
      if (response.status !== 200) {
        fetchDispatch({
          type: 'ERROR',
          payload: { message: response.message, errorCode: response.errorCode },
        });
      } else {
        fetchDispatch({ type: 'SUCCESS' });
      }
      setShow(true);
    } else {
      fetchDispatch({ type: 'FETCHING_STARTED' });
      const response = await addReason(userProfile._id, { date: date, message: reason });
      console.log(response);
      if (response.status !== 200) {
        fetchDispatch({
          type: 'ERROR',
          payload: { message: response.message, errorCode: response.errorCode },
        });
      } else {
        fetchDispatch({ type: 'SUCCESS' });
      }
    }
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

        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} />
        <div className="mt-4 w-100">
          <Button
            variant="primary"
            onClick={handleOpen}
            className="w-100"
            size="md"
            style={boxStyle}
            disabled={true} //  disabled the Schedule Blue Square button.
            title="This functionality doesn't work currently. Please contact your manager."
          >
            {fetchState.isFetching ? (
              <Spinner size="sm" animation="border" />
            ) : (
              'Schedule Blue Square Reason'
            )}
          </Button>
        </div>
        {show && (
          <Modal show={show} onHide={handleClose}>
            <ScheduleReasonModal
              handleClose={handleClose}
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
          </Modal>
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
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
