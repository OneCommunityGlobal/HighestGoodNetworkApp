import React, { useState } from 'react';
import { faCircle, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TaskAndProgressBar from './TaskAndProgressBar';

const TeamMember = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  let totalHoursLogged = 0;
  let totalHoursRemaining = 0;
  let activeTasks = [];
  const thisWeekHours = user.totaltangibletime_hrs;
  if (user.tasks) {
    user.tasks = user.tasks.map(task => {
      task.hoursLogged = task.hoursLogged ? task.hoursLogged : 0;
      task.estimatedHours = task.estimatedHours ? task.estimatedHours : 0;
      return task;
    });
    totalHoursLogged = user.tasks
      .map(task => task.hoursLogged)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    totalHoursRemaining = user.tasks
      .map(task => task.estimatedHours - task.hoursLogged)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    activeTasks = user.tasks.filter(
      task =>
        !task.resources?.find(resource => resource.userID === user.personId).completedTask === true,
    );
  }
  // console.log(user);
  return (
    <div className="team-member-container">
      <div className="comitted-hours-circle">
        <FontAwesomeIcon
          style={{
            color: user.totaltangibletime_hrs >= user.weeklyComittedHours ? 'green' : 'red',
          }}
          icon={faCircle}
        />
      </div>
      <div className="team-member-username">
        <Link to={`/userprofile/${user.personId}`}>{`${user.name}`}</Link>
      </div>
      <div className="team-member-comitted-hours">
        <u>{user.weeklyComittedHours ? user.weeklyComittedHours : 0}</u>/
        <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
        <font color="red">{totalHoursRemaining ? totalHoursRemaining.toFixed(1) : 0}</font>
      </div>
      <div className="team-member-tasks-list">
        {activeTasks.slice(0, isOpen ? activeTasks.length : 1).map((task, index) => {
          // let isActiveTaskForUser = true;
          // if (task?.resources) {
          //   isActiveTaskForUser = !task.resources?.find(
          //     resource => resource.userID === user.personId,
          //   ).completedTask;
          // }
          if (task.wbsId && task.projectId) {
            return <TaskAndProgressBar task={task} user={user} key={task._id} />;
          }
        })}
      </div>
      {activeTasks.length > 1 && (
        <button type="button" className="show-more-btn" onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon icon={isOpen ? faArrowUp : faArrowDown} style={{ color: 'white' }} />
        </button>
      )}
    </div>
  );
};

export default TeamMember;
