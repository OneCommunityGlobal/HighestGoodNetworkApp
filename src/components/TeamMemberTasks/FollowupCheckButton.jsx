import { useMemo } from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFollowUp } from '../../actions/followUpActions';
import styles from './FollowUpCheckButton.module.css';

function FollowupCheckButton({ moseoverText, user, task }) {
  const dispatch = useDispatch();

  const userFollowUps = useSelector(state => state.userFollowUp?.followUps[user.personId] || []);
  const userFollowUpTask = userFollowUps.find(ele => ele.taskId === task._id);

  const isChecked = userFollowUpTask?.followUpCheck ?? false;
  const savedDeadline = userFollowUpTask?.followUpPercentageDeadline ?? null;

  const progressPercentage = useMemo(() => {
    if (!task.estimatedHours || task.estimatedHours <= 0) return 0;
    return Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2));
  }, [task.hoursLogged, task.estimatedHours]);

  const currentMilestone = useMemo(() => {
    if (progressPercentage >= 90) return 90;
    if (progressPercentage >= 75) return 75;
    if (progressPercentage >= 50) return 50;
    return 0;
  }, [progressPercentage]);

  const savedMilestone = useMemo(() => {
    const value = Number(savedDeadline);
    if (!Number.isFinite(value)) return 0;
    if (value >= 90) return 90;
    if (value >= 75) return 75;
    if (value >= 50) return 50;
    return 0;
  }, [savedDeadline]);

  const needFollowUp = currentMilestone >= 50 && savedMilestone < currentMilestone;

  const handleCheckboxFollowUp = () => {
    const data = {
      followUpCheck: needFollowUp ? true : !isChecked,
      followUpPercentageDeadline: needFollowUp ? currentMilestone : progressPercentage,
    };

    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  return (
    <div className={styles['followup-box']}>
      <input
        type="checkbox"
        title={moseoverText}
        className={`${styles['team-task-progress-follow-up']} ${
          needFollowUp ? styles['team-task-progress-follow-up-red'] : ''
        }`}
        checked={!needFollowUp && isChecked}
        onChange={handleCheckboxFollowUp}
      />
      {!needFollowUp && isChecked && (
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
