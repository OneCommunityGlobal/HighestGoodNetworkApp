import React, { useCallback } from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import StopSelfSchedulerModal from './StopSelfSchedulerModal/StopSelfSchedulerModal.jsx';
import { useState, useEffect } from 'react';
import { useReducer } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { addReason, patchReason } from 'actions/reasonsActions';
import moment from 'moment-timezone';
import { Modal } from 'react-bootstrap';
import { boxStyle } from 'styles';
import { color } from 'd3';

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
  const [infringementsNum, setInfringementsNum] = useState(userProfile.infringements.length)
  const [isInfringementMoreThanFive, setIsInfringementMoreThanFive] = useState(false);
  const [show, setShow] = useState(false);
  const [showInfoModal, setShowInfoModal]= useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(
    moment
      .tz('America/Los_Angeles')
      .endOf('week')
      .toISOString()
      .split('T')[0],
  );
  const [IsReasonUpdated,setIsReasonUpdated] = useState(false);
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

  const openInfoModal = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const closeInfoModal = useCallback(() => {
    setShowInfoModal(false);
  }, []);
//  This useEffect will check for any changes in the number of infringements
  useEffect(()=>{
    const checkInfringementCount = ()=>{
      if(userProfile.infringements.length > 5){
        setIsInfringementMoreThanFive(true)
      }
      else{
        setIsInfringementMoreThanFive(false)
      }
    }
    checkInfringementCount();
  },[]);
  
  const handleSubmit = async event => {
    event.preventDefault();
    if (fetchState.isSet && IsReasonUpdated) { //if reason already exists and if it is changed by the user
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
    } else { //add/create reason
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
    setIsReasonUpdated(false);
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
         {/* Replaces Schedule Blue Square button when there are more than 5 blue squares -  by Sucheta */}
        <div className="mt-4 w-100">
          {isInfringementMoreThanFive ? 
          <>
          <Button
           variant='warning'
           onClick={openInfoModal}
           className="w-100 text-success-emphasis"
            size="md"
            style={boxStyle}
          >
            {fetchState.isFetching ? (
              <Spinner size="sm" animation="border" />
            ) : (
              'Can\'t Schedule Time Off'
            )}
          </Button> 
            <p id='self-scheduler-off-info'>(click to learn why)</p>
          </>
          : <Button
            variant="primary"
            onClick={handleOpen}
            className="w-100"
            size="md"
            style={boxStyle}
            //disable the scheduler button if no blue square is assigned to the user
            //length<2 because already one dummy blue square is present on every profile
            //disabled={userProfile?.infringements.length<2}
            >
            {fetchState.isFetching ? (
              <Spinner size="sm" animation="border" />
            ) : (
              'Schedule Blue Square Reason'
            )}
          </Button> }
        </div>
        {isInfringementMoreThanFive && showInfoModal && 
        (<Modal show={showInfoModal} onHide={closeInfoModal}>
          <StopSelfSchedulerModal
            show = {showInfoModal}
            onHide={closeInfoModal}
            handleClose = {closeInfoModal}
            infringementsNum = {infringementsNum}
            user = {userProfile}
          />
        </Modal>)}
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
              IsReasonUpdated={IsReasonUpdated}
              setIsReasonUpdated={setIsReasonUpdated}
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
