import { useState, useEffect } from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
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
  const [needFollowUp, setNeedFollowUp] = useState(false);

  const checkNeedFollowUp = () => {
    if (isChecked) {
      setNeedFollowUp(false);
      return;
    }
    const taskProgressPercentage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

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
  }, [followUpPercentageDeadline, task.hoursLogged, task.estimatedHours, isChecked]);

  const handleCheckboxFollowUp = () => {
    const hoursLogged = Number(task.hoursLogged) || 0;
    const estimatedHours = Number(task.estimatedHours) || 0;

    const progressPercentage =
      estimatedHours > 0 ? Number(((hoursLogged / estimatedHours) * 100).toFixed(2)) : 0;

    const data = {
      followUpCheck: Boolean(!isChecked),
      followUpPercentageDeadline: progressPercentage,
    };

    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  return (
    <div className={styles['followup-box']}>
      <input
        type="checkbox"
        title={mouseoverText}
        className={`${styles['team-task-progress-follow-up']} ${
          needFollowUp ? styles['team-task-progress-follow-up-red'] : ''
        }`}
        checked={isChecked && !needFollowUp}
        onChange={handleCheckboxFollowUp}
      />
      {isChecked && !needFollowUp && (
        <FontAwesomeIcon
          icon={faCheck}
          title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
          className={styles['team-task-progress-follow-up-check']}
          onClick={handleCheckboxFollowUp}
        />
      )}
    </div>
  );
}

export default FollowupCheckButton;
