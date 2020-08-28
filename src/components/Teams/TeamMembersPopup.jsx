/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import MembersAutoComplete from './MembersAutoComplete'
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Container,
} from 'reactstrap';

const TeamMembersPopup = React.memo((props) => {

  // const [newMember, onNewChange] = useState('');


  // const data = (props) => {
  //   return (
  //     <div>{props.usersdata.map((user) =>
  //       <li>{`${user.firstName}`}</li>

  //     )}</div>)
  // }

  const closePopup = () => { props.onClose(); };
  debugger;
  return (
    <Container fluid>
      <Modal isOpen={props.open} toggle={closePopup}>
        <ModalHeader toggle={closePopup}>Team Members</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <div className="input-group-prepend" style={{ marginBottom: '10px' }} >
            <MembersAutoComplete
              userProfileData={props.usersdata}
              suggestions={[
                "Alligator",
                "Bask",
                "Crocodilian",
                "Death Roll",
                "Eggs",
                "Jaws",
                "Reptile",
                "Solitary",
                "Tail",
                "Wetlands"
              ]}
            // dataList={props.usersdata ? props.usersdata : []}
            />

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
                      <td><Button color="danger" onClick={(e) => { props.onDeleteClick(`${user._id}`) }}>Delete</Button></td>
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
