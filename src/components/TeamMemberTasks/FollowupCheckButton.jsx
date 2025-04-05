import { useState, useEffect } from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { setUserFollowUp } from '../../actions/followUpActions';
import './FollowUpCheckButton.css';

function FollowupCheckButton({ moseoverText, user, task }) {
  const dispatch = useDispatch();
  const userFollowUps = useSelector(state => state.userFollowUp?.followUps[user.personId] || []);
  const userFollowUpTask = userFollowUps.filter(ele => ele.taskId === task._id);
  const isChecked = userFollowUpTask[0]?.followUpCheck || false;
  const followUpPercentageDeadline = userFollowUpTask[0]?.followUpPercentageDeadline || 0;
  const [needFollowUp, setNeedFollowUp] = useState(false);

  useEffect(() => {
    checkNeedFollowUp();
  }, [followUpPercentageDeadline]);

  const handleCheckboxFollowUp = () => {
    const progressPersantage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    const data = {
      followUpCheck: needFollowUp ? true : !isChecked,
      followUpPercentageDeadline: progressPersantage,
    };
    console.log(data);
    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  const checkNeedFollowUp = () => {
    const taskProgressPercentage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    if (userFollowUpTask.length > 0) {
      const followUp = userFollowUpTask[0];
      const followUpPercentageDeadline = Number(followUp.followUpPercentageDeadline) || 0;

      if (followUpPercentageDeadline < 50 && taskProgressPercentage > 50) {
        setNeedFollowUp(true);
        return;
      }
      if (
        followUpPercentageDeadline >= 50 &&
        followUpPercentageDeadline < 75 &&
        taskProgressPercentage > 75
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (
        followUpPercentageDeadline >= 75 &&
        followUpPercentageDeadline < 90 &&
        taskProgressPercentage > 90
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (followUpPercentageDeadline < 90 && taskProgressPercentage > 90) {
        setNeedFollowUp(true);
        return;
      }
    } else if (taskProgressPercentage > 50) {
      setNeedFollowUp(true);
      return;
    }
    setNeedFollowUp(false);
  };

  return (
    <label className="team-task-progress-follow-up-container">
      <input
        type="checkbox"
        title={moseoverText}
        className={`team-task-progress-follow-up ${
          needFollowUp ? 'team-task-progress-follow-up-red' : ''
        }`}
        checked={isChecked && !needFollowUp}
        onChange={handleCheckboxFollowUp}
      />
      <span className="team-task-progress-follow-up-check">
        {isChecked && !needFollowUp && <FontAwesomeIcon icon={faCheck} />}
      </span>
    </label>
  );
}

export default FollowupCheckButton;
