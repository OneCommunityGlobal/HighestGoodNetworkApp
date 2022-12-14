import React, { useEffect, useState } from 'react';
import './Timer.css';
import { Badge } from 'reactstrap'


export const currentTime = () => {
  const locale = 'en';
  // Save the current date to be able to trigger an update
  const [today, setDate] = useState(new Date()); 

 useEffect(() => {
    // Creates an interval which will update the current data every minute
      const timer = setInterval(() => { 
      // This will trigger a rerender every component that uses the useDate hook.
      setDate(new Date());
    }, 60 * 1000);
    return () => {
      // Return a funtion to clear the timer so that it will stop being called on unmount
      clearInterval(timer); 
    }
  }, []);

  const day = today.toLocaleDateString(locale, { weekday: 'long' });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, { month: 'long' })}\n\n`;

  const hour = today.getHours();

  const time = today.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });

  return {
    date,
    time
  };
};

 const TimeLogRefresh = () => {
  const { date, time } = currentTime();

  return (
    <div style={{ zIndex: 2 }}className="timer">
    <Badge className="mr-1">{date}{time}</Badge>
    </div>
  );
};


export default TimeLogRefresh;

