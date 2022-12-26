import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import AddTeamsAutoComplete from './AddTeamsAutoComplete';

const AddTeamPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };

  const [selectedTeam, onSelectTeam] = useState(undefined);
  const [isValidTeam, onValidation] = useState(true);

  const onAssignTeam = () => {
    if (selectedTeam && !props.userTeamsById.some(x => x._id === selectedTeam._id)) {
      props.onSelectAssignTeam(selectedTeam);
      onSelectTeam(undefined);
    } else {
      onValidation(false);
    }
  };
  const selectTeam = team => {
    onSelectTeam(team);
    onValidation(true);
  };

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add Team </ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
          <AddTeamsAutoComplete
            teamsData={props.teamsData}
            onDropDownSelect={selectTeam}
            selectedTeam={selectedTeam}
          />
          <Button color="primary" style={{ marginLeft: '5px' }} onClick={onAssignTeam}>
            Confirm
          </Button>
        </div>
        <div>
          {!isValidTeam && selectedTeam && (
            <Alert color="danger">Great idea, but they already have that one! Pick another!</Alert>
          )}
          {!isValidTeam && !selectedTeam && (
            <Alert color="danger">Hey, You need to pick a team first!</Alert>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddTeamPopup;
