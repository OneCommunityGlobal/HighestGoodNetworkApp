import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Container,
  Alert,
  Spinner,
} from 'reactstrap';
import hasPermission from '~/utils/permissions';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/DarkMode.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { connect, useSelector } from 'react-redux';
import MembersAutoComplete from './MembersAutoComplete';
import ToggleSwitch from './ToggleSwitch/ToggleSwitch';
import InfoModal from './InfoModal';
export const TeamMembersPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const hasVisibilityIconPermission = hasPermission('seeVisibilityIcon');

  const [filterMode, setFilterMode] = useState('active'); // 'active' | 'all' | 'inactive'
  const nextLabelFor = m => (m === 'active' ? 'See All' : m === 'all' ? 'Inactive' : 'Active');
  const colorForMode = m =>
    m === 'inactive' ? '#ccc' : m === 'active' ? 'limegreen' : 'dodgerblue';
  const textColorForMode = m => (m === 'inactive' ? 'black' : 'white');

  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [deletedPopup, setDeletedPopup] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [isLoading, setisLoading] = useState(false);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');
  const validation = props.members.teamMembers || props.members;

  const closeDeletedPopup = () => {
    setDeletedPopup(!deletedPopup);
  };

  const handleDelete = id => {
    props.onDeleteClick(`${id}`);
    setDeletedPopup(true);
  };

  const closePopup = () => {
    setMemberList([]);
    props.onClose();
    setSortOrder(0);
    setFilterMode('active');
  };
  const onAddUser = () => {
    setisLoading(true);
    if (selectedUser) {
      const isDuplicate = validation.some(x => x._id === selectedUser._id);
      if (!isDuplicate) {
        props.onAddUser(selectedUser);
        setSearchText('');
        setDuplicateUserAlert(false);
        setTimeout(() => setisLoading(false), 2000);
      } else {
        setSearchText('');
        setDuplicateUserAlert(true);
        setDuplicateUserAlert(false);
        setisLoading(false);
      }
    } else {
      setDuplicateUserAlert(false);
      setIsValidUser(false);
      setisLoading(false);
    }
  };
  const selectUser = user => {
    setSelectedUser(user);
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  };

  const applyStatusFilter = (list, mode) => {
    if (mode === 'active') return list.filter(u => u.isActive);
    if (mode === 'inactive') return list.filter(u => !u.isActive);
    return list; // 'all'
  };

  const sortByPermission = useCallback((a, b) => {
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
   * Sort the member list
   * @param {-1 | 0 | 1} [sort = 0]
   * -1: ascending order by date
   * 0: alphabetized order by name
   * 1: descending order by date
   */
  const sortList = (sort = 0) => {
    let sortedList = [];

    if (sort === 0) {
      const groupByPermissionList = validation.reduce((pre, cur) => {
        const { role } = cur;
        return {
          ...pre,
          [role]: pre[role] ? [...pre[role], cur] : [cur],
        };
      }, {});
      sortedList = Object.keys(groupByPermissionList)
        .sort(sortByPermission)
        .map(key => groupByPermissionList[key])
        .map(list => [...list].sort(sortByAlpha))
        .flat();
    } else {
      const sortByDateList = [...validation].sort((a, b) => {
        return moment(a.addDateTime).diff(moment(b.addDateTime)) * -sort;
      });

      const dataList = Object.values(
        sortByDateList.reduce((pre, cur) => {
          const date = moment(cur.addDateTime).format('MMM-DD-YY');
          return {
            ...pre,
            [date]: pre[date] ? [...pre[date], cur] : [cur],
          };
        }, {}),
      );

      dataList.forEach(item => {
        sortedList.push(...[...item].sort(sortByAlpha));
      });
    }
    setMemberList(sortedList);
  };

  const returnUserRole = user => {
    const rolesArr = ['Manager', 'Mentor', 'Assistant Manager'];
    if (rolesArr.includes(user.role)) return true;
    return false;
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
    const newMemberVisibility = {};
    if (teamsData !== null && teamsData !== undefined && teamsData.length !== 0) {
      teamsData[0]?.members.forEach(member => {
        newMemberVisibility[member.userId] = member.visible;
      });
    }
    return newMemberVisibility;
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

  const emptyState = (
    <tr>
      <td colSpan={canAssignTeamToUsers ? 6 : 5} className="empty-data-message">
        There are no users on this team.
      </td>
    </tr>
  );

  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal
        isOpen={props.open}
        toggle={closePopup}
        /* eslint-disable-next-line jsx-a11y/no-autofocus */
        autoFocus={false}
        size="lg"
        className={`${darkMode ? 'dark-mode text-light' : ''} ${
          props.open ? ' open-team-members-popup-modal' : ''
        }`}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet' : ''}
          toggle={closePopup}
        >{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <div className={darkMode ? 'bg-space-cadet' : ''}>
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
                disabled={isLoading}
              >
                {isLoading ? <Spinner color="light" size="sm" /> : 'Add'}
              </Button>
            </div>
          )}
        </div>
        <ModalBody
          className={darkMode ? 'bg-yinmn-blue' : ''}
          style={{ textAlign: 'center', overflowX: 'auto' }}
        >
          {duplicateUserAlert && (
            <Alert color="danger">Member is already a part of this team.</Alert>
          )}
          {!duplicateUserAlert && isValidUser === false && (
            <Alert color="danger">Please choose a valid user.</Alert>
          )}

          <table
            className={`table table-bordered table-responsive-xlg ${
              darkMode ? 'dark-mode text-light' : ''
            }`}
            style={{ tableLayout: 'fixed' }}
          >
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
                <th
                  style={{
                    width: 120,
                    textAlign: 'center',
                    background: darkMode ? '#1f2a44' : '#e9f2ff',
                    verticalAlign: 'middle',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFilterMode(m =>
                        m === 'active' ? 'all' : m === 'all' ? 'inactive' : 'active',
                      );
                    }}
                    style={{
                      backgroundColor: colorForMode(filterMode),
                      color: textColorForMode(filterMode),
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      minWidth: 90,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {nextLabelFor(filterMode)}
                  </button>
                </th>

                <th
                  className="def-width"
                  style={{ width: 56, textAlign: 'center', verticalAlign: 'middle' }}
                >
                  #
                </th>

                <th
                  className="def-width"
                  style={{ minWidth: 220, textAlign: 'center', verticalAlign: 'middle' }}
                >
                  User Name
                </th>

                <th
                  style={{
                    width: 120,
                    cursor: 'pointer',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                  onClick={toggleOrder}
                >
                  Date Added{' '}
                  <FontAwesomeIcon
                    icon={icons[sortOrder].icon}
                    className={icons[sortOrder].className}
                  />
                </th>

                <th style={{ width: 110, textAlign: 'center', verticalAlign: 'middle' }}>
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
                {canAssignTeamToUsers && (
                  <th
                    style={{ width: 120, textAlign: 'center', verticalAlign: 'middle' }}
                    aria-label="Assign Team to Users"
                  >
                    <span style={{ display: 'none' }}>Assign Team to Users</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {(() => {
                if (props.fetching) {
                  return (
                    <tr>
                      <td align="center" colSpan={canAssignTeamToUsers ? 6 : 5}>
                        <Spinner
                          color={`${darkMode ? 'light' : 'dark'}`}
                          animation="border"
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                }

                const visibleList = applyStatusFilter(memberList, filterMode);
                if (!visibleList.length) {
                  return emptyState;
                }

                return visibleList.map((user, index) => (
                  <tr key={`${props.selectedTeamName}-${user._id}`}>
                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      <div className={user.isActive ? 'isActive' : 'isNotActive'}>
                        <i className="fa fa-circle" aria-hidden="true" />
                      </div>
                    </td>
                    <td
                      className="def-width"
                      style={{ verticalAlign: 'middle', textAlign: 'center' }}
                    >
                      {index + 1}
                    </td>
                    <td
                      className="def-width"
                      style={{ verticalAlign: 'middle', textAlign: 'center' }}
                    >
                      {returnUserRole(user) ? (
                        <b>
                          {user.firstName} {user.lastName} ({user.role})
                        </b>
                      ) : (
                        <span>
                          {user.firstName} {user.lastName} ({user.role})
                        </span>
                      )}{' '}
                      {hasVisibilityIconPermission && !user.isVisible && (
                        <i className="fa fa-eye-slash" title="User is invisible" />
                      )}
                    </td>
                    <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {moment(user.addDateTime).format('MMM-DD-YY')}
                    </td>
                    <td
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                      }}
                    >
                      <ToggleSwitch
                        key={`${props.selectedTeamName}-${user._id}`}
                        switchType="limit-visibility"
                        userId={user._id}
                        choice={memberVisibility[user._id]}
                        UpdateTeamMembersVisibility={UpdateTeamMembersVisibility}
                      />
                    </td>
                    {canAssignTeamToUsers && (
                      <td style={{ whiteSpace: 'nowrap', minWidth: '100px', textAlign: 'center' }}>
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
                ));
              })()}
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
            Team member successfully deleted! Ryunosuke Satoro famously said, &ldquo;Individually we
            are one drop, together we are an ocean.&rdquo; Through the action you just took, this
            ocean is now one drop smaller.
          </p>
        </ModalBody>
      </Modal>
    </Container>
  );
});

TeamMembersPopup.displayName = 'TeamMembersPopup';

export default connect(null, { hasPermission })(TeamMembersPopup);
