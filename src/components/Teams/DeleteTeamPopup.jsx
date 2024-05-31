import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css'
import { connect, useSelector } from 'react-redux';
import hasPermission from 'utils/permissions';
import { permissions } from 'utils/constants';

export const DeleteTeamPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    props.onClose();
  };
  const canDeleteTeam = props.hasPermission(permissions.teams.deleteTeam);
  const canPutTeam = props.hasPermission(permissions.teams.putTeam);

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={darkMode ? 'dark-mode text-light' : ''}>
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>Delete</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <span>
          {`Are you sure you want to delete the team with name "${props.selectedTeamName}"?
          This action cannot be undone. Switch this team to "Inactive" if you'd like to keep it in the system.`}
        </span>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {(canDeleteTeam || canPutTeam) && (
          <>
            <Button
            color="danger"
            onClick={async () => {
              await props.onDeleteClick(props.selectedTeamId);
            }}
            style={darkMode ? boxStyleDark : boxStyle}
            >
              Confirm
            </Button>
            <Button
              color="warning"
              onClick={async () => {
                await props.onSetInactiveClick(props.selectedTeamName, props.selectedTeamId, false, props.selectedTeamCode);
              }}
              style={darkMode ? boxStyleDark : boxStyle}
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
        <Button color="primary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default connect(null, { hasPermission })(DeleteTeamPopup);
