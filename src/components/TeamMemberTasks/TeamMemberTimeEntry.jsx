import React, { useState } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useSelector } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import '../Timelog/Timelog.css';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { useEffect } from 'react';

const TeamMemberTimeEntry = ({ data, displayYear, userProfile }) => {
  const [projectName, setProjectName] = useState('');
  const [taskName, setTaskName] = useState('');

  const dateOfWork = moment(data.dateOfWork);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    axios
      .get(ENDPOINTS.PROJECT_BY_ID(data.projectId))
      .then(res => {
        setProjectName(res?.data?.projectName || '');
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      // Note: Here taskId is stored in projectId since no taskId field in timeEntry schema
      .get(ENDPOINTS.GET_TASK(data.projectId))
      .then(res => {
        setTaskName(res?.data?.taskName || '');
      })
      .catch(err => console.log(err));
  }, []);

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
        </Col>
        <Col md={5} className="pl-2 pr-0">
          <div className="text-muted">Notes:</div>
          {ReactHtmlParser(data.notes)}
        </Col>
      </Row>
    </Card>
  );
};

export default TeamMemberTimeEntry;
