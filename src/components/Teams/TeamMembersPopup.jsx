import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';

export const TeamMembersPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
    setSortOrder(0)
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0)

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');



  const onAddUser = () => {
    if (selectedUser && !props.members.teamMembers.some(x => x._id === selectedUser._id)) {
      props.onAddUser(selectedUser);
      setSearchText('');
    } else {
      onValidation(false);
    }
  };
  const selectUser = user => {
    onSelectUser(user);
    onValidation(true);
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
    onValidation(true);
  }, [props.open]);

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} size='lg'>
        <ModalHeader toggle={closePopup}>{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                existingMembers={props.members.teamMembers}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button color="primary" onClick={onAddUser} style={boxStyle}>
                Add
              </Button>
            </div>
          )}
          {!isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th style={{ cursor: 'pointer' }} onClick={toggleOrder}>Date Added <FontAwesomeIcon {...icons[sortOrder]} /></th>
                {canAssignTeamToUsers && <th />}
              </tr>
            </thead>
            <tbody>
              {props.members.teamMembers.length > 0 &&
                memberList.toSorted().map((user, index) => (
                  <tr key={`team_member_${index}`}>
                    <td>{index + 1}</td>
                    <td>{returnUserRole(user) ? <b>{user.firstName} {user.lastName} ({user.role})</b> : <span>{user.firstName} {user.lastName} ({user.role})</span>} </td>
                    {/* <td>{user}</td> */}
                    <td>{moment(user.addDateTime).format('MMM-DD-YY')}</td>
                    {canAssignTeamToUsers && (
                      <td>
                        <Button
                          color="danger"
                          onClick={() => props.onDeleteClick(`${user._id}`)}
                          style={boxStyle}
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup} style={boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
});

export default connect(null, { hasPermission })(TeamMembersPopup);
