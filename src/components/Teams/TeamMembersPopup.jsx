/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Container, Alert } from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';
import hasPermission from 'utils/permissions';

const TeamMembersPopup = React.memo(props => {
  // debugger;
  const closePopup = () => {
    props.onClose();
  };
  const [selectedUser, onSelectUser] = useState(undefined);
  const [isValidUser, onValidation] = useState(true);
  const [searchText, setSearchText] = useState('');

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
    onValidation(true);
  }, [props.open]);

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup}>
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
              <Button color="primary" onClick={onAddUser}>
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
          <Button color="secondary" onClick={closePopup}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
});

export default TeamMembersPopup;
