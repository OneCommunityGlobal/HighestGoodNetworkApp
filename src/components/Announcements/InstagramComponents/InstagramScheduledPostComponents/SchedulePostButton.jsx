import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SchedulePostButton.css'; // We'll create this file for custom styles
import '../InstagramPostEditor/InstagramPostEditor.css'; // Importing the main CSS file for consistency

function SchedulePostButton({ onSchedulePost, isLoading }) {
  const [startDate, setStartDate] = useState(new Date());
  const [isScheduled, setIsScheduled] = useState(false);
  const [minTime, setMinTime] = useState(new Date());

  const handleScheduleClick = () => {
    if (onSchedulePost) {
      onSchedulePost(startDate);
      setIsScheduled(true);
    }
  };

  useEffect(() => {
    const now = new Date();

    if (startDate.toDateString() === now.toDateString()) {
      setMinTime(now);
    } else {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      setMinTime(midnight);
    }
  }, [startDate]);

  const handleDateChange = (date) => {
    setStartDate(date);
    setIsScheduled(false); // Reset scheduled state when date changes
  }

  return (
    <div className="schedule-post-button-container">
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        showTimeSelect
        timeIntervals={15}
        minDate={new Date()}
        minTime={minTime}
        maxTime={new Date().setHours(23, 59, 59)}
        dateFormat="MMMM d, yyyy h:mm aa"
        className="date-picker"
        placeholderText="Select date and time"
      />
      <button
        type="button"
        className="instagram-post-button"
        onClick={handleScheduleClick}
        disabled={isLoading || isScheduled}
      >
        {isLoading ? 'Scheduling...' : 'Schedule Post'}
      </button>
    </div>
  );
}

export default SchedulePostButton;