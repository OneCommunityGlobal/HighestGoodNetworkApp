import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Container } from 'reactstrap';



const TeamMembersPopup = React.memo((props) => {


  const closePopup = (e) => { props.onClose() };

  debugger;
  return (<Container fluid>
    <div className='container'>
      <Modal isOpen={props.open} toggle={closePopup}>
        <ModalHeader toggle={closePopup}>Team Members</ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          <table className="table table-bordered table-responsive-sm">

            <Header />


          </table>

        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  </Container>)
});

const Header = () => {
  return (
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
    </tr>
  )
}



export default TeamMembersPopup;