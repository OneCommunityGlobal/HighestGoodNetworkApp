import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import { CountdownTimer } from './CountdownTimer';
import { boxStyle } from 'styles';

function DueDateTime({ dueDate, isShow }) {
  // The display time should add 1 sec so it displays Sunday at 00:00 and not Saturday at 23:59:59.
  const displayTime = moment(dueDate)
    .tz('America/Los_Angeles')
    .add(1, 'second');
  return (
    <div className="my-4 my-md-1">
      {isShow ? (
        <div className="mb-1">Weekly Summary Due Date (click to close)</div>
      ) : (
        <div className="mb-1">Weekly Summary Due Date (click to add)</div>
      )}
      <div className="mx-auto due-section" style={boxStyle}>
        <div className="text-white due-section__date">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />{' '}
          {displayTime.format('YYYY-MMM-DD')} at {displayTime.format('HH:mm')} PST
        </div>
        <CountdownTimer date={dueDate} />
      </div>
    </div>
  );
}

DueDateTime.propTypes = {
  dueDate: PropTypes.shape({
    format: PropTypes.func,
  }).isRequired,
};

export default DueDateTime;
