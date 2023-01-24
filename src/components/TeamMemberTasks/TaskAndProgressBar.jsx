import React from 'react';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import { Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const TaskAndProgressBar = ({ task, user }) => {
  return (
    <div className="team-member-task">
      <p className="team-member-task-name">
        <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
          <span>{`${task.num} ${task.taskName}`} </span>
        </Link>
        {task.taskNotifications.length > 0 && (
          <FontAwesomeIcon
            className="team-member-tasks-bell"
            icon={faBell}
            onClick={() => {
              handleOpenTaskNotificationModal(user.personId, task, task.taskNotifications);
            }}
          />
        )}
      </p>
      {task.hoursLogged != null && task.estimatedHours != null && (
        <div className="team-member-task-progress-bar">
          <span>
            {`${parseFloat(task.hoursLogged.toFixed(2))}
                    of 
                  ${parseFloat(task.estimatedHours.toFixed(2))}`}
          </span>
          <Progress
            color={getProgressColor(task.hoursLogged, task.estimatedHours, true)}
            value={getProgressValue(task.hoursLogged, task.estimatedHours)}
          />
        </div>
      )}
    </div>
  );
};

export default TaskAndProgressBar;
