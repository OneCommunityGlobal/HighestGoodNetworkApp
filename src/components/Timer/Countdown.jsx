import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button } from 'reactstrap';
import {
  BsFillPenFill,
  BsPauseFill,
  BsPlay,
  BsStopFill,
  BsArrowCounterclockwise,
} from 'react-icons/bs';
import { FaSave, FaAngleUp, FaAngleDown } from 'react-icons/fa';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import cs from 'classnames';
import { toast } from 'react-toastify';
import { BsXLg } from 'react-icons/bs';
import css from './Countdown.module.css';
import { transitionColor } from './NewTimer.module.css';

export default function Countdown({
  message,
  running,
  wsMessageHandler,
  remaining,
  handleAddButton,
  handleSubtractButton,
  handleStopButton,
  toggleTimer,
}) {
  const MAX_HOURS = 10;
  const MIN_MINS = 1;

  const { started, goal } = message;

  const [editing, setEditing] = useState(false);
  const [hours, setHours] = useState(MAX_HOURS);
  const [minutes, setMinutes] = useState(0);
  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const hourRef = useRef(null);
  const minRef = useRef(null);

  const { sendStart, sendPause, sendClear, sendSetGoal } = wsMessageHandler;

  const checkBtnAvail = addition => {
    const remainingDuration = moment.duration(remaining);
    const goalDuration = moment.duration(goal);
    return (
      remainingDuration.asMinutes() + addition > 0 &&
      goalDuration.asMinutes() + addition >= 15 &&
      goalDuration.asHours() + addition / 60 <= 10
    );
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
      toast.error('Goal time cannot be set over 10 hours!');
      sendSetGoal(moment.duration(MAX_HOURS, 'hours').asMilliseconds());
    } else if (dur.asMinutes() < MIN_MINS) {
      toast.error('Timer cannot be set less than 15 minutes!');
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
        if (minutes < 15) {
          toast.error('Timer cannot be set less than 15 minutes!');
          setMinutes(15);
        }
        setHours(0);
        break;
      case newHour >= 10:
        if (minutes > 0) {
          toast.error('Goal time cannot be set over 10 hours!');
          setMinutes(0);
        }
        setHours(10);
        break;
      default:
        setHours(newHour);
    }
  };

  const handleMinuteChange = amount => {
    const newMin = minutes + amount;
    switch (true) {
      case hours === 0 && newMin < 15:
        toast.error('Timer cannot be set less than 15 minutes!');
        setMinutes(15);
        break;
      case newMin < 0:
        setHours(prevHour => prevHour - 1);
        setMinutes(45);
        break;
      case hours === 10 && newMin > 0:
        toast.error('Goal time cannot be set over 10 hours!');
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
  }, [goal, message]);

  return (
    <>
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
                <div>working...</div>
              ) : (
                <BsArrowCounterclockwise
                  onClick={() => setConfirmationResetModal(true)}
                  className={cs(css.transitionColor, css.resetIcon)}
                  fontSize="2rem"
                  title="Reset the timer"
                />
              )}
              <span>Time Remaining</span>
              <div className={css.remainingTime}>
                <div className={css.timeValue}>{moment.utc(remaining).format('HH:mm:ss')}</div>
                <div className={css.label}>
                  <span className="hours">hours</span>
                  <span className="mins">minutes</span>
                  <span className="seconds">seconds</span>
                </div>
              </div>
              <div className={css.operators}>
                {running ? (
                  <button type="button" onClick={sendPause}>
                    <BsPauseFill className={cs(transitionColor, css.operator)} fontSize="2.5rem" />
                  </button>
                ) : (
                  <button type="button" onClick={sendStart} disabled={remaining === 0}>
                    <BsPlay
                      className={cs(
                        transitionColor,
                        css.operator,
                        remaining === 0 ? css.operatorDisabled : '',
                      )}
                      fontSize="2.5rem"
                    />
                  </button>
                )}
                {started && (
                  <button type="button" onClick={handleStopButton}>
                    <BsStopFill className={cs(transitionColor, css.operator)} fontSize="2.5rem" />
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
                <span className={cs(css.btn, checkBtnAvail(-15) ? '' : css.btnDisabled)}>
                  -15 m
                </span>
              </button>
              <button
                size="sm"
                type="button"
                aria-label="add 15 minutes"
                className={cs(css.btn, checkBtnAvail(15) ? '' : css.btnDisabled)}
                onClick={() => handleAddButton(15)}
              >
                +15 m
              </button>
              <button
                size="sm"
                type="button"
                aria-label="add 30 minutes"
                className={cs(css.btn, checkBtnAvail(30) ? '' : css.btnDisabled)}
                onClick={() => handleAddButton(30)}
              >
                +30 m
              </button>
              <button
                size="sm"
                type="button"
                aria-label="add 1 hour"
                className={cs(css.btn, checkBtnAvail(60) ? '' : css.btnDisabled)}
                onClick={() => handleAddButton(60)}
              >
                +1 h
              </button>
            </div>
          ) : (
            <>
              <strong>Goal for today</strong>
              <div className={cs(css.goal, editing ? css.goalEditing : '')}>
                <div className={css.numberWrapper}>
                  {editing && (
                    <FaAngleUp
                      className={cs(transitionColor, css.up)}
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
                      className={cs(transitionColor, css.down)}
                      onClick={() => handleHourChange(-1)}
                    />
                  )}
                </div>
                :
                <div className={css.numberWrapper}>
                  {editing && (
                    <FaAngleUp
                      className={cs(transitionColor, css.up)}
                      onClick={() => handleMinuteChange(15)}
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
                      className={cs(transitionColor, css.down)}
                      onClick={() => handleMinuteChange(-15)}
                    />
                  )}
                </div>
                {editing ? (
                  <FaSave
                    className={cs(transitionColor, css.goalBtn)}
                    onClick={() => validateTime()}
                  />
                ) : (
                  <BsFillPenFill
                    className={cs(transitionColor, css.goalBtn)}
                    onClick={() => setEditing(true)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        isOpen={confirmationResetModal}
        toggle={() => setConfirmationResetModal(!confirmationResetModal)}
        centered
        size="md"
      >
        <ModalHeader toggle={() => setConfirmationResetModal(false)}>Reset Time</ModalHeader>
        <ModalBody>Are you sure you want to reset your time?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              sendClear();
              setConfirmationResetModal(false);
            }}
          >
            Yes, reset time!
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </>
  );
}
