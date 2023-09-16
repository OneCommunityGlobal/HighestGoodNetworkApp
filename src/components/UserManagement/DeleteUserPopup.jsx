import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';
import { UserDeleteType } from '../../utils/enums';
import {
  USER_DELETE_CONFIRMATION_FIRST_LINE,
  USER_DELETE_CONFIRMATION_SECOND_LINE,
  USER_DELETE_DATA_FOREVER,
  USER_DELETE_DATA_INACTIVE,
  USER_DELETE_DATA_ARCHIVE,
  USER_DELETE_OPTION_HEADING,
} from '../../languages/en/messages';
import { CLOSE } from '../../languages/en/ui';
/**
 * Modal popup to delete the user profile
 */
const DeleteUserPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>{USER_DELETE_OPTION_HEADING}</ModalHeader>
      <ModalBody>
        <p>{USER_DELETE_CONFIRMATION_FIRST_LINE}</p>
        <p>{USER_DELETE_CONFIRMATION_SECOND_LINE}</p>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
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
  return <div style={{ padding: '5px' }} />;
});

export default DeleteUserPopup;
