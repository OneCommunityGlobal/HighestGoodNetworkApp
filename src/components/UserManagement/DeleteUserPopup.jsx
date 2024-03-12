import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { UserDeleteType } from '../../utils/enums';
import {
  USER_DELETE_CONFIRMATION_FIRST_LINE,
  USER_DELETE_CONFIRMATION_SECOND_LINE,
  USER_DELETE_DATA_FOREVER,
  USER_DELETE_DATA_INACTIVE,
  USER_DELETE_DATA_ARCHIVE,
  USER_DELETE_OPTION_HEADING,
  USER_DELETE_CONFIRMATION_USER_NAME,
  USER_DELETE_CONFIRMATION_FIRST_LINE_CONT
} from '../../languages/en/messages';
import { CLOSE } from '../../languages/en/ui';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import { permissions } from 'utils/constants';

/**
 * Modal popup to delete the user profile
 */
const DeleteUserPopup = React.memo(props => {
  const closePopup = e => {
    props.onClose();
  };
  const canDeleteUser = props.hasPermission(permissions.userManagement.deleteUserProfile);

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>{USER_DELETE_OPTION_HEADING}</ModalHeader>
      <ModalBody>
        <p>
          {USER_DELETE_CONFIRMATION_FIRST_LINE}
          <b>{USER_DELETE_CONFIRMATION_USER_NAME(props?.username)} </b>
          {USER_DELETE_CONFIRMATION_FIRST_LINE_CONT}
        </p>
        <p>{USER_DELETE_CONFIRMATION_SECOND_LINE}</p>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          {(canDeleteUser) && (
            <>
              <Button
                color="primary btn-danger"
                onClick={() => {
                  props.onDelete(UserDeleteType.HardDelete);
                }}
                style={boxStyle}
              >
                {USER_DELETE_DATA_FOREVER}
              </Button>
              <DivSpacer />
              <Button
                color="primary btn-warning"
                onClick={() => {
                  props.onDelete(UserDeleteType.Inactive);
                }}
                style={boxStyle}
              >
                {USER_DELETE_DATA_INACTIVE}
              </Button>
              <DivSpacer />
              <Button
                color="primary btn-success "
                onClick={() => {
                  props.onDelete(UserDeleteType.SoftDelete);
                }}
                style={boxStyle}
              >
                {USER_DELETE_DATA_ARCHIVE}
              </Button>
            </>
          )}
          {!(canDeleteUser) && (
            <>
              Unauthorized Action
            </>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          {CLOSE}
        </Button>
      </ModalFooter>
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default connect(null, { hasPermission })(DeleteUserPopup);
