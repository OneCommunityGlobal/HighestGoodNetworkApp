import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useDispatch, connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import './Timelog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import DeleteModal from './DeleteModal';

import { editTimeEntry, getTimeEntriesForWeek } from '../../actions/timeEntries';
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import { editTeamMemberTimeEntry } from '../../actions/task';
import hasPermission from 'utils/permissions';
import { hrsFilterBtnColorMap } from 'constants/colors';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { toast } from 'react-toastify';

/**
 * This component can be imported in TimeLog component's week tabs and Tasks tab
 *  1. In TimeLog - current week time log, last week, week before ... tabs:
 *    time entry data are from state.timeEntries;
 *    time entry user profile is from state.userProfile
 * 
 *  2. In TimeLog - Tasks tab:
 *    time entry data and user profile are both from state.teamMemberTasks.usersWithTimeEntries
 * 
 *  check string value of from to decide which state to change upon time entry edit
 */

const TimeEntry = (props) => {
  // props from parent
  const { from, data, displayYear, timeEntryUserProfile, displayUserProjects, displayUserTasks, tab } = props
  // props from store
  const { authUser } = props;

  const { _id: timeEntryUserId } = timeEntryUserProfile;
  const { _id: timeEntryId } = data;
  const { 
    dateOfWork, 
    isTangible, 
    hours,
    minutes,
    projectId,
    taskId,
    notes,
  } = data;
  const projectDetailsSetup =()=>{
     try {
         if(from === 'TaskTab' && data){
             return {
               projectName: data?.projectName||"",
               projectCategory: data?.projectCategory||"",
               taskName:data?.taskName||"",
               taskClassification : data?.taskClassification || ""
             }
         }
         else
         {
          const timeEntryProject = displayUserProjects.find(project => project.projectId === projectId);
          let returnObj = {}
           if(timeEntryProject!=undefined){
               returnObj ={
                projectName: timeEntryProject?.projectName || "",
                projectCategory: timeEntryProject?.projectCategory || "",
               }
           }
           if (taskId) {
            const timeEntryTask = displayUserTasks.find(task => task._id === taskId);
            if (timeEntryTask){
               returnObj ={...returnObj,taskName:timeEntryTask?.taskName||"",taskClassification:""}
            }    
          }
          return returnObj;
         }
     } catch (error) {
       console.log(error);
     }
  }
  const [timeEntryFormModal, setTimeEntryFormModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filteredColor,setFilteredColor] = useState(hrsFilterBtnColorMap[7]);
  const [projectDetails,setProjectDetails] = useState(projectDetailsSetup())
  const dispatch = useDispatch();

 


  const cantEditJaeRelatedRecord = cantUpdateDevAdminDetails(timeEntryUserProfile ?.email ? timeEntryUserProfile.email : '', authUser.email);

  //moved below code to another function 
  // if (from === 'TaskTab') {
  //   // Time Entry rendered under Tasks tab
  //   ({ projectName, projectCategory, taskName, taskClassification } = data)
  // } else {
  //   // Time Entry rendered under weekly tabs
  //   try {
  //     const timeEntryProject = displayUserProjects.find(project => project.projectId === projectId);
  //     console.log(timeEntryProject);
  //   if(timeEntryProject!=undefined){  
  //     ({ projectName, projectCategory } = timeEntryProject);
  //   }
  //   if (taskId) {
  //     const timeEntryTask = displayUserTasks.find(task => task._id === taskId);
  //     console.log('timeEntryTask', timeEntryTask)
  //     if (timeEntryTask) ({ taskName, taskClassification = '' } = timeEntryTask); // temporary fix for timeentry of tasks not have current user as resource
  //   }
  //   } catch (error) {
  //     console.log(error)
  //   }
    
  // }

  const toggle = () => setTimeEntryFormModal(modal => !modal);

  const isAuthUser = timeEntryUserId === authUser.userid;
  const isSameDay = moment().tz('America/Los_Angeles').format('YYYY-MM-DD') === dateOfWork;

  //default permission: auth use can edit own sameday timelog entry, but not tangibility
  const isAuthUserAndSameDayEntry = isAuthUser && isSameDay;

  //permission to edit any time log entry (from other user's Dashboard
  // For Administrator/Owner role, hasPermission('editTimelogInfo') should be true by default
  const canEdit = (dispatch(hasPermission('editTimelogInfo'))
    //permission to edit any time entry on their own time logs tab
    || dispatch(hasPermission('editTimeEntry'))) && !cantEditJaeRelatedRecord;

  //permission to Delete time entry from other user's Dashboard
  const canDelete = (dispatch(hasPermission('deleteTimeEntryOthers')) && !cantEditJaeRelatedRecord) ||
    //permission to delete any time entry on their own time logs tab
    dispatch(hasPermission('deleteTimeEntry')) ||
    //default permission: delete own sameday tangible entry
    isAuthUserAndSameDayEntry;
  
  const toggleTangibility = async () => {
    setIsProcessing(true);
    const newData = {
      ...data,
      isTangible: !isTangible,
    };
    try {
      if (from === 'TaskTab') {
        await dispatch(editTeamMemberTimeEntry(newData));
      } else if (from === 'WeeklyTab') {
        await dispatch(editTimeEntry(timeEntryId, newData));
        await dispatch(getTimeEntriesForWeek(timeEntryUserId, tab));
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
    setIsProcessing(false);
  };

  const editFilteredColor = ()=>{
    try {
    const daysPast = moment().diff(dateOfWork, 'days');
     let choosenColor ="";
     switch (daysPast) {
      case 0:
         choosenColor = hrsFilterBtnColorMap[1]
         break;
      case 1:
          choosenColor = hrsFilterBtnColorMap[2];
          break;
      case 2:
          choosenColor = hrsFilterBtnColorMap[3];
          break;
      case 3:
          choosenColor = hrsFilterBtnColorMap[4];
          break;
      default:
          choosenColor = hrsFilterBtnColorMap[7];
     }
     setFilteredColor(choosenColor);
    } catch (error) {
      console.log(error);
    }
  }
  
  
  useEffect(()=>{
     editFilteredColor();
  },[])

  useEffect(()=>{
     setProjectDetails(projectDetailsSetup());
  },[from])

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: '12px',
          marginBottom: '4px',
          border: `5px solid ${filteredColor}`,
          backgroundColor: taskId ? filteredColor : 'white',
        }}
      ></div>
      <Card className="mb-1 p-2" style={{ backgroundColor: isTangible ? '#CCFFCC' : '#CCFFFF', flexGrow: 1, maxWidth: "calc(100% - 12px)" }}>
        <Row className="mx-0">
          <Col md={3} className="date-block px-0">
            <div className="date-div">
              <div>
                <h4>{moment(dateOfWork).format('MMM D')}</h4>
                {displayYear && <h5>{moment(dateOfWork).format('YYYY')}</h5>}
                <h5 className="text-info">{moment(dateOfWork).format('dddd')}</h5>
              </div>
            </div>
          </Col>
          <Col md={4} className="px-0">
            <h4 className="text-success">
              {hours}h {minutes}m
            </h4>
            <div className="text-muted">Project/Task:</div>
            <p> 
              {projectDetails?.projectName} 
              <br />
              {projectDetails?.taskName && `\u2003 ↳ ${projectDetails?.taskName}`} 
            </p>
            <div className='mb-3'>
              {
                canEdit
                  ? (
                    <>
                      <span className="text-muted">Tangible:&nbsp;</span>
                      <input
                        type="checkbox"
                        name="isTangible"
                        checked={isTangible}
                        disabled={!canEdit || isProcessing}
                        onChange={toggleTangibility}
                      />
                      {isProcessing ? <span> Processing... </span> : null}
                    </>
                  )
                  : <span className="font-italic">{isTangible ? 'Tangible' : 'Intangible'}</span>
              }
            </div>
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="text-muted">Notes:</div>
            {ReactHtmlParser(notes)}
            <div className="buttons">
              {((canEdit || isAuthUserAndSameDayEntry) && !cantEditJaeRelatedRecord)
                && from === 'WeeklyTab'
                && (
                  <button className="mr-3 text-primary">
                    <FontAwesomeIcon icon={faEdit} size="lg" onClick={toggle} />
                  </button>
                )}
              {canDelete && from === 'WeeklyTab' && (
                <button className='text-primary'>
                  <DeleteModal timeEntry={data} />
                </button>
              )}
            </div>
          </Col>
        </Row>
      </Card>
      {/* this TimeEntryForm could be rendered from either weekly tab or task tab */}
      <TimeEntryForm
        from={from}
        edit={true}
        data={data}
        toggle={toggle}
        isOpen={timeEntryFormModal}
        tab={tab}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  authUser: state.auth.user,
})

export default connect(mapStateToProps, null)(TimeEntry);
