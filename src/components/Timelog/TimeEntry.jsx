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
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

import checkNegativeNumber from 'utils/checkNegativeHours';

/**
 * This component can be imported in TimeLog component's week tabs and Tasks tab
 *  1. In TimeLog - current week time log, last week, week before ... tabs:
 *    time entry data are from state.timeEntries;
 *    time entry user profile is from state.userProfile
 * 
 *  2. In TimeLog - Tasks tab:
 *    time entry data and user profile are both from state.teamMemberTasks.usersWithTimeEntries
 * 
 *  check boolean value of fromTaskTab to decide which state to change upon time entry edit
 */

const TimeEntry = (props) => {
  // props from parent
  const { fromTaskTab, data, displayYear, timeEntryUserProfile } = props
  // props from store
  const { authUser } = props;

  const { _id: timeEntryUserId } = timeEntryUserProfile;

  const [timeEntryFormModal, setTimeEntryFormModal] = useState(false);
  const dispatch = useDispatch();

  const { 
    dateOfWork, 
    personId, 
    isTangible, 
    projectName, 
    projectCategory,
    taskName,
    taskClassification,
  } = data;

  const toggle = () => setTimeEntryFormModal(modal => !modal);

  const timeEntryDate = moment(dateOfWork);

  const isAuthUser = personId === authUser.userid;
  const isSameDay = moment().tz('America/Los_Angeles').format('YYYY-MM-DD') === dateOfWork;
  const role = authUser.role;

  const canDelete =
    //permission to Delete time entry from other user's Dashboard
    dispatch(hasPermission('deleteTimeEntryOthers')) ||
    //permission to delete any time entry on their own time logs tab
    dispatch(hasPermission('deleteTimeEntry')) ||
    //default permission: delete own sameday tangible entry
    (!isTangible && isAuthUser && isSameDay);

  const canEdit =
    //permission to edit any time log entry (from other user's Dashboard
    dispatch(hasPermission('editTimelogInfo')) ||
    //permission to edit any time entry on their own time logs tab
    dispatch(hasPermission('editTimeEntry')) ||
    //permission to toggle tangible
    dispatch(hasPermission('editTimeEntryToggleTangible')) ||
    //default permission: edit own sameday timelog entry
    (isAuthUser && isSameDay) ||
    // Administrator/Owner can add time entries for any dates.
    (role === 'Owner' || role === 'Administrator');

  const toggleTangibility = () => {
    //Update intangible hours property in userprofile
    const formattedHours = parseFloat(data.hours) + parseFloat(data.minutes) / 60;
    const { hoursByCategory } = timeEntryUserProfile;
    if (data.projectName) {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === projectCategory);
      //change tangible to intangible
      if (data.isTangible) {
        timeEntryUserProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        timeEntryUserProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    } else {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === taskClassification);
      //change tangible to intangible
      if (data.isTangible) {
        timeEntryUserProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        timeEntryUserProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    }
    checkNegativeNumber(timeEntryUserProfile);

    const newData = {
      ...data,
      isTangible: !data.isTangible,
    };

    if (fromTaskTab) {
      dispatch(editTeamMemberTimeEntry(newData));
    } else {
      dispatch(editTimeEntry(data._id, newData));
      dispatch(updateUserProfile(timeEntryUserProfile));
      dispatch(getTimeEntriesForWeek(timeEntryUserId, 0));
    }
  };


  return (
    <>
      <Card className="mb-1 p-2" style={{ backgroundColor: data.isTangible ? '#CCFFCC' : '#CCFFFF' }}>
        <Row className="mx-0">
          <Col md={3} className="date-block px-0">
            <div className="date-div">
              <div>
                <h4>{timeEntryDate.format('MMM D')}</h4>
                {displayYear && <h5>{timeEntryDate.format('YYYY')}</h5>}
                <h5 className="text-info">{timeEntryDate.format('dddd')}</h5>
              </div>
            </div>
          </Col>
          <Col md={4} className="px-0">
            <h4 className="text-success">
              {data.hours}h {data.minutes}m
            </h4>
            <div className="text-muted">Project/Task:</div>
            <p> 
              {projectName} 
              <br />
              {taskName && `\u2003 ↳ ${taskName}`} 
            </p>
            <span className="text-muted">Tangible:&nbsp;</span>
            <input
              type="checkbox"
              name="isTangible"
              checked={data.isTangible}
              disabled={!canEdit}
              onChange={toggleTangibility}
              />
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="text-muted">Notes:</div>
            {ReactHtmlParser(data.notes)}
            <div className="buttons">
              {canEdit && !fromTaskTab && (
              <button className="mr-3 text-primary">
                <FontAwesomeIcon
                  icon={faEdit}
                  size="lg"
                  onClick={toggle}
                />
              </button>
              )}
              {canDelete && !fromTaskTab && (
                <button className='text-primary'>
                  <DeleteModal
                    timeEntry={data}
                    userProfile={timeEntryUserProfile}
                    projectCategory={projectCategory}
                    taskClassification={taskClassification}
                  />
                </button>
              )}
            </div>
          </Col>
        </Row>
      </Card>
      <TimeEntryForm
        edit={true}
        data={data}
        toggle={toggle}
        isOpen={timeEntryFormModal}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  authUser: state.auth.user,
  displayUserId: state.userProfile._id,
  displayUserProjects: state.userProjects.projects,
  displayUserTasks: state.userTask,
})

export default connect(mapStateToProps, null)(TimeEntry);
