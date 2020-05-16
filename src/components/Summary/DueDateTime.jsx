import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import CountdownTimer from './CountdownTimer';

function DueDateTime({ dueDate }) {
  return (
    <div className="float-right">
      <div className="mb-1">Due Date and Time</div>
      <div className="mx-auto due-section">
        <div className="text-white due-section__date">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />
          {' '}
          {dueDate.format('YYYY-MM-DD')}
          {' '}
          at 23:59
        </div>
        <CountdownTimer date={dueDate} />
      </div>
    </div>
  );
}

export default DueDateTime;
