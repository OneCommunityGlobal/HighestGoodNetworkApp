import { useState, useEffect } from 'react';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFollowUp } from '../../actions/followUpActions';
import styles from './FollowUpCheckButton.module.css';

function FollowupCheckButton({ mouseoverText, user, task }) {
  const dispatch = useDispatch();
  const userFollowUps = useSelector(state => state.userFollowUp?.followUps[user.personId] || []);
  const userFollowUpTask = userFollowUps.filter(ele => ele.taskId === task._id);
  const isChecked = userFollowUpTask[0]?.followUpCheck || false;
  const followUpPercentageDeadline = userFollowUpTask[0]?.followUpPercentageDeadline || 0;
  const acceptedPercentage = userFollowUpTask[0]?.acceptedPercentage || 0;
  const [needFollowUp, setNeedFollowUp] = useState(false);

  const currentPercentage =
    Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

  // Was accepted as done but more time was logged after acceptance
  const violatedAfterAcceptance =
    isChecked && acceptedPercentage > 0 && currentPercentage > acceptedPercentage;

  const checkNeedFollowUp = () => {
    const taskProgressPercentage = currentPercentage;

    if (userFollowUpTask.length > 0) {
      const followUp = userFollowUpTask[0];
      const followUpPercentageDeadlineNumber = Number(followUp.followUpPercentageDeadline) || 0;

      if (followUpPercentageDeadlineNumber < 50 && taskProgressPercentage > 50) {
        setNeedFollowUp(true);
        return;
      }
      if (
        followUpPercentageDeadlineNumber >= 50 &&
        followUpPercentageDeadlineNumber < 75 &&
        taskProgressPercentage > 75
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (
        followUpPercentageDeadlineNumber >= 75 &&
        followUpPercentageDeadlineNumber < 90 &&
        taskProgressPercentage > 90
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (followUpPercentageDeadlineNumber < 90 && taskProgressPercentage > 90) {
        setNeedFollowUp(true);
        return;
      }
    } else if (taskProgressPercentage > 50) {
      setNeedFollowUp(true);
      return;
    }
    setNeedFollowUp(false);
  };

  useEffect(() => {
    checkNeedFollowUp();
  }, [followUpPercentageDeadline, userFollowUpTask.length, task.hoursLogged]); // ← fix: added dependencies

  const handleCheckboxFollowUp = () => {
    const progressPercentage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    const data = {
      followUpCheck: needFollowUp ? true : !isChecked,
      followUpPercentageDeadline: progressPercentage,
      acceptedPercentage: !isChecked ? progressPercentage : 0, // save percentage when accepting
    };
    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  return (
    <div className={styles['followup-box']}>
      <input
        type="checkbox"
        title={
          violatedAfterAcceptance
            ? '⚠️ Time was logged after this task was accepted as complete!'
            : mouseoverText
        }
        className={`${styles['team-task-progress-follow-up']} ${
          needFollowUp ? styles['team-task-progress-follow-up-red'] : ''
        } ${violatedAfterAcceptance ? styles['team-task-progress-follow-up-violated'] : ''}`}
        checked={isChecked && !needFollowUp}
        onChange={handleCheckboxFollowUp}
      />
      {isChecked && !needFollowUp && !violatedAfterAcceptance && (
        <FontAwesomeIcon
          icon={faCheck}
          title="Accepted as complete"
          className={styles['team-task-progress-follow-up-check']}
          onClick={handleCheckboxFollowUp}
        />
      )}
      {violatedAfterAcceptance && (
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          title="⚠️ Time was logged after this task was accepted as complete!"
          className={styles['team-task-progress-follow-up-violated-icon']}
          onClick={handleCheckboxFollowUp}
        />
      )}
    </div>
  );
}

export default FollowupCheckButton;
