import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import './Timelog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import DeleteModal from './DeleteModal';

import { editTimeEntry, postTimeEntry } from '../../actions/timeEntries';
import { updateUserProfile } from '../../actions/userProfile';
import hasPermission from 'utils/permissions';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

import checkNegativeNumber from 'utils/checkNegativeHours';

const TimeEntry = ({ data, displayYear, userProfile }) => {

  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(modal => !modal);

  const dateOfWork = moment(data.dateOfWork);
  const { user } = useSelector(state => state.auth);

  const isOwner = data.personId === user.userid;
  const isSameDay =
    moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD') === data.dateOfWork;
  const role = user.role;

  const canDelete =
    //permission to Delete time entry from other user's Dashboard
    dispatch(hasPermission('deleteTimeEntryOthers')) ||
    //permission to delete any time entry on their own time logs tab
    dispatch(hasPermission('deleteTimeEntry')) ||
    //default permission: delete own sameday tangible entry
    (!data.isTangible && isOwner && isSameDay);

  const canEdit =
    //permission to edit any time log entry (from other user's Dashboard
    dispatch(hasPermission('editTimelogInfo')) ||
    //permission to edit any time entry on their own time logs tab
    dispatch(hasPermission('editTimeEntry')) ||
    //default permission: edit own sameday timelog entry
    (isOwner && isSameDay && (role === "Owner" || role === "Administrator"));
  const projectCategory = data.category?.toLowerCase() || '';
  const taskClassification = data.classification?.toLowerCase() || '';

  const toggleTangibility = () => {
    const newData = {
      ...data,
      isTangible: !data.isTangible,
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
  };

  return (
    <Card className="mb-1 p-2" style={{ backgroundColor: data.isTangible ? '#CCFFCC' : '#CCFFFF' }}>
      <Row className="mx-0">
        <Col md={3} className="date-block px-0">
          <div className="date-div">
            <div>
              <h4>{dateOfWork.format('MMM D')}</h4>
              {displayYear && <h5>{dateOfWork.format('YYYY')}</h5>}
              <h5 className="text-info">{dateOfWork.format('dddd')}</h5>
            </div>
          </div>
        </Col>
        <Col md={4} className="px-0">
          <h4 className="text-success">
            {data.hours}h {data.minutes}m
          </h4>
          <div className="text-muted">Project/Task:</div>
          <h6> {data.projectName || data.taskName} </h6>
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
              <span>
                <FontAwesomeIcon
                  icon={faEdit}
                  size="lg"
                  className="mr-3 text-primary"
                  onClick={toggle}
                />
                <TimeEntryForm
                  edit={true}
                  userId={data.personId}
                  data={data}
                  toggle={toggle}
                  isOpen={modal}
                  userProfile={userProfile}
                />
              </span>
            )}
            {canDelete && (
              <DeleteModal
                timeEntry={data}
                userProfile={userProfile}
                projectCategory={projectCategory}
                taskClassification={taskClassification}
              />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TimeEntry;
