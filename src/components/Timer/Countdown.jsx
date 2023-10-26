import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { Input } from 'reactstrap';
import {
  BsFillPenFill,
  BsPauseFill,
  BsPlay,
  BsStopFill,
  BsArrowCounterclockwise,
  BsHourglassTop,
  BsHourglassSplit,
  BsHourglassBottom,
} from 'react-icons/bs';
import { FaSave, FaAngleUp, FaAngleDown } from 'react-icons/fa';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import cs from 'classnames';
import { toast } from 'react-toastify';
import { BsXLg } from 'react-icons/bs';
import css from './Countdown.module.css';

function getClockIcon(index) {
  const clockIoncs = [BsHourglassBottom, BsHourglassSplit, BsHourglassTop];
  const ClockIcon = clockIoncs[index];
  if (index === 3) {
    return <BsHourglassTop style={{ transform: 'rotate(-90deg)', fontSize: '1.5rem' }} />;
  }
  return <ClockIcon fontSize="1.5rem" />;
}

export default function Countdown({
  message,
  timerRange,
  running,
  wsMessageHandler,
  remaining,
  setConfirmationResetModal,
  checkBtnAvail,
  handleAddButton,
  handleSubtractButton,
  handleStopButton,
  toggleTimer,
}) {
  const { MAX_HOURS, MIN_MINS } = timerRange;

  const { started, goal } = message;
  const { sendStart, sendPause, sendSetGoal } = wsMessageHandler;

  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const hourRef = useRef(null);
  const minRef = useRef(null);

  const remainingHours = moment.duration(remaining).hours();
  const remainingMinutes = moment.duration(remaining).minutes();
  const remainingSeconds = moment.duration(remaining).seconds();

  const remainingHoursDisplay = remainingHours.toString().padStart(2, '0');
  const remainingMinutesDisplay = remainingMinutes.toString().padStart(2, '0');
  const remainingSecondsDisplay = remainingSeconds.toString().padStart(2, '0');

  const shouldDisplay = {
    hour: !!remainingHours,
    minute: !!remainingHours || !!remainingMinutes,
  };

  const forceMinMax = (event, ref) => {
    const { value, min, max } = event.target;
    const updatedValue = Math.max(Number(min), Math.min(Number(max), Number(value)));
    switch (ref) {
      case hourRef:
        setHours(updatedValue);
        break;
      case minRef:
        setMinutes(updatedValue);
        break;
      default:
    }
  };

  const validateTime = () => {
    const dur = moment.duration(hours, 'hours').add(minutes, 'minutes');
    if (dur.asHours() > MAX_HOURS) {
      toast.error(`Goal time cannot be set over ${MAX_HOURS} hours!`);
      sendSetGoal(moment.duration(MAX_HOURS, 'hours').asMilliseconds());
    } else if (dur.asMinutes() < MIN_MINS) {
      toast.error(`Timer cannot be set less than ${MIN_MINS} minutes!`);
      sendSetGoal(moment.duration(MIN_MINS, 'minutes').asMilliseconds());
    } else {
      sendSetGoal(dur.asMilliseconds());
    }
    setEditing(false);
  };

  const handleHourChange = amount => {
    const newHour = hours + amount;
    switch (true) {
      case newHour <= 0:
        if (minutes < MIN_MINS) {
          toast.error(`Timer cannot be set less than ${MIN_MINS} minutes!`);
          setMinutes(MIN_MINS);
        }
        setHours(0);
        break;
      case newHour >= MAX_HOURS:
        if (minutes > 0) {
          toast.error(`Goal time cannot be set over ${MAX_HOURS} hours!`);
          setMinutes(0);
        }
        setHours(MAX_HOURS);
        break;
      default:
        setHours(newHour);
    }
  };

  const handleMinuteChange = amout => {
    const newMin = minutes + amout;
    switch (true) {
      case hours === 0 && newMin < MIN_MINS:
        toast.error(`Timer cannot be set less than ${MIN_MINS} minutes!`);
        setMinutes(MIN_MINS);
        break;
      case newMin < 0:
        setHours(prevHour => prevHour - 1);
        setMinutes(45);
        break;
      case hours === MAX_HOURS && newMin > 0:
        toast.error(`Goal time cannot be set over ${MAX_HOURS} hours!`);
        break;
      case newMin >= 60:
        setHours(prevHours => prevHours + 1);
        setMinutes(0);
        break;
      default:
        setMinutes(newMin);
    }
  };

  useEffect(() => {
    setHours(moment.utc(goal).hours());
    setMinutes(moment.utc(goal).minutes());
  }, [message]);

  return (
    <div className={css.countdown}>
      <BsXLg className={cs(css.transitionColor, css.crossIcon)} onClick={toggleTimer} />
      <div className={css.infoDisplay}>
        <h4>{`Goal: ${moment.utc(goal).format('HH:mm:ss')}`}</h4>
        <h6>
          {`Elapsed: ${moment
            .utc(goal)
            .subtract(remaining)
            .format('HH:mm:ss')}`}
        </h6>
      </div>
      <div className={css.countdownCircle}>
        <CircularProgressbarWithChildren
          value={started ? (moment.duration(remaining).asMilliseconds() / goal) * 100 : 100}
          counterClockwise
          styles={buildStyles({
            strokeLinecap: 'round',
            pathTransitionDuration: 0.5,
            pathColor: 'rgba(237, 104, 138, 1)',
            trailColor: 'rgba(210, 100, 169, 0.2)',
          })}
        >
          <div className={css.content}>
            {running ? (
              getClockIcon(remainingSeconds % 4)
            ) : (
              <BsArrowCounterclockwise
                onClick={() => setConfirmationResetModal(true)}
                className={cs(css.transitionColor, css.resetIcon)}
                fontSize="2rem"
                title="Reset timer"
              />
            )}
            <span>Time Remaining</span>
            <div className={css.remainingTime}>
              {shouldDisplay.hour && (
                <>
                  <div>
                    <div className={css.timeDisplay}>{remainingHoursDisplay}</div>
                    <div className={css.label}>Hours</div>
                  </div>
                  <div className={css.timeColon}>:</div>
                </>
              )}
              {shouldDisplay.minute && (
                <>
                  <div>
                    <div className={css.timeDisplay}>{remainingMinutesDisplay}</div>
                    <div className={css.label}>minutes</div>
                  </div>
                  <div className={css.timeColon}>:</div>
                </>
              )}
              <div>
                <div className={css.timeDisplay}>{remainingSecondsDisplay}</div>
                <div className={css.label}>seconds</div>
              </div>
            </div>
            <div className={css.operators}>
              {running ? (
                <button type="button" onClick={sendPause}>
                  <BsPauseFill
                    className={cs(css.transitionColor, css.operator)}
                    fontSize="2.5rem"
                  />
                </button>
              ) : (
                <button type="button" onClick={sendStart} disabled={remaining === 0}>
                  <BsPlay
                    className={cs(
                      css.transitionColor,
                      css.operator,
                      remaining === 0 ? css.operatorDisabled : '',
                    )}
                    fontSize="2.5rem"
                    title="Start timer"
                  />
                </button>
              )}
              {started && (
                <button type="button" onClick={handleStopButton}>
                  <BsStopFill
                    className={cs(css.transitionColor, css.operator)}
                    fontSize="2.5rem"
                    title="Stop timer and log time"
                  />
                </button>
              )}
            </div>
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className={css.bottom}>
        {started ? (
          <div className={cs(css.addGrid, css.transitionColor)}>
            <button
              size="sm"
              type="button"
              aria-label="remove 15 minutes"
              onClick={() => handleSubtractButton(15)}
            >
              <span className={cs(css.btn, checkBtnAvail(-15) ? '' : css.btnDisabled)}>-15 m</span>
            </button>
            <button
              size="sm"
              type="button"
              aria-label="add 15 minutes"
              onClick={() => handleAddButton(15)}
            >
              <span className={cs(css.btn, checkBtnAvail(15) ? '' : css.btnDisabled)}>+15 m</span>
            </button>
            <button
              size="sm"
              type="button"
              aria-label="add 30 minutes"
              onClick={() => handleAddButton(30)}
            >
              <span className={cs(css.btn, checkBtnAvail(30) ? '' : css.btnDisabled)}>+30 m</span>
            </button>
            <button
              size="sm"
              type="button"
              aria-label="add 1 hour"
              onClick={() => handleAddButton(60)}
            >
              <span className={cs(css.btn, checkBtnAvail(60) ? '' : css.btnDisabled)}>+1 h</span>
            </button>
          </div>
        ) : (
          <>
            <strong>Goal for today</strong>
            <div className={cs(css.goal, editing ? css.goalEditing : '')}>
              <div className={css.numberWrapper}>
                {editing && (
                  <FaAngleUp
                    className={cs(css.transitionColor, css.up)}
                    onClick={() => handleHourChange(1)}
                  />
                )}
                <Input
                  type="number"
                  className={editing ? css.editing : ''}
                  min={0}
                  max={MAX_HOURS}
                  value={Number(hours).toString()}
                  onChange={e => forceMinMax(e, hourRef)}
                  disabled={!editing}
                  innerRef={hourRef}
                />
                {editing && (
                  <FaAngleDown
                    className={cs(css.transitionColor, css.down)}
                    onClick={() => handleHourChange(-1)}
                  />
                )}
              </div>
              :
              <div className={css.numberWrapper}>
                {editing && (
                  <FaAngleUp
                    className={cs(css.transitionColor, css.up)}
                    onClick={() => handleMinuteChange(hours === 0 && minutes < 15 ? 1 : 15)}
                  />
                )}
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={Number(minutes)
                    .toString()
                    .padStart(2, '0')}
                  onChange={e => forceMinMax(e, minRef)}
                  disabled={!editing}
                  innerRef={minRef}
                />
                {editing && (
                  <FaAngleDown
                    className={cs(css.transitionColor, css.down)}
                    onClick={() => handleMinuteChange(hours === 0 && minutes <= 15 ? -1 : -15)}
                  />
                )}
              </div>
              {editing ? (
                <FaSave
                  className={cs(css.transitionColor, css.goalBtn)}
                  onClick={() => validateTime()}
                />
              ) : (
                <BsFillPenFill
                  className={cs(css.transitionColor, css.goalBtn)}
                  onClick={() => setEditing(true)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
