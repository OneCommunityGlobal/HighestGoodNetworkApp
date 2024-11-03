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

export const TeamMembersPopup = React.memo((props) => {
  const darkMode = useSelector((state) => state.theme.darkMode);

  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [deletedPopup, setDeletedPopup] = useState(false);

  const closeDeletedPopup = () => {
    setDeletedPopup(!deletedPopup);
  };

  const handleDelete = (id) => {
    props.onDeleteClick(`${id}`);
    setDeletedPopup(true);
  };

  const [infoModal, setInfoModal] = useState(false);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

  const validation = props.members.teamMembers || props.members;

  const closePopup = () => {
    setMemberList([]);
    props.onClose();
    setSortOrder(0);
  };

  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = validation.some((x) => x._id === selectedUser._id);
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

  const selectUser = (user) => {
    setSelectedUser(user);
    setIsValidUser(true);
    setDuplicateUserAlert(false);
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
    return rolesPermission.indexOf(a.role.toLowerCase()) - rolesPermission.indexOf(b.role.toLowerCase());
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
      const groupByPermissionList = validation.reduce((acc, cur) => {
        const { role } = cur;
        if (acc[role]) {
          acc[role].push(cur);
        } else {
          acc[role] = [cur];
        }
        return acc;
      }, {});
      sortedList = Object.keys(groupByPermissionList)
        .sort((a, b) => sortByPermission({ role: a }, { role: b }))
        .flatMap((key) => groupByPermissionList[key].sort(sortByAlpha));
    } else {
      const sortByDateList = [...validation].sort((a, b) => {
        return moment(a.addDateTime).diff(moment(b.addDateTime)) * -sort;
      });

      const dataList = Object.values(
        sortByDateList.reduce((acc, cur) => {
          const date = moment(cur.addDateTime).format('MMM-DD-YY');
          if (acc[date]) {
            acc[date].push(cur);
          } else {
            acc[date] = [cur];
          }
          return acc;
        }, {})
      );

      dataList.forEach((item) => {
        sortedList.push(...item.sort(sortByAlpha));
      });
    }
    setMemberList(sortedList);
  };

  const returnUserRole = (user) => {
    const rolesArr = ['Manager', 'Mentor', 'Assistant Manager'];
    return rolesArr.includes(user.role);
  };

  const toggleOrder = useCallback(() => {
    setSortOrder((prev) => {
      if (prev !== -1) {
        return prev - 1;
      }
      return 1;
    });
  }, []);

  const [memberVisibilityState, setMemberVisibilityState] = useState({});
  const getMemberVisibility = () => {
    const teamsData = props.teamData;
    const visibility = {};
    if (teamsData && teamsData.length !== 0) {
      teamsData[0]?.members.forEach((member) => {
        visibility[member.userId] = member.visible;
      });
    }
    return visibility;
  };

  useEffect(() => {
    sortList(sortOrder);
    const newMemberVisibility = getMemberVisibility();
    setMemberVisibilityState(newMemberVisibility);
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
      <td colSpan={6} className="empty-data-message">
        There are no users on this team.
      </td>
    </tr>
  );

  // Refactor to avoid nested ternary expressions
  const renderTableBody = () => {
    if (props.fetching) {
      return (
        <tr>
          <td align="center" colSpan={6}>
            <Spinner color={`${darkMode ? 'light' : 'dark'}`} animation="border" size="sm" />
          </td>
        </tr>
      );
    } if (!memberList.length) {
      return emptyState;
    } 
      return memberList.map((user, index) => (
        <tr key={user._id}>
          <td>
            <div className={user.isActive ? 'isActive' : 'isNotActive'}>
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
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
          <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
          <td>
            <ToggleSwitch
              key={`${props.selectedTeamName}-${user._id}`}
              switchType="limit-visibility"
              userId={user._id}
              choice={memberVisibilityState[user._id]}
              UpdateTeamMembersVisibility={UpdateTeamMembersVisibility}
              aria-label={`Toggle visibility for ${user.firstName} ${user.lastName}`} // Added aria-label for accessibility
            />
          </td>
          {canAssignTeamToUsers && (
            <td>
              <Button
                color="danger"
                onClick={() => handleDelete(user._id)}
                style={darkMode ? boxStyleDark : boxStyle}
                aria-label="Delete Member"
              >
                Delete
              </Button>
            </td>
          )}
        </tr>
      ));
    
  };

  // Refactor sortOrder icon to avoid nested ternary
  const getSortIcon = () => {
    if (sortOrder === -1) {
      return <FontAwesomeIcon icon={faSortUp} />;
    } if (sortOrder === 1) {
      return <FontAwesomeIcon icon={faSortDown} />;
    } 
      return <FontAwesomeIcon icon={faSort} style={{ color: 'lightgrey' }} />;
    
  };

  // Refactor Alerts to avoid nested ternary expressions
  const renderAlerts = () => {
    if (duplicateUserAlert) {
      return <Alert color="danger">Member is already a part of this team.</Alert>;
    } if (!isValidUser) {
      return <Alert color="danger">Please choose a valid user.</Alert>;
    }
    return null;
  };

  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal
        isOpen={props.open}
        toggle={closePopup}
        autoFocus={false}
        size="lg"
        className={darkMode ? 'dark-mode text-light' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
          {`Members of ${props.selectedTeamName}`}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                existingMembers={validation}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button color="primary" onClick={onAddUser} style={darkMode ? boxStyleDark : boxStyle}>
                Add
              </Button>
            </div>
          )}

          {renderAlerts()}

          <table
            className={`table table-bordered table-responsive-xlg ${
              darkMode ? 'dark-mode text-light' : ''
            }`}
          >
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
                <th>Active</th>
                <th>#</th>
                <th>User Name</th>
                <th>
                  <button
                    type="button"
                    onClick={toggleOrder}
                    aria-label="Sort by Date Added"
                    style={{
                      cursor: 'pointer',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Date Added {getSortIcon()}
                  </button>
                </th>
                <th>
                  See All{' '}
                  <button
                    type="button"
                    onClick={toggleInfoModal}
                    aria-label="See All Information"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <i
                      data-toggle="tooltip"
                      data-placement="right"
                      title="Click for more information"
                      style={{ fontSize: 17 }}
                      aria-hidden="true"
                      className="fa fa-info-circle"
                    />
                  </button>
                </th>
                {canAssignTeamToUsers && <th />}
              </tr>
            </thead>
            <tbody>{renderTableBody()}</tbody>
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
            Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one
            drop, together we are an ocean.” Through the action you just took, this ocean is now one
            drop smaller.
          </p>
        </ModalBody>
      </Modal>
    </Container>
  );
});

export default connect(null, { hasPermission })(TeamMembersPopup);
