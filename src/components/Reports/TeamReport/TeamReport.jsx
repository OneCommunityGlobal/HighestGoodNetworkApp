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
import { getAllUserProfile } from 'actions/userManagement';

import { getTeamReportData } from './selectors';
import './TeamReport.css';
import { ReportPage } from '../sharedComponents/ReportPage';
import UserLoginPrivileges from './components/UserLoginPrivileges';

import Dropdown from 'react-bootstrap/Dropdown';
import { LoginPrivileges } from './components/LoginPrivileges.jsx';

export function TeamReport({ match }) {
  const dispatch = useDispatch();
  const { team } = useSelector(getTeamReportData);
  const [ teamMembers, setTeamMembers ] = useState([]);
  const [ allTeams, setAllTeams ] = useState([]);
  const [ allTeamsMembers, setAllTeamsMembers ] = useState([]);
  const [ searchParams, setSearchParams ] = useState({
    teamName: '',
    createdAt: moment('01-01-2015', 'MM-DD-YYYY').toDate(),
    modifiedAt: moment('01-01-2015', 'MM-DD-YYYY').toDate(),
    isActive: false,
    isInactive: false,
  });

  const [ selectedTeams, setSelectedTeams ] = useState([])

  function handleSelectTeam(event, selectedTeam, index) {
    if (event.target.checked) {
      if (selectedTeams.length < 4) {
        setSelectedTeams([...selectedTeams, { selectedTeam, index }]);
      }
    } else {
      setSelectedTeams((prevSelectedTeams) =>
        prevSelectedTeams.filter((team) => team.selectedTeam.teamName !== selectedTeam.teamName)
      );
    }
  }

  function handleSearchByName(event) {
    event.persist()

    setSearchParams(prevParams => ({
      ...prevParams,
      teamName: event.target.value,
    }))
  }

  function handleCheckboxChange(event) {
    const { id, checked } = event.target;
  
    if (id === 'active' && checked) {
      setSearchParams((prevParams) => ({
        ...prevParams,
        isActive: true,
      }));
    } else if (id === 'active' && !checked) {
      setSearchParams((prevParams) => ({
        ...prevParams,
        isActive: false,
      }));
    } else if (id === 'inactive' && checked) {
      setSearchParams((prevParams) => ({
        ...prevParams,
        isInactive: true,
      }));
    } else if (id === 'inactive' && !checked) {
      setSearchParams((prevParams) => ({
        ...prevParams,
        isInactive: false,
      }));
    } 
  }
  
  function handleSearch() {
    const searchResults = allTeams.filter((team) => {
      const isMatchedName = team.teamName.toLowerCase().includes(searchParams.teamName.toLowerCase());
      const isMatchedCreatedDate =
        moment(team.createdDatetime).isSameOrAfter(moment(searchParams.createdAt).startOf('day'));
      const isMatchedModifiedDate =
        moment(team.modifiedDatetime).isSameOrAfter(moment(searchParams.modifiedAt).startOf('day'));  
      const isActive = team.isActive === searchParams.isActive;
      const isInactive = team.isActive !== searchParams.isInactive;
      return isMatchedName && isMatchedCreatedDate && isMatchedModifiedDate && (isActive || isInactive);
    });
    return searchResults;
  }
  
  // Create a state variable to store the selected radio input
  const [selectedInput, setSelectedInput] = useState('isManager');
  
  // Event handler for when a radio input is selected
  const handleInputChange = (event) => {
    // Update the selectedInput state variable with the value of the selected radio input
    setSelectedInput(event.target.value);
  };

  function handleStatus(isActive) {
      return isActive ? 
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span className="dot" style={{ backgroundColor: '#00ff00', width: '0.7rem', height: '0.7rem' }}></span>
        <strong>Active</strong>
        </div> : 
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span className="dot" style={{ backgroundColor: 'red', width: '0.7rem', height: '0.7rem' }}></span>
          <strong>Inactive</strong>
        </div>
  }

  function handleDate(date) {
    const newDate = moment(date).format('MM-DD-YYYY');
    return newDate;
  }

  useEffect(() => {
    if (match) {
      dispatch(getTeamDetail(match.params.teamId));
      dispatch(getTeamMembers(match.params.teamId)).then(result => setTeamMembers([...result]));
      dispatch(getAllUserTeams())
      .then((result) => {
        setAllTeams([...result]);
        return result;
      })
      .then((result) => {
        const allTeamMembersPromises = result.map((team) => dispatch(getTeamMembers(team._id)));
        Promise.all(allTeamMembersPromises).then((results) => {
          setAllTeamsMembers([...results]);
        });
      });
    }
  }, []);

  if (!team) {
    return <h3>Team not found!</h3>;
  }

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
          <LoginPrivileges selectedInput={selectedInput} handleInputChange={handleInputChange} /> 

          <div className="update-date">
            Last updated:
            {moment(team.modifiedDatetime).format('YYYY-MM-DD')}
          </div>
        </div>
      </ReportPage.ReportBlock>
      <UserLoginPrivileges 
        handleInputChange={handleInputChange} 
        selectedInput={selectedInput} 
        teamName={team.teamName}
        teamMembers={teamMembers}
        selectedTeams={selectedTeams}
        allTeamsMembers={allTeamsMembers}
      />
      <ReportPage.ReportBlock>
        <div className="input-group input-group-sm d-flex flex-nowrap justify-content-between">
          <div className="d-flex align-items-center">
            <div className="d-flex flex-column">
              <label htmlFor="search-by-name" className="text-left">Name</label>
              <input 
                type="text" 
                className="form-control rounded-1 mr-3 w-auto" 
                placeholder="Search team name" 
                id="search-by-name" 
                onChange={(event) => handleSearchByName(event)}
              />
            </div>
            <div className="date-picker-container">
              <div id="task_startDate" className="date-picker-item">
                <div className="d-flex flex-column">
                  <label htmlFor="search-by-startDate" className="text-left">Created After</label>
                  <DatePicker 
                    selected={searchParams.createdAt}
                    onChange={(date) => setSearchParams(prevParams => ({
                      ...prevParams,
                      createdAt: new Date(date),
                    }))}
                    className="form-control w-auto" 
                    id="search-by-startDate" 
                  />
                </div>
              </div>
              <div id="task_EndDate" className="date-picker-item">
                <div className="d-flex flex-column">
                  <label htmlFor="search-by-endDate" className="text-left">Modified After</label>
                  <DatePicker 
                    selected={searchParams.modifiedAt}
                    onChange={(date) => setSearchParams(prevParams => ({
                      ...prevParams,
                      modifiedAt: new Date(date),
                    }))}
                    className="form-control  w-auto" 
                    id="search-by-endDate" 
                  />
                </div>
              </div>
              <div className="input-group input-group-sm d-flex">
                <div className="input-wrapper">
                  <label htmlFor="active" className="d-flex my-1">Active</label>
                  <input 
                    onChange={(event) => handleCheckboxChange(event)}
                    type="checkbox" 
                    className="d-flex mr-3" 
                    placeholder="Search team name" 
                    id="active" 
                    checked={searchParams.isActive}
                  />
                </div>
                <div className="input-wrapper">
                  <label htmlFor="inactive" className="d-flex my-1">Inactive</label>
                  <input 
                    onChange={(event) => handleCheckboxChange(event)}
                    type="checkbox" 
                    className="d-flex align-items-center" 
                    placeholder="Search team name" 
                    id="inactive" 
                    checked={searchParams.isInactive}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <table className="table tableHeader">
          <thead className="table table-hover">
            <tr>
              <td className="tableHeader"><strong>All</strong></td>
              <td className="tableHeader"><strong>Team</strong></td>
              <td className="tableHeader"><strong>Status</strong></td>
              <td className="tableHeader"><strong>Team Members</strong></td>
              <td className="tableHeader"><strong>ID</strong></td>
              <td className="tableHeader"><strong>Created At</strong></td>
              <td className="tableHeader"><strong>Modified At</strong></td>
            </tr>
          </thead>
          <tbody className="table">
            {
              handleSearch().map((team, index) => ( 
                <tr className="table-row" key={team._id}>
                  <td>
                    <input 
                    type="checkbox" 
                    onChange={() => handleSelectTeam(event, team, index)}
                    />
                  </td>
                  <td><strong>{team.teamName}</strong></td>
                  <td>{handleStatus(team.isActive)}</td>
                  <td><Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" style={{ backgroundColor: '#996cd3', border: 'none'}}>
                          See
                        </Dropdown.Toggle>
                          <Dropdown.Menu>
                          {allTeamsMembers[index] ? (
                            allTeamsMembers[index].length > 1 ? (
                              allTeamsMembers[index].map((member) => (
                                <div key={`${team._id}-${member._id}`}>
                                  <Dropdown.Item href="#/action-1">
                                    {member.firstName} {member.lastName}
                                  </Dropdown.Item>
                                  <Dropdown.Divider />
                                </div>
                              ))
                            ) : (
                              <Dropdown.Item href="#/action-1">
                                <strong>This team has no members!</strong>
                              </Dropdown.Item>
                            )
                          ) : (
                            <strong>Loading...</strong>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                  </td>
                  <td>{team._id}</td>
                  <td>{handleDate(team.createdDatetime)}</td>
                  <td>{handleDate(team.modifiedDatetime)}</td>
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