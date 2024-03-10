import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCircle,
  faCheck,
  faTimes,
  faExpandArrowsAlt,
  faCompressArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Table, Progress, Modal, ModalHeader, ModalBody } from 'reactstrap';

//! ============================================================================================
//! IMPORTAÇÕES DO OUTRO CÓDIGO
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';

import hasPermission from 'utils/permissions';
import './style.css';
import { boxStyle } from 'styles';

import Warning from 'components/Warnings/Warnings';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';

import ReviewButton from './ReviewButton';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import TeamMemberTaskIconsInfo from './TeamMemberTaskIconsInfo';
import { showTimeOffRequestModal } from '../../actions/timeOffRequestAction';
import GoogleDocIcon from '../../components/common/GoogleDocIcon'
  
//! ============================================================================================

export const MyTeamMember = (
  {user, 
  usersWithTasks,
  handleOpenTaskNotificationModal,
  handleMarkAsDoneModal,
  handleRemoveFromTaskModal,
  handleTaskModalOption,
  showWhoHasTimeOff,
  onTimeOff,
  goingOnTimeOff
}
  ) => {

  const thisWeekHours = user.totalTangibleHrs;
  
  const totalHoursRemaining = usersWithTasks.reduce((total, task) => {
    task.hoursLogged = task.hoursLogged || 0;
    task.estimatedHours = task.estimatedHours || 0;
    if (task.status !== 'Complete' && task.isAssigned !== 'false') {
      return total + Math.max(0, task.estimatedHours - task.hoursLogged);
    }
    return total;
  }, 0);
  
  const activeTasks = usersWithTasks.filter(
    task =>
      !task.resources?.some(
        resource => resource.userID === user.personId && resource.completedTask,
      ),
  );

  console.log('activeTasks', activeTasks);

  const test = usersWithTasks.filter(item => {
    !item.tasks.resources?.some(
      resource => resource.userID === user.personId && resource.completedTask,
    ),
    console.log('item.task', item.tasks);
  });
  
    console.log('test', test)

  const canTruncate = activeTasks.length > NUM_TASKS_SHOW_TRUNCATE;
  const [isTruncated, setIsTruncated] = useState(canTruncate);


  const NUM_TASKS_SHOW_TRUNCATE = 6;

   console.log('canTruncate', canTruncate)
  
  const numTasksToShow = isTruncated ? NUM_TASKS_SHOW_TRUNCATE : activeTasks.length;

  console.log('numTasksToShow', numTasksToShow)
  


  return (
    <>
    <tr className="table-row" key={user._id}>
      <td colSpan={1}>
      <section style={{ display: 'flex', alignItems: 'center' }}>

        <div className="committed-hours-circle">

      <FontAwesomeIcon
                  style={{
                    color:
                    thisWeekHours >= user.weeklycommittedHours ? 'green' : 'red',
                  }}
                  icon={faCircle}
                  data-testid="icon"
                />
        </div>

        <Link to={`/timelog/${user.personId}`}>
                <i
                  className="fa fa-clock-o"
                  aria-hidden="true"
                  style={{ fontSize: 24, cursor: 'pointer', color: 'black' }}
                  title="Click to see user's timelog"
                />
          </Link>

      </section>
      </td>

      <td colSpan={2}>
        <Table borderless className="team-member-tasks-subtable">
          <tbody>
            <tr>
              <td className="team-member-tasks-user-name">

                  <Link to={`/userprofile/${user._id}`}>{user.firstName}</Link>

              </td>

              <td data-label="Time" className="team-clocks">
                  <u>{user.weeklycommittedHours ? user.weeklycommittedHours : 0}</u> /
                    <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
                    <font color="red"> {totalHoursRemaining.toFixed(1)}</font>              
              </td>
            </tr>
          </tbody>
        </Table>

      </td>
      
    </tr>
    </>
  );
}
