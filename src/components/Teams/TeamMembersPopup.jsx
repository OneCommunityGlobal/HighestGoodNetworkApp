import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';

const TeamMembersPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [memberList, setMemberList] = useState([]);

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

  useEffect(() => {
    setMemberList(props.members.teamMembers.toSorted((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    }))
  }, [props.members.teamMembers])

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup} autoFocus={false}>
        <ModalHeader toggle={closePopup}>{`Members of ${props.selectedTeamName}`}</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          {hasPermission(
            props.requestorRole,
            'assignTeamToUser',
            props.roles,
            props.userPermissions,
          ) && (
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
          {isValidUser && <Alert color="danger">Please choose a valid user.</Alert>}
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
                {props.members.teamMembers.length > 0 &&
                  memberList.toSorted().map((user, index) => (
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
                }
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

export default TeamMembersPopup;
