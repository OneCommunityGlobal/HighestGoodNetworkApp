import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { permissions } from 'utils/constants';

export const DeleteTeamPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };
  const canDeleteTeam = props.hasPermission(permissions.teams.deleteTeam);
  const canPutTeam = props.hasPermission(permissions.teams.putTeam);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Delete</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <span>
          {`Are you sure you want to delete the team with name "${props.selectedTeamName}"?
          This action cannot be undone. Switch this team to "Inactive" if you'd like to keep it in the system.`}
        </span>
      </ModalBody>
      <ModalFooter>
        {(canDeleteTeam || canPutTeam) && (
          <>
            <Button
            color="danger"
            onClick={async () => {
              await props.onDeleteClick(props.selectedTeamId);
            }}
            style={boxStyle}
            >
              Confirm
            </Button>
            <Button
              color="warning"
              onClick={async () => {
                await props.onSetInactiveClick(props.selectedTeamName, props.selectedTeamId, false, props.selectedTeamCode);
              }}
              style={boxStyle}
            >
              Set Inactive
            </Button>
          </>
        )}
        {!(canDeleteTeam || canPutTeam) && (
          <>
            Unauthorized Action
          </>
        )}
        <Button color="primary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default connect(null, { hasPermission })(DeleteTeamPopup);
