import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, connect } from 'react-redux';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import { FiUsers } from 'react-icons/fi';
import { BsCheckLg, BsXLg } from 'react-icons/bs';
import { getTeamDetail } from '../../../actions/team';
import {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import { getTeamReportData } from './selectors';
import './TeamReport.css';
import { ReportPage } from '../sharedComponents/ReportPage';
import UserLoginPrivileges from './components/UserLoginPrivileges';
import LoginPrivilegesSimulation from './components/TestComponents/LoginPrivilegesSimulation';

export function TeamReport({ match }) {
  const dispatch = useDispatch();
  const { team } = useSelector(getTeamReportData);
  const [ teamMembers, setTeamMembers ] = useState([]);
  const [ allTeams, setAllTeams ] = useState([]);
  console.log(allTeams)

  useEffect(() => {
    if (match) {
      dispatch(getTeamDetail(match.params.teamId));
      dispatch(getTeamMembers(match.params.teamId)).then((result) => {
        setTeamMembers([...result]);
      });
      dispatch(getAllUserTeams()).then((result) => {
        setAllTeams([...result]);
      });
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
  const [startDate, setStartDate] = useState(new Date('01-01-2010'));
  const [endDate, setEndDate] = useState(new Date());

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
          {/* <LoginPrivilegesSimulation selectedInput={selectedInput} handleInputChange={handleInputChange} /> */}

          <div className="update-date">
            Last updated:
            {moment(team.modifiedDatetime).format('YYYY-MM-DD')}
          </div>
        </div>
      </ReportPage.ReportBlock>
      <UserLoginPrivileges handleInputChange={handleInputChange} selectedInput={selectedInput} teamName={team.teamName}/>
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
                  <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="form-control  w-auto" id="search-by-endDate" />
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
        <table className="table tableHeader">
          <thead className="table table-hover">
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
            {
              allTeams.map(team => ( 
                <tr className="table-row">
                  <td><input type="checkbox" /></td>
                  <td><strong>{team.teamName}</strong></td>
                  <td>Priority</td>
                  <td>{isActive ? <span>Started</span> : <span>Not Started</span>}</td>
                  <td>@@@</td>
                  <td>{isActive ? <BsCheckLg /> : <BsXLg />}</td>
                  <td>{isInactive ? <BsCheckLg /> : <BsXLg />}</td>
                  <td>15.5</td>
                  <td>12/28/2022</td>
                  <td>12/31/2022</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </ReportPage.ReportBlock>
    </ReportPage>
  );
}

const mapStateToProps = state => ({ state });
export default connect(mapStateToProps, {
  getAllUserTeams,
  postNewTeam,
  deleteTeam,
  updateTeam,
  getTeamMembers,
  deleteTeamMember,
  addTeamMember,
})(TeamReport);