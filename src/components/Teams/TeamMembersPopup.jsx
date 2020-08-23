/* eslint-disable react/prop-types */
import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Container,
} from 'reactstrap';

const TeamMembersPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };
  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup}>
        <ModalHeader toggle={closePopup}>Team Members</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
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
                    <td><Button color="danger">Delete</Button></td>
                  </tr>
                ))
                : <></>}
            </tbody>
          </table>

        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup}>Close</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
});

export default TeamMembersPopup;
