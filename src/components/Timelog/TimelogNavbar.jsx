import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Progress,
  Navbar,
  Collapse,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';

const TimelogNavbar = ({ userId }) => {
  const { firstName, lastName } = useSelector(state => state.userProfile);
  const [collapsed, setCollapsed] = useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);

  const timeEntries = useSelector(state => state.timeEntries.weeks[0]);
  const reducer = (total, entry) => total + parseInt(entry.hours) + parseInt(entry.minutes) / 60;
  const totalEffort = timeEntries.reduce(reducer, 0);
  const weeklycommittedHours = useSelector(state => state.userProfile.weeklycommittedHours);

  return (
    <div>
      <Navbar className="navbar navbar-expand-sm navbar-light navbar-border bg-light mb-2 col-md-12 nav-fill">
        <NavbarBrand className="navbar-brand pb-3">
          {firstName} {lastName}
          &apos;s Timelog
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} />
        <Collapse isOpen={!collapsed} className="ml-auto flex-column" id="timelogsnapshot" navbar>
          <Nav navbar className="navbar-nav w-100">
            <NavItem className="nav-item navbar-text w-80" id="timelogweeklychart">
              <div>
                Current Week : {totalEffort.toFixed(2)} / {weeklycommittedHours}
              </div>
              <Progress
                value={getProgressValue(totalEffort, weeklycommittedHours)}
                color={getProgressColor(totalEffort, weeklycommittedHours)}
                striped={totalEffort < weeklycommittedHours}
              />
            </NavItem>
            <NavItem className="mt-3">
              <NavLink tag={Link} href={`/userprofile/${userId}`} to={`/userprofile/${userId}`}>
                View Profile
              </NavLink>
            </NavItem>
          </Nav>
          {/* <ul className="navbar-nav flex-row ml-auto">
            <li className="nav-item navbar-text ml-4">
              <span
                className="fa fa-tasks icon-large align-middle"
                data-toggle="modal"
                data-target="#actionItems"
              >
                <i className="badge badge-pill badge-warning badge-notify align-middle" />
              </span>
            </li>
            <li className="nav-item navbar-text ml-4">
              <i
                className="fa fa-envelope icon-large align-middle"
                data-toggle="modal"
                data-target="#notifications"
              >
                <i className="badge badge-pill badge-warning badge-notify align-middle ml-1">noti</i>
              </i>
            </li>
            <li className="nav-item navbar-text ml-4">
              <a className="nav-link" href={`/userprofile/${userId}`}>
                View Profile
              </a>
            </li>
          </ul> */}
        </Collapse>
      </Navbar>
    </div>
  );
};

export default TimelogNavbar;
