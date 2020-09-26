import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter, Input,
} from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';

const AddTeamPopup = React.memo((props) => {
  const closePopup = () => { props.onClose(); };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Team </ModalHeader>
      <ModalBody style={{ textAlign: 'center', display: 'flex' }}>

        <AddTeamsAutoComplete
          teamsData={props.teamsData} />
        <Button color='primary' style={{ marginLeft: '5px' }}>Confirm</Button>

      </ModalBody>
      <ModalFooter>

        <Button color="secondary" onClick={closePopup}>Close</Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddTeamPopup;
