import React, { useState } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useSelector } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import './Timelog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import DeleteModal from './DeleteModal';
import { useDispatch } from 'react-redux';
import { editTimeEntry, postTimeEntry } from '../../actions/timeEntries';
import { updateUserProfile } from '../../actions/userProfile';
import hasPermission from 'utils/permissions';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { useEffect } from 'react';
import checkNegativeNumber from 'utils/checkNegativeHours';

const TimeEntry = ({ data, displayYear, userProfile }) => {
  const [modal, setModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskClassification, setTaskClassification] = useState('');

  const toggle = () => setModal(modal => !modal);

  const dateOfWork = moment(data.dateOfWork);
  const { user } = useSelector(state => state.auth);
  const userPermissions = user?.permissions?.frontPermissions;
  const { roles } = useSelector(state => state.role);

  const isOwner = data.personId === user.userid;
  const isSameDay =
    moment()
      .tz('America/Los_Angeles')
      .format('YYYY-MM-DD') === data.dateOfWork;
  const role = user.role;

  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(ENDPOINTS.PROJECT_BY_ID(data.projectId))
      .then(res => {
        setProjectCategory(res?.data.category.toLowerCase() || '');
        setProjectName(res?.data?.projectName || '');
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      // Note: Here taskId is stored in projectId since no taskId field in timeEntry schema
      .get(ENDPOINTS.GET_TASK(data.projectId))
      .then(res => {
        setTaskClassification(res?.data?.classification.toLowerCase() || '');
        setTaskName(res?.data?.taskName || '');
      })
      .catch(err => console.log(err));
  }, []);

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
    if (projectName) {
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
          <h6> {projectName || taskName} </h6>
          <span className="text-muted">Tangible:&nbsp;</span>
          <input
            type="checkbox"
            name="isTangible"
            checked={data.isTangible}
            disabled={!hasPermission(role, 'toggleTangibleTime', roles, userPermissions)}
            onChange={() => toggleTangibility(data)}
          />
        </Col>
        <Col md={5} className="pl-2 pr-0">
          <div className="text-muted">Notes:</div>
          {ReactHtmlParser(data.notes)}
          <div className="buttons">
            {(hasPermission(role, 'editTimeEntry', roles, userPermissions) ||
              (isOwner && isSameDay)) && (
              <span>
                <FontAwesomeIcon
                  icon={faEdit}
                  size="lg"
                  className="mr-3 text-primary"
                  onClick={toggle}
                />
                <TimeEntryForm
                  edit
                  userId={data.personId}
                  data={data}
                  toggle={toggle}
                  isOpen={modal}
                  userProfile={userProfile}
                />
              </span>
            )}
            {(hasPermission(role, 'deleteTimeEntry', roles, userPermissions) ||
              (!data.isTangible && isOwner && isSameDay)) && (
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
