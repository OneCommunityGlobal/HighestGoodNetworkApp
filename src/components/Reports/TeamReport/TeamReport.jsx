/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-this-in-sfc */
/* eslint-disable no-undef */
/* eslint-disable import/order */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { FiUsers } from 'react-icons/fi';
import { BsCheckLg, BsXLg } from 'react-icons/bs';
import { getTeamDetail } from '../../../actions/team';
import { getTeamReportData } from './selectors';
import './TeamReport.css';
import { ReportPage } from '../sharedComponents/ReportPage';
import UserLoginPrivileges from './components/UserLoginPrivileges';
import LoginPrivilegesSimulation from './components/TestComponents/LoginPrivilegesSimulation';

class Question extends React.Component {
  render() {
    return (
      <h3>
        {' '}
        Lets go for a
        {' '}
        <FaBeer />
        ?
        {' '}
      </h3>
    );
  }
}

export function TeamReport({ match }) {
  const dispatch = useDispatch();
  const { team } = useSelector(getTeamReportData);

  useEffect(() => {
    if (match) {
      dispatch(getTeamDetail(match.params.teamId));
    }
  }, []);

  if (!team) {
    return null;
  }

  // Create a state variable to store the selected radio input
  const [selectedInput, setSelectedInput] = useState('isManager');

  // Event handler for when a radio input is selected
  const handleInputChange = (event) => {
    // Update the selectedInput state variable with the value of the selected radio input
    setSelectedInput(event.target.value);
  };

  const isActive = true;
  const isInactive = false;
  const startDate = new Date('01-01-2010');
  const endDate = new Date();

  return (
    <ReportPage
      contentClassName="team-report-blocks"
      renderProfile={
        () => (
          <ReportPage.ReportHeader isActive={team.isActive} avatar={<FiUsers />} name={team.teamName}>
            <div>
              <h5>{moment(team.createdDatetime).format('YYYY-MM-DD')}</h5>
              <p>Created Date</p>
            </div>
          </ReportPage.ReportHeader>
        )
}
    >
      <ReportPage.ReportBlock className="team-report-main-info-wrapper">
        <div className="team-report-main-info-id">
          <div>
            <span className="team-report-star">&#9733;</span>
            {' '}
            Team ID:
            {' '}
            {team._id}
          </div>
          {/*
          This LoginPrivilegesSimulation component will be removed once the backend team link the login privileges.
          It is just to simulate the toggle between the login privileges. The logic is
          inside the userLoginPrivileges.jsx file.
          */}
          <LoginPrivilegesSimulation selectedInput={selectedInput} handleInputChange={handleInputChange} />
          <div className="update-date">
            Last updated:
            {moment(team.modifiedDatetime).format('YYYY-MM-DD')}
          </div>
        </div>
      </ReportPage.ReportBlock>
      <UserLoginPrivileges handleInputChange={handleInputChange} selectedInput={selectedInput} />
      <ReportPage.ReportBlock>
        <div className="input-group input-group-sm d-flex flex-nowrap justify-content-between">
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column">
              <label htmlFor="search-by-name" className="text-left">Name</label>
              <input type="text" className="form-control rounded-1 mr-3 w-auto" placeholder="Search team name" id="search-by-name" />
            </div>
            <div className="d-flex flex-column">
              <label htmlFor="search-by-resources" className="text-left">Resources</label>
              <input type="text" className="form-control rounded-1 mr-3 w-auto" placeholder="Resources" id="search-by-resources" />
            </div>
            <div className="date-picker-container">
              <div id="task_startDate" className="date-picker-item">
                <div className="d-flex flex-column">
                  <label htmlFor="search-by-startDate" className="text-left">Start Date</label>
                  <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="form-control w-auto" id="search-by-startDate" />
                </div>
              </div>
              <div id="task_EndDate" className="date-picker-item">
                <div className="d-flex flex-column">
                  <label htmlFor="search-by-endDate" className="text-left">End Date</label>
                  <DatePicker selected={endDate} onChange={(date) => setStartDate(date)} className="form-control  w-auto" id="search-by-endDate" />
                </div>
              </div>
              <div className="input-group d-flex align-items-center">
                <label htmlFor="checkbox-active" className="d-flex my-1">Active</label>
                <input type="checkbox" className="d-flex mr-3" placeholder="Search team name" id="checkbox-active" />
                <label htmlFor="checkbox-inactive" className="d-flex my-1">Inactive</label>
                <input type="checkbox" className="d-flex align-items-center" placeholder="Search team name" id="checkbox-inactive" />
              </div>
            </div>
          </div>
        </div>
        <table class="table tableHeader">
          <thead class="table table-hover">
            <tr>
              <td className="tableHeader"><strong>All</strong></td>
              <td className="tableHeader"><strong>Team</strong></td>
              <td className="tableHeader"><strong>Priority</strong></td>
              <td className="tableHeader"><strong>Status</strong></td>
              <td className="tableHeader"><strong>Resources</strong></td>
              <td className="tableHeader"><strong>Active</strong></td>
              <td className="tableHeader"><strong>Assign</strong></td>
              <td className="tableHeader"><strong>Estimated Hours</strong></td>
              <td className="tableHeader"><strong>Start Date</strong></td>
              <td className="tableHeader"><strong>End Date</strong></td>
            </tr>
          </thead>
          <tbody className="table">
            <tr>
              <td class="table-white"><input type="checkbox" /></td>
              <td class="table-white"><strong>Team A</strong></td>
              <td class="table-white">Priority</td>
              <td class="table-white">{isActive ? <span>Started</span> : <span>Not Started</span>}</td>
              <td class="table-white">@@@</td>
              <td class="table-white">{isActive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">{isInactive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">15.5</td>
              <td class="table-white">12/28/2022</td>
              <td class="table-white">12/31/2022</td>
            </tr>
            <tr>
              <td class="table-white"><input type="checkbox" /></td>
              <td class="table-white"><strong>Team B</strong></td>
              <td class="table-white">Priority</td>
              <td class="table-white">{isActive ? <span>Started</span> : <span>Not Started</span>}</td>
              <td class="table-white">@@@</td>
              <td class="table-white">{isInactive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">{isActive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">15.5</td>
              <td class="table-white">12/28/2022</td>
              <td class="table-white">12/31/2022</td>
            </tr>
            <tr>
              <td class="table-white"><input type="checkbox" /></td>
              <td class="table-white"><strong>Team C</strong></td>
              <td class="table-white">Priority</td>
              <td class="table-white">{isInactive ? <span>Started</span> : <span>Not Started</span>}</td>
              <td class="table-white">@@@</td>
              <td class="table-white">{isActive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">{isActive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">15.5</td>
              <td class="table-white">12/28/2022</td>
              <td class="table-white">12/31/2022</td>
            </tr>
            <tr>
              <td class="table-white"><input type="checkbox" /></td>
              <td class="table-white"><strong>Team D</strong></td>
              <td class="table-white">Priority</td>
              <td class="table-white">{isActive ? <span>Started</span> : <span>Not Started</span>}</td>
              <td class="table-white">@@@</td>
              <td class="table-white">{isInactive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">{isInactive ? <BsCheckLg /> : <BsXLg />}</td>
              <td class="table-white">15.5</td>
              <td class="table-white">12/28/2022</td>
              <td class="table-white">12/31/2022</td>
            </tr>
          </tbody>
        </table>
      </ReportPage.ReportBlock>
    </ReportPage>
  );
}
