/*********************************************************************************
 * Component: MEMBERS
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NavItem } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
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
import { boxStyle, boxStyleDark } from '~/styles';
import ToggleSwitch from '~/components/UserProfile/UserProfileEdit/ToggleSwitch';
import Loading from '~/components/common/Loading';


const Members = props => {
  const darkMode = props.state.theme.darkMode;
  const projectId = props.match.params.projectId;
  const [showFindUserList, setShowFindUserList] = useState(false);
  const [membersList, setMembersList] = useState(props.state.projectMembers.members);
  const [lastTimeoutId, setLastTimeoutId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  const canUnassignUserInProject = props.hasPermission('unassignUserInProject');

  const projectName = useSelector(state => state.projectById?.projectName || '');

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setMembersList([]);
      await props.fetchAllMembers(projectId);
      props.getProjectDetail(projectId);
      setIsLoading(false);
    };
    fetchMembers();
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
    if (!isLoading) {
      setMembersList(props.state.projectMembers.members);
    }
  }, [props.state.projectMembers.members, isLoading]);

  // ADDED: State for toggling display of active members only
  const [showActiveMembersOnly, setShowActiveMembersOnly] = useState(true);

  // avoid re-filtering the netire list on every render
  const displayedMembers = useMemo(
    () => (showActiveMembersOnly ? membersList?.filter(member => member.isActive) : membersList),
    [membersList, showActiveMembersOnly]
  );

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
      // Only call findUserProfiles if there's actual search text
      if (currentValue && currentValue.trim() !== '') {
        props.findUserProfiles(currentValue);
        setShowFindUserList(true);
      } else {
        setShowFindUserList(false);
      }
    }, 300);
  
    setLastTimeoutId(timeoutId);
  };

  return (
    <React.Fragment>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{minHeight: "100%"}}>
        <div className={`container pt-2 ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
          <nav aria-label="breadcrumb" className="w-100">
            <div
              className={`d-flex align-items-center justify-content-center breadcrumb ${darkMode ? 'bg-space-cadet' : ''}`}
              style={{
                ...darkMode ? boxStyleDark : boxStyle,
                backgroundColor: darkMode ? '' : '#E9ECEF',
                margin: '0 0 16px',
                padding: '12px 16px',
                position: 'relative',
                flexWrap: 'wrap', 
              }}
            >
            
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <NavItem tag={Link} to={`/projects/`}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
                  </button>
                </NavItem>
              </div>

              <div
                
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  wordBreak: 'break-word', 
                  flexGrow: 1, 
                  whiteSpace: 'normal', 
                }}
              >
                {projectName}
              </div>
            </div>

          </nav>
          {canAssignProjectToUsers ? (
            <div className="input-group" id="new_project">
              <div className="input-group-prepend">
                <span className={`input-group-text ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>Find user</span>
              </div>

              <input
                autoFocus
                type="text"
                className={`form-control ${darkMode ? 'bg-darkmode-liblack text-light' : ''}`}
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
            <table className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}>
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
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
                        style={darkMode ? {} : boxStyle}
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
                    darkMode={darkMode}
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

          {isLoading ? (<Loading align="center" />) : (
            <table className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}>
              <thead>
                <tr className={darkMode ? 'bg-space-cadet' : ''}>
                  <th scope="col" id="members__order">
                    #
                  </th>
                  <th scope="col" id="members__name">
                    Name
                  </th>
                  <th scope="col" id="members__delete"></th>
                  {canUnassignUserInProject ? <th scope="col" id="members__name"></th> : null}
                </tr>
              </thead>
              <tbody>
                {displayedMembers.map((member, i) => (
                  <Member
                    index={i}
                    key={member._id ?? i}
                    projectId={projectId}
                    uid={member._id}
                    fullName={member.firstName + ' ' + member.lastName}
                    darkMode={darkMode}
                  />
                ))}

              </tbody>
            </table>
          )}
        </div>
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
  getProjectDetail,
})(Members);
