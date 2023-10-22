import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'reactstrap';
import ReactHtmlParser from 'react-html-parser';
import './filteredTimeEntries.css';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

import moment from 'moment';
import { hrsFilterBtnRed, hrsFilterBtnBlue } from 'constants/colors';

const FilteredTimeEntries = ({ data, displayYear }) => {
  const [projectName, setProjectName] = useState('');
  const [projectCategory, setProjectCategory] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskClassification, setTaskClassification] = useState('');

  const dateOfWork = moment(data.dateOfWork);

  const renderColorBar = () => {
    const pastTwentyFourHrs = moment()
      .tz('America/Los_Angeles')
      .subtract(24, 'hours')
      .format('YYYY-MM-DD');

    const pastFortyEightHrs = moment()
      .tz('America/Los_Angeles')
      .subtract(48, 'hours')
      .format('YYYY-MM-DD');

    if (moment(dateOfWork).isSameOrAfter(pastTwentyFourHrs)) {
      return (
        <div
          className="color-bar"
          style={{
            backgroundColor: projectName ? 'white' : hrsFilterBtnRed,
            border: '5px solid ' + hrsFilterBtnRed,
          }}
        ></div>
      );
    } else if (moment(dateOfWork).isSameOrAfter(pastFortyEightHrs)) {
      return (
        <div
          className="color-bar"
          style={{
            backgroundColor: projectName ? 'white' : hrsFilterBtnBlue,
            border: '5px solid ' + hrsFilterBtnBlue,
          }}
        ></div>
      );
    } else {
      return (
        <div
          className="color-bar"
          style={{ backgroundColor: projectName ? 'white' : 'green', border: '5px solid green' }}
        ></div>
      );
    }
  };

  useEffect(() => {
    if (!data.projectId) return; // some projectId are empty strings. calling PROJECT_BY_ID will return 400

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

  return (
    <div className="filtered-timelog-container">
      {renderColorBar()}
      <Card
        className="mb-1 p-2 timelog-card"
        style={{ backgroundColor: data.isTangible ? '#CCFFCC' : '#CCFFFF', wordBreak: 'break-all' }}
      >
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
            <div className="text-muted">
              {projectName ? <b>Project</b> : 'Project'}/{taskName ? <b>Task</b> : 'Task'}:
            </div>
            <h6> {projectName || taskName} </h6>
            <span className="text-muted">Tangible:&nbsp;</span>
            <h6>{data.isTangible ? 'Tangible' : 'Intangible'}</h6>
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="text-muted">Notes:</div>
            {ReactHtmlParser(data.notes)}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FilteredTimeEntries;
