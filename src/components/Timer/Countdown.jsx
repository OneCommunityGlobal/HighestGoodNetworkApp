import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import {
  BsFillPenFill,
  BsPauseFill,
  BsPlay,
  BsStopFill,
  BsArrowCounterclockwise,
} from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { Input, Button } from 'reactstrap';
import './Countdown.css';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';

const Countdown = ({
  message,
  handlePause,
  handleStart,
  handleStop,
  handleSetGoal,
  handleAddGoal,
  handleRemoveGoal,
  handleUserCanStop,
  setPreviewTimer,
  handleClear,
  toggleModal,
  alarm,
  handlePauseAlarm,
  logModal,
  triggerAudio,
  setTimerIsOverModalIsOpen,
  userIsRunningTimerAndHasAtLeastOneMinute,
}) => {
  const MAX_HOURS = 5;
  const MIN_MINS = 15;
  const [running, setRunning] = useState(false);
  const [time, setTimer] = useState(0);
  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState(MAX_HOURS);
  const [minutes, setMinutes] = useState(0);

  // This function is used to check if we need to disable the add time btns
  const shouldDisableBtn = (min, add = true) => {
    let time;
    if (add) {
      time = moment.duration(message?.goal ?? 0, 'milliseconds').add(min, 'minutes');
      return time.asHours() > 10;
    }
    time = moment.duration(message?.goal ?? 0, 'milliseconds').subtract(min, 'minutes');
    return time.asMinutes() < 15;
  };

  /*
   * Here we are just enforcing the min max atributes from the input number
   * If the number in less than the min we set it
   * If is greater we set the max number
   * */

  const forceMinMax = (e, h = false) => {
    let { value, min, max } = e.target;
    value = Math.max(Number(min), Math.min(Number(max), Number(value)));
    if (h) setHours(value);
    else {
      setMinutes(value);
    }
  };

  /*
   * Here we check if the timer that we get from the user input is valid
   * We use moment here to get the hours and minutes from the string
   * We then create a duration object with the hours and minutes
   * After we check if the duration is greater than the MAX HOURS and if it is we set the time to the MAX HOURS
   * else we check if the time is less than MIN_MINS and if it is we set the time to MIN_MINS
   * we then handle the set goal function that we get from the parent component
   * and set the editing to false
   * */
  const validateTime = () => {
    let dur = moment.duration(hours, 'hours').add(minutes, 'minutes');

    handleSetGoal(dur.asMilliseconds());
    setMinutes(minutes);

    if (dur.asHours() > MAX_HOURS) {
      setHours(MAX_HOURS);
      setMinutes(0);
      dur = moment.duration(MAX_HOURS, 'hours');
    } else if (dur.asMinutes() < MIN_MINS) {
      setHours(0);
      setMinutes(MIN_MINS);
      dur = moment.duration(minutes, 'minutes');
    }
    setEditing(false);
  };

  /*
   * This is the remaining time of the timer
   * Since we are on a countdown we need to get the remaining time
   * We get the current time and the last access time
   * We then get the remaining time by subtracting the time from the msg and the elapsedtime
   * If the remaining time is less than 0 we set the remaining time to 0
   * then we trigger the alarm function, stop and toggle the modal to open
   * */

  useEffect(() => {
    if (logModal) {
      remainingTime(true);
    }
  }, [logModal, remainingTime]);

  useEffect(() => {
    if (triggerAudio) {
      remainingTime(true);
    }
  }, [triggerAudio, remainingTime]);

  const intervalRef = useRef(null);

  const remainingTime = useCallback(
    (shouldStopAndCleanTimer = false) => {
      if (!shouldStopAndCleanTimer) {
        const now = moment();
        const lastAccess = moment(message.lastAccess);
        const elapsedTime = moment.duration(now.diff(lastAccess)).asMilliseconds();
        let remaining = message.time - elapsedTime;
        if (remaining < 0) {
          remaining = 0;
          setTimerIsOverModalIsOpen(true);
          handleStop();

          intervalRef.current = setInterval(() => {
            alarm();
          }, 1000);
        } else {
          resetCounter();
        }

        return remaining;
      } else {
        resetCounter();
      }
    },
    [message, running, setTimerIsOverModalIsOpen]
  );

  const resetCounter = () => {
    handlePauseAlarm();
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  /*
   * Here we update the state of the timer when we get a new message from the server
   * We check if the message is not null
   * We then set the running state to the opposite of the paused state
   * We then set the value to the goal time using moment because it comes as milliseconds
   * We then set the hours and minutes
   * We then set the timer to the time of the message
   * We then set the preview timer to the time of the message
   * */
  useEffect(() => {
    if (message !== null) {
      setRunning(!message.paused);
      const goal = moment.utc(message.goal);
      setHours(goal.hours());
      setMinutes(goal.minutes());
      setTimer(message.time);
      setPreviewTimer(message.time);
    }
  }, [message]);

  /*
   * Here we update the state of the countdown
   * We check if the timer is running
   * We then set the interval to run every second because of the preview Timer that uses HH:mm:ss
   * We then get the remaining time, for this we need to track the msg on the useEffect
   * Then we set the timer to the remaining time and the previewTimer
   * */
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const remaining = remainingTime();
        setTimer(remaining);
        setPreviewTimer(remaining);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, message]);

  /*
   * Here is the countdown component
   * We display the timer here using HH:mm format
   * Then we check if the timer is running and if it is we display the pause button and stop button
   * else we display the play button
   * If the time is less than the message goal or is running we show an add goal footer
   * else we show an edit goal footer
   * On the edit goal field we handle the timer using the function validateTime
   * and if we save the time we send to the server the goal to set
   * For now the MAX_HOURS for a single run without adding more time is 5 hours, but you change this
   * easily by changing the MAX_HOURS variable
   * */

  return (
    <div className="countdown">
      <BsArrowCounterclockwise
        onClick={handleClear}
        className="transition-color btn-white"
        fontSize="2rem"
        title="Reset the timer"
      />
      <div className="countdown-circle">
        <CircularProgressbarWithChildren
          value={message ? (time / message.goal) * 100 : 100}
          counterClockwise={true}
          styles={buildStyles({
            strokeLinecap: 'round',
            pathTransitionDuration: 0.5,
            pathColor: 'rgba(237, 104, 138, 1)',
            trailColor: 'rgba(210, 100, 169, 0.2)',
          })}
        >
          <div className="content">
            <div className="time">
              <div className="time-value">{moment.utc(time).format('HH:mm')}</div>
              <span className="label hours">hours</span>
              <span className="label mins">minutes</span>
            </div>
            {running ? (
              <div className="goal">
                <BsPauseFill
                  className="transition-color btn-purple"
                  onClick={handlePause}
                  fontSize="3rem"
                />
                <button
                  type="button"
                  className="btn-stop"
                  onClick={handleUserCanStop}
                >
                  <BsStopFill
                    fontSize="3rem"
                    className={`${
                      'transition-color btn-purple'
                    }`}
                  />
                </button>
              </div>
            ) : (
              <>
                <div>Time Remaining</div>
                <BsPlay
                  className="transition-color btn-purple"
                  onClick={() => {
                    if (editing) validateTime();
                    handleStart();
                  }}
                  fontSize="3rem"
                />
              </>
            )}
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="bottom">
        {time < message.goal || running ? (
          <>
            <div className="add-grid transition-color">
              <Button
                size="sm"
                disabled={shouldDisableBtn(15, false)}
                onClick={() => handleRemoveGoal(1000 * 60 * 15)}
              >
                -15 m
              </Button>
              <Button
                size="sm"
                disabled={shouldDisableBtn(15)}
                onClick={() => handleAddGoal(1000 * 60 * 15)}
              >
                +15 m
              </Button>
              <Button
                size="sm"
                disabled={shouldDisableBtn(30)}
                onClick={() => handleAddGoal(1000 * 60 * 30)}
              >
                +30 m
              </Button>
              <Button
                size="sm"
                disabled={shouldDisableBtn(60)}
                onClick={() => handleAddGoal(1000 * 60 * 60)}
              >
                +1 h
              </Button>
            </div>
          </>
        ) : (
          <>
            <strong>Goal for today</strong>
            <div className="goal">
              <Input
                type="number"
                className="hours"
                min={0}
                max={MAX_HOURS}
                value={Number(hours).toString()}
                onChange={e => forceMinMax(e, true)}
                disabled={!editing}
              />
              :
              <Input
                type="number"
                min={0}
                max={59}
                value={Number(minutes).toString()}
                onChange={e => forceMinMax(e)}
                disabled={!editing}
              />{' '}
              {editing ? (
                <FaSave
                  className="transition-color btn-white goal-btn"
                  onClick={() => validateTime()}
                />
              ) : (
                <BsFillPenFill
                  className="transition-color btn-white goal-btn"
                  onClick={() => setEditing(true)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Countdown;