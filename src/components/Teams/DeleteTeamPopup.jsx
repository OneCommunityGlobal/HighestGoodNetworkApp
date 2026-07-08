import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.module.css';
import { connect, useSelector } from 'react-redux';
import hasPermission from '~/utils/permissions';

export const DeleteTeamPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    props.onClose();
  };
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'dark-mode text-light' : ''}
    >
      <ModalHeader toggle={closePopup} className={darkMode ? 'bg-space-cadet' : ''}>
        Delete
      </ModalHeader>
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
                await props.onSetInactiveClick(
                  props.selectedTeamName,
                  props.selectedTeamId,
                  false,
                  props.selectedTeamCode,
                );
              }}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Set Inactive
            </Button>
          </>
        )}
        {!(canDeleteTeam || canPutTeam) && <>Unauthorized Action</>}
        <Button color="primary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

DeleteTeamPopup.displayName = 'DeleteTeamPopup';

DeleteTeamPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSetInactiveClick: PropTypes.func.isRequired,
  selectedTeamName: PropTypes.string,
  selectedTeamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedTeamCode: PropTypes.string,
  hasPermission: PropTypes.func.isRequired,
};

export default connect(null, { hasPermission })(DeleteTeamPopup);
