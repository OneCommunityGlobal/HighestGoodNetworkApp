import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';


//Callback function stored with all args in reference.current
const useCurrentCallback = (callback) => {
  const reference = useRef();
  reference.current = callback;
  return (...args) => {
    return reference.current?.(...args);
  };
};

const App = () => {
  //Setting time variable to initial state
  const [time, setTime] = useState(0);
  const currentCallback = useCurrentCallback(() => {
    //using callback function to refresh date
    const date = new Date();
    //update current time
    setTime(date.toISOString());
  });
  useEffect(() => {
    // setting refresh period to every 10 seconds
    const handle = setInterval(currentCallback, 10000);
    return () => clearInterval(handle);
  }, []);
  return (
    //display of current time
    <div>{time}</div>
  );
};