/*********************************************************************************
 * Component: MEMBERS
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect } from 'react-redux';
import {
  fetchAllMembers,
  findUserProfiles,
  getAllUserProfiles,
  assignProject,
} from './../../../actions/projectMembers';
import Member from './Member';
import FoundUser from './FoundUser';
import './members.css';
import hasPermission from '../../../utils/permissions';
import { boxStyle } from 'styles';
import ToggleSwitch from 'components/UserProfile/UserProfileEdit/ToggleSwitch';
import { permissions } from 'utils/constants';


const Members = props => {
  const projectId = props.match.params.projectId;
  const [showFindUserList, setShowFindUserList] = useState(false);
  const [membersList, setMembersList] = useState(props.state.projectMembers.members);
  const [lastTimeoutId, setLastTimeoutId] = useState(null);

  
  const canGetProjectMembers = props.hasPermission(permissions.projects.getProjectMembers);
  const canAssignProjectToUsers = props.hasPermission(permissions.projects.assignProjectToUsers);
  const canUnassignUserInProject = props.hasPermission(permissions.projects.unassignUserInProject);

  useEffect(() => {
    props.fetchAllMembers(projectId);
  }, [projectId]);

  const assignAll = async () => {
    const allUsers = props.state.projectMembers.foundUsers.filter(user => user.assigned === false);

    // Wait for all members to be assigned
    await Promise.all(
      allUsers.map(user =>
        props.assignProject(projectId, user._id, 'Assign', user.firstName, user.lastName),
      ),
    );

    props.fetchAllMembers(projectId);
  };

  useEffect(() => {
    setMembersList(props.state.projectMembers.members);
  }, [props.state.projectMembers.members]);

  // ADDED: State for toggling display of active members only
  const [showActiveMembersOnly, setShowActiveMembersOnly] = useState(false);

  const displayedMembers = showActiveMembersOnly
    ? membersList.filter(member => member.isActive)
    : membersList;

  const handleToggle = async () => {
    setShowActiveMembersOnly(prevState => !prevState);
    await props.fetchAllMembers(projectId);
    setMembersList(props.state.projectMembers.members);
  };

  // Waits for user to finsh typing before calling API
  const handleInputChange = event => {
    const currentValue = event.target.value;

    if (lastTimeoutId !== null) clearTimeout(lastTimeoutId);

    const timeoutId = setTimeout(() => {
      props.findUserProfiles(currentValue);
      setShowFindUserList(true);
    }, 300);

    setLastTimeoutId(timeoutId);
  };

  return (
    <React.Fragment>
      <div className="container">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/projects/`}>
              <button type="button" className="btn btn-secondary" style={boxStyle}>
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </button>
            </NavItem>

            <div id="member_project__name">PROJECTS {props.projectId}</div>
          </ol>
        </nav>
        {canGetProjectMembers ? (
          <div className="input-group" id="new_project">
            <div className="input-group-prepend">
              <span className="input-group-text">Find user</span>
            </div>

            <input
              autoFocus
              type="text"
              className="form-control"
              aria-label="Search user"
              placeholder="Name"
              onChange={e => handleInputChange(e)}
              disabled={showActiveMembersOnly}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={e => {
                  props.getAllUserProfiles();
                  setShowFindUserList(true);
                }}
                disabled={showActiveMembersOnly}
              >
                All
              </button>
              <button
                className="btn btn-outline-danger"
                type="button"
                onClick={() => setShowFindUserList(false)} // Hide the find user list
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {showFindUserList && props.state.projectMembers.foundUsers.length > 0 ? (
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th scope="col" id="foundUsers__order">
                  #
                </th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                {canAssignProjectToUsers ? (
                  <th scope="col">
                    Assign
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={() => assignAll()}
                      style={boxStyle}
                    >
                      +All
                    </button>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {props.state.projectMembers.foundUsers.map((user, i) => (
                <FoundUser
                  index={i}
                  key={user._id}
                  projectId={projectId}
                  uid={user._id}
                  email={user.email}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  assigned={user.assigned}
                />
              ))}
            </tbody>
          </table>
        ) : null}

        <ToggleSwitch
          switchType="active_members"
          state={showActiveMembersOnly}
          handleUserProfile={handleToggle}
        />

        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
              <th scope="col" id="members__order">
                #
              </th>
              <th scope="col" id="members__name"></th>
              {canUnassignUserInProject ? <th scope="col" id="members__name"></th> : null}
            </tr>
          </thead>
          <tbody>
            {displayedMembers.map((member, i) => (
              <Member
                index={i}
                key={member._id}
                projectId={projectId}
                uid={member._id}
                fullName={member.firstName + ' ' + member.lastName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, {
  fetchAllMembers,
  findUserProfiles,
  getAllUserProfiles,
  assignProject,
  hasPermission,
})(Members);
