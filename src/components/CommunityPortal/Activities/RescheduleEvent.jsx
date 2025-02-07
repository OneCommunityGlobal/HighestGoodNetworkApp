/* eslint-disable react/no-unescaped-entities */
// import React from 'react';
import './RescheduleEvent.css';

function RescheduleEvent() {
  // Placeholder function for button click
  const handleReschedule = () => {
    // eslint-disable-next-line no-alert
    alert('Event rescheduled!'); // Replace this with the actual functionality later
  };

  return (
    <div className="reschedule-page">
      <button onClick={handleReschedule} className="reschedule-button" type="button">
        Reschedule Event
      </button>
    </div>
  );
}

export default RescheduleEvent;
