/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Container,
} from 'reactstrap';
import MembersAutoComplete from './MembersAutoComplete';

const TeamMembersPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };
  const [selectedUser, onSelectUser] = useState(undefined);
  const onAddUser = () => { props.onAddUser(selectedUser); };
  const selectUser = (user) => {
    onSelectUser(user);
  };

  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup}>
        <ModalHeader toggle={closePopup}>Team Members</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
            <MembersAutoComplete
              userProfileData={props.usersdata}
              onAddUser={selectUser}
            />
            <Button
              color="primary"
              onClick={onAddUser}
            >
              Add
            </Button>
          </div>
          <div>
            <table className="table table-bordered table-responsive-sm">
              <thead>

                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  <th>
                    {' '}
                  </th>
                </tr>
              </thead>
              <tbody>
                {props.members.teamMembers.length > 0
                  ? props.members.teamMembers.map((user, index) => (
                    <tr>
                      <td>{index + 1}</td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td><Button color="danger" onClick={() => { props.onDeleteClick(`${user._id}`); }}>Delete</Button></td>
                    </tr>
                  )) : <></>}
              </tbody>
            </table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup}>Close</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
});

export default TeamMembersPopup;
