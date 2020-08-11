import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

const Header = () => {
  return (
    <tr>
      <th>Name</th>

    </tr>
  )
}
const TeamMembersPopup = React.memo((props) => {
  const closePopup = (e) => { props.onClose() };

  return <Modal isOpen={props.open} toggle={closePopup}>
    <ModalHeader toggle={closePopup}>Team Members</ModalHeader>
    <ModalBody style={{ textAlign: 'center' }}>
      <Header />

    </ModalBody>
    <ModalFooter>
      <Button color="secondary" onClick={closePopup}>Close</Button>
    </ModalFooter>
  </Modal>
});
export default TeamMembersPopup