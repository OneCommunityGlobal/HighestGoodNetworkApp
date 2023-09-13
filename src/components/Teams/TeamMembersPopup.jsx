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
    setSortOrder(0);
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [memberList, setMemberList] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);

  const canAssignTeamToUsers = props.hasPermission('assignTeamToUsers');

  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = props.members.teamMembers.some(x => x._id === selectedUser._id);
      if (!isDuplicate) {
        props.onAddUser(selectedUser);
        setSearchText('');
      } else {
        setSearchText('');
      }
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
    let sortedList = [];

    if (sort === 0) {
      sortedList = props.members.teamMembers.toSorted(sortByAlpha);
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

  const sortByAlpha = useCallback((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

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
  });

  useEffect(() => {
    sortList(sortOrder);
  }, [props.members.teamMembers, sortOrder]);

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false} size="lg">
        <ModalHeader toggle={closePopup}>{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          {canAssignTeamToUsers && (
            <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
              <MembersAutoComplete
                userProfileData={props.usersdata}
                onAddUser={selectUser}
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button color="primary" onClick={onAddUser} style={boxStyle}>
                Add
              </Button>
            </div>
          )}
          {isValidUser === false ? (
            <Alert color="danger">Please choose a valid user.</Alert>
          ) : (
            <></>
          )}
          <div>
            <table className="table table-bordered table-responsive-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  {hasPermission(
                    props.requestorRole,
                    'assignTeamToUser',
                    props.roles,
                    props.userPermissions,
                  ) && <th> </th>}
                </tr>
              </thead>
              <tbody>
                {props.members.teamMembers.length > 0 ? (
                  props.members.teamMembers.map((user, index) => (
                    <tr key={`team_member_${index}`}>
                      <td>{index + 1}</td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      {hasPermission(
                        props.requestorRole,
                        'assignTeamToUser',
                        props.roles,
                        props.userPermissions,
                      ) && (
                        <td>
                          <Button
                            color="danger"
                            onClick={() => {
                              props.onDeleteClick(`${user._id}`);
                            }}
                            style={boxStyle}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>
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
