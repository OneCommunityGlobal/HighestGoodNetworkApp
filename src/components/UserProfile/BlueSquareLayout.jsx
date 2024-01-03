import React, { useCallback } from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
// import StopSelfSchedulerModal from './StopSelfSchedulerModal/StopSelfSchedulerModal.jsx';
import SchedulerExplanationModal from './SchedulerExplanationModal/SchedulerExplanationModal';
import { useState, useEffect } from 'react';
import { useReducer } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { addReason, patchReason, getAllReasons } from 'actions/reasonsActions';
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
  const [infringementsNum, setInfringementsNum] = useState(userProfile.infringements.length)
  const [isInfringementMoreThanFive, setIsInfringementMoreThanFive] = useState(false);
  const [show, setShow] = useState(false);
  const [showExplanation, setShowExplanation]= useState(false);
  const [allreasons, setAllReasons]= useState("");
  const [numberOfReasons, setNumberOfReasons] = useState("");
  const [addsReason, setAddsReason] = useState(false); // this flag will be set to true, each time a scheduled reason has been added - sucheta
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

  
  // This handler is used for Explanation Modal, that open when <a>Click to learn why </a> is clicked 
  const openExplanationModal = useCallback(() => { 
    setShowExplanation(true);
  }, []);
// This handler is used to close Info Modal, 
  const closeExplanationModal  = useCallback(() => {
    setShowExplanation(false);
  }, []);
  
 
   // checks for blueSquare scheduled reasons 
  useEffect(()=>{
    let isMounted = true;
    const checkReasons = async ()=>{
      fetchDispatch({type: 'FETCHING_STARTED'})
      const response = await getAllReasons(userProfile._id);
      if (response.status !== 200) {
        fetchDispatch({
          type: 'ERROR',
          payload: { message: response.message, errorCode: response.errorCode },
        });
      } else {
        fetchDispatch({ type: 'SUCCESS' });
        if (isMounted){
          setAllReasons(response.data.reasons)
          setNumberOfReasons(response.data.reasons.length);
        }
        
        }
    }
    checkReasons()
    return () => isMounted = false;

  }, [addsReason])
  
//  This useEffect will check for any changes in the number of infringements
  useEffect(()=>{
    const checkInfringementCount = ()=>{
      if(userProfile.role === "Administrator" || userProfile.role === "Owner"){
        setIsInfringementMoreThanFive(false);
        return
      }else{
        if(userProfile.infringements.length >= 5){
          setIsInfringementMoreThanFive(true)
        }
        else{
          setIsInfringementMoreThanFive(false)
        }
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
        setAddsReason(true); 
      }
    }
    setIsReasonUpdated(false);
    setAddsReason(false);
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

        <BlueSquare blueSquares={userProfile?.infringements} handleBlueSquare={handleBlueSquare} isInfringementMoreThanFive={isInfringementMoreThanFive} userRole={userProfile.role}/>
         {/* Replaces Schedule Blue Square button when there are more than 5 blue squares or scheduled reasons -  by Sucheta */}
        <div className="mt-4 w-100">
            {
              isInfringementMoreThanFive || numberOfReasons >= 5 || (infringementsNum + numberOfReasons >= 5 ) ?  <>
              <Button
              //  variant='warning'
               onClick={openExplanationModal}
               className="w-100 text-success-emphasis"
                size="md"
                style={boxStyle}
                id='stopSchedulerButton'
              >
                {fetchState.isFetching ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  <>
                  <span>Can't Schedule Time Off</span>
                  <br/>
                  <span 
                   className='mt-0'
                   style={{fontSize: ".8em"}}>
                    Click to learn why
                  </span>
                  </>
                  )}
              </Button> 
              </> : <Button
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
          </Button>
          }
        </div>
        {(isInfringementMoreThanFive || numberOfReasons >= 5 || (infringementsNum + numberOfReasons >= 5 )) && showExplanation && (
          <Modal show={showExplanation} onHide={closeExplanationModal}>
            <SchedulerExplanationModal
              onHide={closeExplanationModal}
              handleClose = {closeExplanationModal}
              infringementsNum = {infringementsNum}
              reasons = {allreasons}
              infringements = {userProfile.infringements}
            />
          </Modal>
        )}
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
