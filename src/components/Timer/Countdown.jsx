import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { BsAlarmFill, BsFillPenFill, BsPauseFill, BsPlay, BsStopFill } from 'react-icons/bs';
import { FaSave } from 'react-icons/fa';
import { Input } from 'reactstrap';
import './Countdown.css';
import moment from 'moment';
import { useEffect, useState } from 'react';

const Countdown = ({
  message,
  handlePause,
  handleStart,
  handleStop,
  handleSetGoal,
  handleAddGoal,
  setPreviewTimer,
}) => {
  const MAX_HOURS = 5;
  const [running, setRunning] = useState(false);
  const [time, setTimer] = useState(0);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(`0${MAX_HOURS}:00`);

  /*
  Here we check if the timer that we get from the user input is valid
  We use moment here to get the hours and minutes from the string
  We then create a duration object with the hours and minutes
  After we check if the duration is greater than the MAX HOURS and if it is we set the time to the MAX HOURS
  else we check if the time is less than 1 hour and if it is we set the time to 1 hour
  else we set the time to the value that the user input
  we then set the value to the new value if need be
  */
  const validTime = str => {
    const value = moment(str, 'HH:mm');
    const hours = value.hours();
    const minutes = value.minutes();
    let newValue = str;

    const dur = moment.duration(hours ? hours : 0, 'hours').add(minutes ? minutes : 0, 'minutes');
    if (dur.asHours() > MAX_HOURS) {
      newValue = `0${MAX_HOURS}:00`;
    } else if (dur.asHours() < 1) {
      newValue = '01:00';
    }

    setValue(newValue);
  };

  /*
  This is the remaining time of the timer
  Since we are on a countdown we need to get the remaining time
  We get the current time and the last access time
  We then get the difference between the two
  We then subtract the difference from the time of the timer and the elapsed time
  */
  const remainingTime = () => {
    const now = moment();
    const lastAccess = moment(message.lastAccess);
    const elapsedTime = moment.duration(now.diff(lastAccess)).asMilliseconds();
    return message.time - elapsedTime;
  };

  /*
  Here we update the state of the timer when we get a new message from the server
  We check if the message is not null
  We then set the running state to the opposite of the paused state
  We then set the value to the goal time using moment because it comes as milliseconds
  We then set the timer to the time of the message
  We then set the preview timer to the time of the message
  */
  useEffect(() => {
    if (message !== null) {
      setRunning(!message.paused);
      setValue(moment.utc(message.goal).format('HH:mm'));
      setTimer(message.time);
      setPreviewTimer(message.time);
    }
  }, [message]);

  /*
  Here we update the state of the countdown
  We check if the timer is running
  We then set the interval to run every second because of the preview Timer that uses HH:mm:ss
  We then get the remaining time, for this we need to track the msg on the useEffect
  Then we check if the remaining time is less than a second and if it is we set the timer to 0
  else we set the timer and preview timer to the remaining time
  */
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const remaining = remainingTime();
        setTimer(prevTime => {
          if (prevTime <= 1000) {
            handleStop();
            return 0;
          }
          return remaining;
        });
        setPreviewTimer(remaining);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, message]);

  /*
  Here is the countdown component
  We display the timer here using HH:mm format
  Then we check if the timer is running and if it is we display the pause button and stop button
  else we display the play button
  If the time is less than the message goal or is running we show an add goal footer
  else we show an edit goal footer
  On the edit goal field we handle the timer using the function validTime
  and if we save the time we send to the server the goal to set
  For now the MAX_HOURS for a single run without adding more time is 5 hours, but you change this
  easily by changing the MAX_HOURS variable
  */
  return (
    <div className="countdown">
      <BsAlarmFill className="btn-white transition-color" fontSize="1.5rem" />
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
            <span className="time-value">{moment.utc(time).format('HH:mm')}h</span>
            {running ? (
              <div className="goal">
                <BsPauseFill
                  className="transition-color btn-purple"
                  onClick={handlePause}
                  fontSize="3rem"
                />
                <BsStopFill
                  fontSize="3rem"
                  className="btn-purple transition-color"
                  onClick={handleStop}
                />
              </div>
            ) : (
              <>
                <div>Time Remaining</div>
                <BsPlay
                  className="transition-color btn-purple"
                  onClick={handleStart}
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
            <div>Add more time</div>
            <div className="add-grid transition-color">
              <button onClick={() => handleAddGoal(1000 * 60 * 15)}>15 min</button>
              <button onClick={() => handleAddGoal(1000 * 60 * 30)}>30 min</button>
              <button onClick={() => handleAddGoal(1000 * 60 * 60)}>1 hour</button>
            </div>
          </>
        ) : (
          <>
            <strong>Goal for today</strong>
            <div className="goal">
              <Input
                className="without_AMPM"
                type="time"
                min="01:00"
                max={`0${MAX_HOURS}:00`}
                step="60"
                value={value}
                onChange={e => validTime(e.target.value)}
                disabled={!editing}
              />
              {editing ? (
                <FaSave
                  className="transition-color btn-white goal-btn"
                  onClick={() => {
                    setEditing(false);
                    handleSetGoal(moment.duration(value).asMilliseconds());
                  }}
                  type="submit"
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
