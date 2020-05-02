import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';

function DueDateTime() {
  return (
    <div className="float-right">
      Due Date and Time
      <div className="mx-auto due-section">
        <div className="text-white due-section__date">
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" />
          {' '}
          2020-04-25
        </div>
        <div className="due-section__time">23:59</div>
      </div>
    </div>
  );
}

export default DueDateTime;
