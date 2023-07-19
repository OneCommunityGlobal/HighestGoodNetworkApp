import { useEffect, useState } from 'react';
import moment from 'moment';
import { BsArrowCounterclockwise, BsPauseFill, BsPlayFill, BsStopFill } from 'react-icons/bs';
import './Stopwatch.css';

const Stopwatch = ({
  message,
  handleStart,
  handlePause,
  handleStop,
  handleClear,
  setPreviewTimer,
}) => {
  const MAX_HOURS = moment.duration(8, 'hours').asMilliseconds();
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);

  /*
  Here we calculate the elapsed time since the last access to the timer
  and add it to the time that was saved in the database
  We do this because the timer is not running when the user is not on the page
  and if the timer is running we update the time every 100ms
  to make sure that the time is as accurate as possible to maintain sync
  */
  const elapsedTime = () => {
    const now = moment();
    const lastAccess = moment(message.lastAccess);
    return message.time + moment.duration(now.diff(lastAccess)).asMilliseconds();
  };

  useEffect(() => {
    if (message !== null) {
      setRunning(!message.paused);
      setTime(message.time);
      setPreviewTimer(message.time);
    }
  }, [message]);

  /*
  Here we check if the timer is running, if it is we set the interval to update the time
  every 100ms, if it is not we clear the interval
  The 100ms is better for performance than 10ms and we still show the time with 2 decimals
  We check if the time is greater than the MAX HOURS and if it is we stop the timer
  else we update the time and the preview timer
  */
  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        const elapsed = elapsedTime();
        setTime(prevTime => {
          if (prevTime >= MAX_HOURS) handleStop();
          return elapsed;
        });
        setPreviewTimer(elapsed);
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  /*
  Here is the Stopwatch component
  We show the time in HH:mm:ss.SS format
  To show this we use moment.utc that takes milliseconds and returns a moment object
  We then format the moment object to HH:mm:ss to get the hours, minutes and seconds
  and then we format it to SS to get the milliseconds to a custom style
  The clear button clears send the clear command to the server
  So does the start, pause and stop buttons
  */
  return (
    <div className="stopwatch">
      <div>
        <span className="hours">{moment.utc(time).format('HH:mm:ss')}</span>
        <span className="millis">.{moment.utc(time).format('SS')}</span>
      </div>
      <BsArrowCounterclockwise
        onClick={handleClear}
        className="transition-color btn-white"
        fontSize="2rem"
      />
      <div className="actions">
        {running ? (
          <BsPauseFill
            onClick={handlePause}
            className="transition-color btn-white"
            fontSize="3rem"
          />
        ) : (
          <BsPlayFill
            onClick={handleStart}
            className="transition-color btn-white"
            fontSize="3rem"
          />
        )}
        <BsStopFill onClick={handleStop} className="transition-color btn-purple" fontSize="3rem" />
      </div>
    </div>
  );
};

export default Stopwatch;