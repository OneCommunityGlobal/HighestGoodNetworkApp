import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { startTimer, pauseTimer, stopTimer } from '../../actions/timer';
import {
  Badge,
  Button,
  Row,
  ButtonGroup
} from 'reactstrap'
import './Timer.css'

const Timer = () => {
  const userId = useSelector(state => state.auth.user.userid);
  const pausedAt = useSelector(state => state.timer.seconds);
  const dispatch = useDispatch();

  const [seconds, setSeconds] = useState(pausedAt);
  const [isActive, setIsActive] = useState(false);

  const toggle = () => setIsActive(!isActive);

  const reset = () => {
    setSeconds(0);
    setIsActive(false);
  }

  const handleStart = async event => {
    const status = await startTimer(userId, seconds);
    if (status === 200 || status === 201) {
      toggle();
    }  
  }

  const handlePause = async event => {
    const status = await dispatch(pauseTimer(userId, seconds));
    if (status === 200 || status === 201) {
      toggle();
    }
  }
  const handleStop = async event => {
    const status = await dispatch(stopTimer(userId));
    if (status === 200 || status === 201) {
      reset();
    }
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
      <div className="timer mr-4 my-auto">
        <Badge className="mr-1 align-middle">
            {hours}:
            {padZero(minutes)}:
            {padZero(secondsRemainder)}
        </Badge>
        <Button onClick={isActive ? handlePause : handleStart} color={isActive ? 'primary' : 'success'} className="ml-1 p-1 align-middle">
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleStop} color="danger" className="ml-1 p-1 align-middle">
          Stop
        </Button>
      </div>
  );
};

const padZero = (number) => {
  return ("0" + number).slice(-2)
}

export default Timer;