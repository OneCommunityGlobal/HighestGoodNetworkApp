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

const TimeEntry = ({ data, displayYear, userProfile }) => {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal((modal) => !modal);

  const dateOfWork = moment(data.dateOfWork);
  const { user } = useSelector((state) => state.auth);
  const isOwner = data.personId === user.userid;

  const isSameDay = moment().tz('America/Los_Angeles').format('YYYY-MM-DD') === data.dateOfWork;
  const isAdmin = user.role === 'Administrator';

  const dispatch = useDispatch();

  const toggleTangibility = () => {
    const newData = {
      ...data,
      isTangible: !data.isTangible,
      timeSpent: `${data.hours}:${data.minutes}:00`,
    };

    dispatch(editTimeEntry(data._id, newData));
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
          <h6> {data.projectName} </h6>
          <span className="text-muted">Tangible:&nbsp;</span>
          <input
            type="checkbox"
            name="isTangible"
            checked={data.isTangible}
            disabled={!isAdmin}
            onChange={() => toggleTangibility(data)}
          />
        </Col>
        <Col md={5} className="pl-2 pr-0">
          <div className="text-muted">Notes:</div>
          {ReactHtmlParser(data.notes)}
          <div className="buttons">
            {(isAdmin || (isOwner && isSameDay)) && (
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
            {(isAdmin || (!data.isTangible && isOwner && isSameDay)) && (
              <DeleteModal timeEntry={data} userProfile={userProfile} />
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TimeEntry;
