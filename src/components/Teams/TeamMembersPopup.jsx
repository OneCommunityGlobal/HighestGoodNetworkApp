import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css'
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { permissions } from 'utils/constants';
import { connect, useSelector } from 'react-redux';

export const TeamMembersPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    props.onClose();
    setSortOrder(0)
  };
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [deletedPopup, setDeletedPopup] = useState(false);
    
  const closeDeletedPopup = () => {
    setDeletedPopup(!deletedPopup);
  }

  const handleDelete = (id) => {
    props.onDeleteClick(`${id}`)
    setDeletedPopup(true);
  }

  const canAssignTeamToUsers = props.hasPermission(permissions.teams.assignTeamToUsers);



  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = props.members.teamMembers.some(x => x._id === selectedUser._id);
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

  /**
   * The function to sort the memberlist
   * @param {-1 | 0 | 1} [sort = 0]
   * -1: ascending order by date
   * 0: alphabetized order by name
   * 1: descending order by date
  */
  const sortList = (sort = 0) => {
    let sortedList = []

    if (sort === 0) {
      const groupByPermissionList = props.members?.teamMembers?.reduce((pre, cur) => {
        const role = cur.role;
        pre[role] ? pre[role].push(cur) : pre[role] = [cur]
        return pre;
      }, {}) ?? {}
      sortedList = Object.keys(groupByPermissionList)
        .sort(sortByPermission)
        .map(key => groupByPermissionList[key])
        .map(list => list.toSorted(sortByAlpha))
        .flat()
    } else {
      const sortByDateList = props.members.teamMembers.toSorted((a, b) => {
        return moment(a.addDateTime).diff(moment(b.addDateTime)) * -sort;
      });

      const dataList = Object.values(sortByDateList.reduce((pre, cur) => {
        const date = moment(cur.addDateTime).format("MMM-DD-YY");
        pre[date] ? pre[date].push(cur) : pre[date] = [cur]
        return pre;
      }, {}));

      dataList.forEach(item => {
        sortedList.push(...item.toSorted(sortByAlpha));
      });
    }
    setMemberList(sortedList);
  }

  let returnUserRole = (user) => {
    let rolesArr = ["Manager", "Mentor", "Assistant Manager"]
    if (rolesArr.includes(user.role)) return true
  }

  const sortByAlpha = useCallback((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  }, [])

  const sortByPermission = useCallback((a, b) => {
    // Sort by index
    const rolesPermission = [
      "owner",
      "administrator",
      "core team",
      "manager",
      "mentor",
      "assistant manager",
      "volunteer"
    ]
    return rolesPermission.indexOf(a.toLowerCase()) - rolesPermission.indexOf(b.toLowerCase());
  }, [])

  const icons = {
    '-1': { icon: faSortUp },
    '0': { icon: faSort, style: { color: 'lightgrey' } },
    '1': { icon: faSortDown }
  }

  const toggleOrder = useCallback(() => {
    setSortOrder((pre) => {
      if (pre !== -1) {
        return pre - 1;
      }
      return 1;
    })
  }, [])

  useEffect(() => {
    sortList(sortOrder)
  }, [props.members.teamMembers, sortOrder])

  useEffect(() => {
    setIsValidUser(true);
    setDuplicateUserAlert(false);
  }, [props.open]);

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} size='lg' className={darkMode ? 'dark-mode text-light' : ''}>
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                existingMembers={props.members.teamMembers}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button color="primary" onClick={onAddUser} style={darkMode ? boxStyleDark : boxStyle}>
                Add
              </Button>
            </div>
          )}

          {duplicateUserAlert ? (
            <Alert color="danger">Member is already a part of this team.</Alert>
          ) : isValidUser === false ? (
            <Alert color="danger">Please choose a valid user.</Alert>
          ) : (
            <></>
          )}

          <table className={`table table-bordered table-responsive-sm ${darkMode ? 'text-light' : ''}`}>
            <thead>
              <tr className={darkMode ? 'bg-space-cadet' : ''}>
                <th>Active</th>
                <th>#</th>
                <th>User Name</th>
                <th style={{ cursor: 'pointer' }} onClick={toggleOrder}>Date Added <FontAwesomeIcon {...icons[sortOrder]} /></th>
                {canAssignTeamToUsers && <th />}
              </tr>
            </thead>
            <tbody>
              {props.members.teamMembers.length > 0 &&
                memberList.toSorted().map((user, index) => {
                  return (<tr key={`team_member_${index}`} className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <td>
                      <span className={user.isActive ? "isActive" : "isNotActive"}>
                        <i className="fa fa-circle" aria-hidden="true" />
                      </span>
                    </td>
                    <td>{index + 1}</td>
                    <td>{returnUserRole(user) ? <b>{user.firstName} {user.lastName} ({user.role})</b> : <span>{user.firstName} {user.lastName} ({user.role})</span>} </td>
                    {/* <td>{user}</td> */}
                    <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
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
                  </tr>)
                })
              }
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deletedPopup} toggle={closeDeletedPopup} className={darkMode ? 'dark-mode text-light' : ''}>
        <ModalHeader toggle={closeDeletedPopup} className={`${darkMode ? 'bg-space-cadet' : ''} text-danger font-weight-bold`}>Member Deleted!</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p>Team member successfully deleted! Ryunosuke Satoro famously said, “Individually we are one drop, together we are an ocean.” Through the action you just took, this ocean is now one drop smaller.</p>
        </ModalBody>
      </Modal>
    </Container>
  );
});

export default connect(null, { hasPermission })(TeamMembersPopup);
