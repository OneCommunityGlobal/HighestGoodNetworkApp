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

  const handleCheckboxFollowUp = () => {
    const progressPersantage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    const data = {
      followUpCheck: needFollowUp ? true : !isChecked,
      followUpPercentageDeadline: progressPersantage,
    };
    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  const checkNeedFollowUp = () => {
    const taskProgressPercentage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    if (userFollowUpTask.length > 0) {
      const followUp = userFollowUpTask[0];
      const currentFollowUpPercentageDeadline = Number(followUp.followUpPercentageDeadline) || 0;

      if (currentFollowUpPercentageDeadline < 50 && taskProgressPercentage > 50) {
        setNeedFollowUp(true);
        return;
      }
      if (
        currentFollowUpPercentageDeadline >= 50 &&
        currentFollowUpPercentageDeadline < 75 &&
        taskProgressPercentage > 75
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (
        currentFollowUpPercentageDeadline >= 75 &&
        currentFollowUpPercentageDeadline < 90 &&
        taskProgressPercentage > 90
      ) {
        setNeedFollowUp(true);
        return;
      }
      if (currentFollowUpPercentageDeadline < 90 && taskProgressPercentage > 90) {
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
  }, [followUpPercentageDeadline]);

  return (
    <>
      <input
        type="checkbox"
        title={moseoverText}
        className={`team-task-progress-follow-up ${
          needFollowUp ? 'team-task-progress-follow-up-red' : ''
        }`}
        checked={isChecked && !needFollowUp}
        onChange={handleCheckboxFollowUp}
      />
      {isChecked && !needFollowUp && (
        <FontAwesomeIcon
          icon={faCheck}
          title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
          className="team-task-progress-follow-up-check"
          onClick={handleCheckboxFollowUp}
        />
      )}
    </>
  );
}

export default FollowupCheckButton;
