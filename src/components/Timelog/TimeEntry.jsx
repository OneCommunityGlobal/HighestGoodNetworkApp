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
import hasPermission from 'utils/permissions';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

import checkNegativeNumber from 'utils/checkNegativeHours';

const TimeEntry = (props) => {
  // props from parent
  const { data, displayYear, userProfile } = props
  
  // props from store
  const { authUser, displayUserId, displayUserProjects, displayUserTasks } = props;

  const [modal, setModal] = useState(false);
  const dispatch = useDispatch();

  const { dateOfWork, personId, isTangible, projectId, taskId } = data;

  const toggle = () => setModal(modal => !modal);

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
    //default permission: edit own sameday timelog entry
    (isAuthUser && isSameDay) ||
    // Administrator/Owner can add time entries for any dates.
    (role === 'Owner' || role === 'Administrator');

  const project = displayUserProjects.filter(project => project.projectId === projectId)[0] || {};
  const { category, projectName } = project;
  const projectCategory = category?.toLowerCase() || '';
  
  const task = displayUserTasks.filter(task => task._id === taskId)[0] || {};
  const { classification, taskName } = task;
  const taskClassification = classification?.toLowerCase() || '';
  
  const toggleTangibility = () => {
    const newData = {
      ...data,
      isTangible: !data.isTangible,
      curruserId: curruserId,
      timeSpent: `${data.hours}:${data.minutes}:00`,
    };
    dispatch(editTimeEntry(data._id, newData));

    //Update intangible hours property in userprofile
    const formattedHours = parseFloat(data.hours) + parseFloat(data.minutes) / 60;
    const { hoursByCategory } = userProfile;
    if (data.projectName) {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === projectCategory);
      //change tangible to intangible
      if (data.isTangible) {
        userProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        userProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    } else {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === taskClassification);
      //change tangible to intangible
      if (data.isTangible) {
        userProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        userProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    }
    checkNegativeNumber(userProfile);
    dispatch(updateUserProfile(userProfile._id, userProfile));
    dispatch(getUserProfile(displayUserId));
    dispatch(getTimeEntriesForWeek(displayUserId, 0));
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
            <h6> {`${taskName ? projectName + ' / ' + taskName : projectName}`} </h6>
            <span className="text-muted">Tangible:&nbsp;</span>
            <input
              type="checkbox"
              name="isTangible"
              checked={data.isTangible}
              disabled={!canEdit}
              onChange={() => toggleTangibility(data)}
              />
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="text-muted">Notes:</div>
            {ReactHtmlParser(data.notes)}
            <div className="buttons">
              {canEdit && (
              <button className="mr-3 text-primary">
                <FontAwesomeIcon
                  icon={faEdit}
                  size="lg"
                  onClick={toggle}
                />
              </button>
              )}
              {canDelete && (
                <button className='text-primary'>
                  <DeleteModal
                    timeEntry={data}
                    userProfile={userProfile}
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
        userId={data.personId}
        data={data}
        toggle={toggle}
        isOpen={modal}
        userProfile={userProfile}
        displayUserId={displayUserId}
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
