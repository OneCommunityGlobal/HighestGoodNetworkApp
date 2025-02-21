import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert, Spinner } from 'reactstrap';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { connect, useSelector } from 'react-redux';
import MembersAutoComplete from './MembersAutoComplete';

import ToggleSwitch from './ToggleSwitch/ToggleSwitch';
import InfoModal from './InfoModal';
import styles from './ToggleSwitch/ToggleSwitch.module.scss';

export const TeamMembersPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isChecked, setIsChecked] = useState(1); // 0 = false, 1 = true, 2 = all
  const [checkedStatus, setCheckedStatus] = useState('Active'); // 0 = false, 1 = true, 2 = all
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [deletedPopup, setDeletedPopup] = useState(false);
  const trackColor = isChecked === 0 ? '#ccc' : isChecked === 1 ? 'limegreen' : 'dodgerblue';

  const closeDeletedPopup = () => {
    setDeletedPopup(!deletedPopup);
  };

  const handleDelete = id => {
    props.onDeleteClick(`${id}`);
    setDeletedPopup(true);
  };

  const handleToggle = () => {
    setIsChecked(parseInt(event.target.value));
    setCheckedStatus(parseInt(event.target.value) == 0 ? 'Inactive' : (parseInt(event.target.value)  == 1 ? 'Active' : 'See All'))
  };

  const [infoModal, setInfoModal] = useState(false);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

  const validation = props.members.teamMembers || props.members;

  const closePopup = () => {
    setMemberList([]);
    props.onClose();
    setSortOrder(0);
    setIsChecked(true);
    setCheckedStatus('Active');
  };
  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = validation.some(x => x._id === selectedUser._id);
      if (!isDuplicate) {
        props.onAddUser(selectedUser);
        setSearchText('');
        setDuplicateUserAlert(false);
      } else {
        setSearchText('');
        setDuplicateUserAlert(true);
      }
    } else {
      setDuplicateUserAlert(false);
      setIsValidUser(false);
    }
  };
  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  };

  const sortByPermission = useCallback((a, b) => {
    // Sort by index
    const rolesPermission = [
      'owner',
      'administrator',
      'core team',
      'manager',
      'mentor',
      'assistant manager',
      'volunteer',
    ];
    return rolesPermission.indexOf(a.toLowerCase()) - rolesPermission.indexOf(b.toLowerCase());
  }, []);

  const sortByAlpha = useCallback((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }, []);

  /**
   * The function to sort the memberlist
   * @param {-1 | 0 | 1} [sort = 0]
   * -1: ascending order by date
   * 0: alphabetized order by name
   * 1: descending order by date
   */
  const sortList = (sort = 0) => {
    let sortedList = [];

    if (sort === 0) {
      const groupByPermissionList =
        validation.reduce((pre, cur) => {
          const { role } = cur;
          pre[role] ? pre[role].push(cur) : (pre[role] = [cur]);
          return pre;
        }, {}) ?? {};
      sortedList = Object.keys(groupByPermissionList)
        .sort(sortByPermission)
        .map(key => groupByPermissionList[key])
        .map(list => list.toSorted(sortByAlpha))
        .flat();
    } else {
      const sortByDateList = validation.toSorted((a, b) => {
        return moment(a.addDateTime).diff(moment(b.addDateTime)) * -sort;
      });

      const dataList = Object.values(
        sortByDateList.reduce((pre, cur) => {
          const date = moment(cur.addDateTime).format('MMM-DD-YY');
          pre[date] ? pre[date].push(cur) : (pre[date] = [cur]);
          return pre;
        }, {}),
      );

      dataList.forEach(item => {
        sortedList.push(...item.toSorted(sortByAlpha));
      });
    }
    setMemberList(sortedList);
  };

  const returnUserRole = user => {
    const rolesArr = ['Manager', 'Mentor', 'Assistant Manager'];
    if (rolesArr.includes(user.role)) return true;
  };

  const icons = {
    '-1': { icon: faSortUp },
    '0': { icon: faSort, style: { color: 'lightgrey' } },
    '1': { icon: faSortDown },
  };

  const toggleOrder = useCallback(() => {
    setSortOrder(pre => {
      if (pre !== -1) {
        return pre - 1;
      }
      return 1;
    });
  }, []);

  const [memberVisibility, setMemberVisibility] = useState({});
  const getMemberVisibility = () => {
    const teamsData = props.teamData;
    let memberVisibility = {};
    if (teamsData !== null && teamsData !== undefined && teamsData.length !== 0) {
      teamsData[0]?.members.forEach(member => {
        memberVisibility[member.userId] = member.visible;
      });
    }
    return memberVisibility;
  };

  useEffect(() => {
    sortList(sortOrder);
    const newMemberVisibility = getMemberVisibility();
    setMemberVisibility(newMemberVisibility);
  }, [validation, sortOrder]);

  useEffect(() => {
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  }, [props.open]);

  // call the handler to update the team member's visibility
  const UpdateTeamMembersVisibility = (userId, choice) => {
    props.onUpdateTeamMemberVisibility(userId, choice);
  };

  const toggleInfoModal = () => {
    setInfoModal(!infoModal);
  };

  const emptyState = (<tr><td colSpan={6} className='empty-data-message'>There are no users on this team.</td></tr>);

  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal
        isOpen={props.open}
        toggle={closePopup}
        autoFocus={false}
        size="lg"
        className={`${darkMode ? 'dark-mode text-light' : ''} ${props.open ? ' open-team-members-popup-modal' : ''}`}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet' : ''}
          toggle={closePopup}
        >{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <div
        className={darkMode ? 'bg-space-cadet' : ''}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ margin: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                existingMembers={validation}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button
                color="primary"
                onClick={onAddUser}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Add
              </Button>
            </div>
          )}
        </div>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center', overflowX: 'auto' }}>
          {duplicateUserAlert ? (
            <Alert color="danger">Member is already a part of this team.</Alert>
          ) : isValidUser === false ? (
            <Alert color="danger">Please choose a valid user.</Alert>
          ) : (
            <></>
          )}

          <table
            className={`table table-bordered table-responsive-xlg ${darkMode ? 'dark-mode text-light' : ''
              }`}
          >
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
<<<<<<< HEAD
                <th>Active</th>
                <th className='def-width'>#</th>
                <th className="def-width">User Name</th>
