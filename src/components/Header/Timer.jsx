import React, { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Row
} from 'reactstrap'
import './Timer.css'

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setSeconds(0);
    setIsActive(false);
  }

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secondsRemainder = seconds % 60

  return (
      <div className="timer mr-3 my-auto">
        <Badge className="mr-1 align-middle">
            {hours}:
            {padZero(minutes)}:
            {padZero(secondsRemainder)}
        </Badge>
        {/* <button className={`button button-primary button-primary-${isActive ? 'active' : 'inactive'}`} onClick={toggle}> */}
        <Button onClick={toggle} color="primary" className="ml-1 py-1 align-middle">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={reset} color="danger" className="ml-1 py-1 align-middle">
          Stop
        </Button>
      </div>
  );
};

const padZero = (number) => {
  return ("0" + number).slice(-2)
}

export default Timer;