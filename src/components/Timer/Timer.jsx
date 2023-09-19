import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button } from 'reactstrap';
import { startTimer, pauseTimer, updateTimer, getTimerData } from '../../actions/timer';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import './Timer.css';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';

const Timer = () => {
  const data = {
    disabled: window.screenX <= 500,
    isTangible: true,
    //isTangible: window.screenX > 500
    //How does the screen position of the element influence tangability?
    //This has been changed as part of a hotfix.
  };
  const userId = useSelector(state => state.auth.user.userid);
  const userProfile = useSelector(state => state.auth.user);
  const pausedAt = useSelector(state => state.timer?.seconds);
  const isWorking = useSelector(state => state.timer?.isWorking);
  const dispatch = useDispatch();
  const alert = {
    va: true,
  };
  const [seconds, setSeconds] = useState(isNaN(pausedAt) ? 0 : pausedAt);
  const [isActive, setIsActive] = useState(false);
  const [modal, setModal] = useState(false);
  let intervalSec = null;
  let intervalMin = null;
  let intervalThreeMin = null;

  const toggle = () => setModal(modal => !modal);

  const reset = async () => {
    setSeconds(0);
    const status = await pauseTimer(userId, 0);
    if (status === 200 || status === 201) {
      setIsActive(false);
    }
  };
  const handleStart = async () => {
    await dispatch(getTimerData(userId));

    const status = await startTimer(userId, seconds);
    if ([9, 200, 2001].includes(status)) {
      setIsActive(true);
    }

    let maxtime = null;

    if (seconds === 0 && alert.va) {
      maxtime = setInterval(handleStop, 36000900);
      alert.va = !alert.va;
    } else {
      clearInterval(maxtime);
    }
  };

  const handleUpdate = async () => {
    try {
      const status = await updateTimer(userId);
      if (status === 9) {
        setIsActive(false);
      }
      await dispatch(getTimerData(userId));
    } catch (e) {}
  };

  const handlePause = async () => {
    await dispatch(getTimerData(userId));
    const status = await pauseTimer(userId, seconds);
    if (status === 200 || status === 201) {
      setIsActive(false);
      return true;
    }
    return false;
  };

  const handleStop = () => {
    toggle();
  };

  useEffect(() => {
    const fetchSeconds = async () => {
      try {
        const res = await axios.get(ENDPOINTS.TIMER(userId));
        if (res.status === 200) {
          setSeconds(res.data?.seconds || 0);
          setIsActive(res.data.isWorking);
        } else {
          setSeconds(isNaN(pausedAt) ? 0 : pausedAt);
        }
      } catch {
        setSeconds(isNaN(pausedAt) ? 0 : pausedAt);
      }
    };

    fetchSeconds();
  }, [pausedAt]);

  useEffect(() => {
    try {
      setIsActive(isWorking);
    } catch {}
  }, [isWorking]);

  useEffect(() => {
    if (isActive) {
      if (intervalThreeMin) {
        clearInterval(intervalThreeMin);
      }
      intervalSec = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);

      intervalMin = setInterval(handleUpdate, 60000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(intervalSec);
      clearInterval(intervalMin);
      if (intervalThreeMin) {
        clearInterval(intervalThreeMin);
      }
      //handles restarting timer if you restart it in another tab
      intervalThreeMin = setInterval(handleUpdate, 1800000);
    } else {
      clearInterval(intervalSec);
      clearInterval(intervalMin);
      if (intervalThreeMin) {
        clearInterval(intervalThreeMin);
      }
      //handles restarting timer if you restart it in another tab
      intervalThreeMin = setInterval(handleUpdate, 1800000);
    }
    return () => {
      clearInterval(intervalSec);
      clearInterval(intervalMin);
      if (intervalThreeMin) {
        clearInterval(intervalThreeMin);
      }
    };
  }, [isActive]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemainder = seconds % 60;

  return (
    <div style={{ zIndex: 2 }} className="timer">
      <Button onClick={reset} color="secondary" className="mr-1 align-middle">
        Clear
      </Button>
      <Badge className="mr-1 align-middle">
        {hours}:{padZero(minutes)}:{padZero(secondsRemainder)}
      </Badge>
      <div className="button-container">
        <Button
          id="start"
          onClick={isActive ? handlePause : handleStart}
          color={isActive ? 'info' : 'success'}
          className="ml-xs-1 align-middle start-btn"
        >
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={seconds !== 0 ? handleStop : null}
          color="danger"
          className="ml-1 align-middle"
        >
          Stop
        </Button>
      </div>
      {modal && (
        <TimeEntryForm
          edit={false}
          userId={userId}
          toggle={toggle}
          isOpen={true}
          timer={{ hours, minutes }}
          data={data}
          userProfile={userProfile}
          resetTimer={reset}
        />
      )}
    </div>
  );
};

const padZero = number => `0${number}`.slice(-2);

export default Timer;
