import { useState } from 'react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { setUserFollowUp } from '../../actions/followUpActions';
import { useDispatch, useSelector } from 'react-redux';
import './FollowUpCheckButton.css';

const FollowupCheckButton = ({ moseoverText, user, task }) => {
  const dispatch = useDispatch();
  const userFollowUps = useSelector(state => state.userFollowUp.followUps[user.personId] || []);
  const userFollowUpTask = userFollowUps.filter(ele => ele.taskId === task._id);
  const isChecked = userFollowUpTask[0]?.followUpCheck || false;

  const handleCheckboxFollowUp = () => {
    const progressPersantage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    const data = {
      followUpCheck: !isChecked,
      followUpPercentageDeadline: progressPersantage,
    };

    dispatch(setUserFollowUp(user.personId, task._id, data));
  };

  const NeedFollowUp = () => {
    const taskProgressPercentage =
      Number(((task.hoursLogged / task.estimatedHours) * 100).toFixed(2)) || 0;

    if (userFollowUpTask.length > 0) {
      const followUp = userFollowUpTask[0];
      const followUpPercentageDeadline = Number(followUp.followUpPercentageDeadline) || 0;

      if (followUpPercentageDeadline < 50 && taskProgressPercentage > 50) {
        return true;
      } else if (
        followUpPercentageDeadline >= 50 &&
        followUpPercentageDeadline < 75 &&
        taskProgressPercentage > 75
      ) {
        return true;
      } else if (
        followUpPercentageDeadline >= 75 &&
        followUpPercentageDeadline < 90 &&
        taskProgressPercentage > 90
      ) {
        return true;
      } else if (followUpPercentageDeadline < 90 && taskProgressPercentage > 90) {
        return true;
      }
    } else {
      if (taskProgressPercentage > 50) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <input
        type="checkbox"
        title={moseoverText}
        className={`team-task-progress-follow-up ${
          NeedFollowUp() ? 'team-task-progress-follow-up-red' : ''
        }`}
        checked={isChecked}
        onChange={() => handleCheckboxFollowUp()}
      />
      {isChecked && !NeedFollowUp() && (
        <FontAwesomeIcon
          icon={faCheck}
          title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
          className="team-task-progress-follow-up-check"
          onClick={() => handleCheckboxFollowUp()}
        />
      )}
    </>
  );
};

export default FollowupCheckButton;