=======
              <th>
              <div className={styles.divContainer}>
              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={isChecked}
                  onChange={handleToggle}
                  className={styles.slider}
                  title="Move Slider for Status change. Left: Inactive, Middle: Active, Right: See All"
                  // Dynamic inline style for background color based on status
                  style={{'--track-color': trackColor, 
                          '--thumb-color': trackColor,}}
                />
                <span>{checkedStatus}</span>
              </div>
            </div>
                </th>
                <th>#</th>
                <th>User Name</th>
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
                <th style={{ cursor: 'pointer' }} onClick={toggleOrder}>
                  Date Added <FontAwesomeIcon {...icons[sortOrder]} />
                </th>
                <th>
                  See All{' '}
                  <i
                    data-toggle="tooltip"
                    data-placement="right"
                    title="Click for more information"
                    style={{ fontSize: 17, cursor: 'pointer' }}
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={toggleInfoModal}
                  />
                </th>
                {canAssignTeamToUsers && <th />}
              </tr>
            </thead>
            <tbody>
              {((Array.isArray(props.members.teamMembers) &&
                props.members.teamMembers.length > 0) ||
                (typeof props.members.fetching === 'boolean' &&
                  !props.members.fetching &&
                  props.members.teamMembers) ||
                (Array.isArray(props.members) && props.members.length > 0)) && 
                memberList.toSorted().filter(e=>{if(isChecked != 2) { return e.isActive == isChecked} else return true}).map((user, index) => {
                  return (
                    <tr key={`${props.selectedTeamName}-${user.id}-${index}`}>
                      <td>
                        <span className={user.isActive ? 'isActive' : 'isNotActive'}>
                          <i className="fa fa-circle" aria-hidden="true" />
                        </span>
                      </td>
                      <td>{index + 1}</td>
                      <td>
                        {returnUserRole(user) ? (
                          <b>
                            {user.firstName} {user.lastName} ({user.role})
                          </b>
                        ) : (
                          <span>
                            {user.firstName} {user.lastName} ({user.role})
                          </span>
                        )}{' '}
                      </td>
                      {/* <td>{user}</td> */}
                      <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
                      <td>
                        <ToggleSwitch
                          key={`${props.selectedTeamName}-${user._id}`}
                          switchType="limit-visibility"
                          userId={user._id}
                          choice={memberVisibility[user._id]}
                          UpdateTeamMembersVisibility={UpdateTeamMembersVisibility}
                        />
                      </td>
                      {canAssignTeamToUsers && (
                        <td>
                          <div className={user.isActive ? 'isActive' : 'isNotActive'}>
                            <i className="fa fa-circle" aria-hidden="true" />
                          </div>
                        </td>
<<<<<<< HEAD
                        <td className="def-width">{index + 1}</td>
                        <td className="def-width">
                          {returnUserRole(user) ? (
                            <b>
                              {user.firstName} {user.lastName} ({user.role})
                            </b>
                          ) : (
                            <span>
                              {user.firstName} {user.lastName} ({user.role})
                            </span>
                          )}{' '}
                          {hasVisibilityIconPermission && !user.isVisible && (  // Invisibility icon from 'Cillian'
                            <i className="fa fa-eye-slash" title="User is invisible" />
                          )}
                        </td>
                        {/* <td>{user}</td> */}
                        <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
                        <td>
                          <ToggleSwitch
                            key={`${props.selectedTeamName}-${user._id}`}
                            switchType="limit-visibility"
                            userId={user._id}
                            choice={memberVisibility[user._id]}
                            UpdateTeamMembersVisibility={UpdateTeamMembersVisibility}
                          />
                        </td>
                        {canAssignTeamToUsers && (
                          <td>
                            <Button
                              color="danger"
                              onClick={() => handleDelete(user._id)}
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              Delete
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
=======
                      )}
                    </tr>
                  );
                })
                }
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={deletedPopup}
        toggle={closeDeletedPopup}
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader
          toggle={closeDeletedPopup}
          className={`${darkMode ? 'bg-space-cadet' : ''} text-danger font-weight-bold`}
        >
          Member Deleted!
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p>
            Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are
            one drop, together we are an ocean.” Through the action you just took, this ocean is now
            one drop smaller.
          </p>
        </ModalBody>
      </Modal>
    </Container>
  );
});

export default connect(null, { hasPermission })(TeamMembersPopup);
