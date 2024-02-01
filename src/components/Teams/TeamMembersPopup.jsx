import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import MembersAutoComplete from './MembersAutoComplete';
// NEW CODE

import ToggleSwitch from './ToggleSwitch/ToggleSwitch';
import InfoModal from './InfoModal';

export const TeamMembersPopup = React.memo(props => {
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isValidUser, setIsValidUser] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  // NEW CODE
  const [teamVisibility, setTeamVisibility] = useState([]);
  const [infoModal, setInfoModal] = useState(false);
  //
  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

 
  const closePopup = () => {
    props.onClose();
    setSortOrder(0);
  };
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
        props.members?.teamMembers?.reduce((pre, cur) => {
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
      const sortByDateList = props.members.teamMembers.toSorted((a, b) => {
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

  useEffect(() => {
    sortList(sortOrder);
  }, [props.members.teamMembers, sortOrder]);

  useEffect(() => {
    setIsValidUser(true);
    setDuplicateUserAlert(false);
    setTeamVisibility(props.teamData);
  }, [props.open]);

  // NEW CODE
  useEffect(() => {
    setTeamVisibility(props.teamData);
  }, [props.teamData]);

  // call the handler to update the team member's visibility
  const UpdateTeamMembersVisiblity = (userId, choice) => {
    props.onUpdateTeamMemberVisiblity(userId, choice);
  };

  const toggleInfoModal = () => {
    setInfoModal(!infoModal);
  };
  //

  return (
    <Container fluid>
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />

      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} size="lg">
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

          {duplicateUserAlert ? (
            <Alert color="danger">Member is already a part of this team.</Alert>
          ) : isValidUser === false ? (
            <Alert color="danger">Please choose a valid user.</Alert>
          ) : (
            <></>
          )}

          <table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th>Active</th>
                <th>#</th>
                <th>User Name</th>
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
              {props.members.teamMembers.length > 0 &&
                memberList.toSorted().map((user, index) => {
                  return (
                    <tr key={`team_member_${index}`}>
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
                          switchType="limit-visiblity"
                          userId={user._id}
                          choice={
                            teamVisibility[0]?.members.find(member => member.userId === user._id)
                              ?.visible
                          }
                          UpdateTeamMembersVisiblity={UpdateTeamMembersVisiblity}
                        />
                      </td>
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
                  );
                })}
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
