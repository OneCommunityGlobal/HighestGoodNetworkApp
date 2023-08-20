import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
import hasPermission from 'utils/permissions';
import { boxStyle } from 'styles';

const TeamMembersPopup = React.memo(props => {
  // debugger;
  const closePopup = () => {
    props.onClose();
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [duplicateUserAlert, setDuplicateUserAlert] = useState(false);

  const onAddUser = () => {
    if (selectedUser) {
      const isDuplicate = props.members.teamMembers.some(x => x._id === selectedUser._id);
      if (!isDuplicate) {
        props.onAddUser(selectedUser);
        setSearchText('');
        setDuplicateUserAlert(false);
      } else {
        setDuplicateUserAlert(true);
      }
    } else {
      onValidation(false);
    }
  };
  const selectUser = user => {
    onSelectUser(user);
    onValidation(true);
    setDuplicateUserAlert(false);
  };

  useEffect(() => {
    onValidation(true);
    setDuplicateUserAlert(false);
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
          {duplicateUserAlert ? (
            <Alert color="danger">Member is already a part of this team.</Alert>
          ) : isValidUser === false ? (
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

export default TeamMembersPopup;
