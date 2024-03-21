import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import './style.css';
import moment from 'moment-timezone';
import GoogleDocIcon from '../../components/common/GoogleDocIcon';
import hasPermission from 'utils/permissions';
import { useDispatch, useSelector } from 'react-redux';

export const MyTeamMember = ({ user, usersWithTasks }) => {
  const thisWeekHours = user.totalTangibleHrs;

  const currentDate = moment.tz('America/Los_Angeles').startOf('day');

  const dispatch = useDispatch();

  const canGetWeeklySummaries = dispatch(hasPermission('getWeeklySummaries'));

  const totalHoursRemaining = usersWithTasks.reduce((total, user) => {
    user.tasks.forEach(task => {
      if (task.status !== 'Complete' && task.isAssigned !== 'false') {
        return total + Math.max(0, task.estimatedHours - task.hoursLogged);
      }
    });
    return total;
  }, 0);

  const userGoogleDocLink = user.adminLinks?.reduce((targetLink, currentElement) => {
    if (currentElement.Name === 'Google Doc') {
      targetLink = currentElement.Link;
    }
    return targetLink;
  }, undefined);

  return (
    <tr
      className="table-row d-flex justify-content-between d-flex align-items-center"
      key={user._id}
    >
      <td>
        <section style={{ display: 'flex', alignItems: 'center' }}>
          <div className="committed-hours-circle">
            <FontAwesomeIcon
              style={{
                color: thisWeekHours >= user.weeklycommittedHours ? 'green' : 'red',
              }}
              icon={faCircle}
              data-testid="icon"
            />
          </div>

          <Link to={`/timelog/${user._id}`}>
            <i
              className="fa fa-clock-o"
              aria-hidden="true"
              style={{ fontSize: 24, cursor: 'pointer', color: 'black' }}
              title="Click to see user's timelog"
            />
          </Link>
        </section>
      </td>

      <td>
        <Table borderless className="team-member-tasks-subtable">
          <tbody>
            <tr>
              <td className="team-member-tasks-user-name">
                <Link
                  to={`/userprofile/${user._id}`}
                  style={{
                    color:
                      currentDate.isSameOrAfter(
                        moment(user.timeOffFrom, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
                      ) &&
                      currentDate.isBefore(moment(user.timeOffTill, 'YYYY-MM-DDTHH:mm:ss.SSSZ'))
                        ? 'rgba(128, 128, 128, 0.5)'
                        : undefined,
                  }}
                >
                  {user.firstName} {user.lastName}
                </Link>
                {canGetWeeklySummaries && <GoogleDocIcon link={userGoogleDocLink} />}
              </td>

              <td data-label="Time" /* className="team-clocks" */>
                <u>{user.weeklycommittedHours ? user.weeklycommittedHours : 0}</u> /
                <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
                <font color="red"> {totalHoursRemaining.toFixed(1)}</font>
              </td>
            </tr>
          </tbody>
        </Table>
      </td>
    </tr>
  );
};
