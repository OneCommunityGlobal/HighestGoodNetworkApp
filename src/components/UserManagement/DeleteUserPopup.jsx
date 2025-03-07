import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import { UserDeleteType } from '../../utils/enums';
import {
  USER_DELETE_CONFIRMATION_FIRST_LINE,
  USER_DELETE_CONFIRMATION_SECOND_LINE,
  USER_DELETE_DATA_FOREVER,
  USER_DELETE_DATA_INACTIVE,
  USER_DELETE_DATA_ARCHIVE,
  USER_DELETE_OPTION_HEADING,
  USER_DELETE_CONFIRMATION_USER_NAME,
  USER_DELETE_CONFIRMATION_FIRST_LINE_CONT,
} from '../../languages/en/messages';
import hasPermission from '../../utils/permissions';
import { CLOSE } from '../../languages/en/ui';
import { boxStyle, boxStyleDark } from '../../styles';
import '../Header/DarkMode.css';

/**
 * Modal popup to delete the user profile
 */
const DeleteUserPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    props.onClose();
  };
  const canDeleteUser = props.hasPermission('deleteUserProfile');

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        {USER_DELETE_OPTION_HEADING}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          {USER_DELETE_CONFIRMATION_FIRST_LINE}
          <b>{USER_DELETE_CONFIRMATION_USER_NAME(props?.username)} </b>
          {USER_DELETE_CONFIRMATION_FIRST_LINE_CONT}
        </p>
        <p>{USER_DELETE_CONFIRMATION_SECOND_LINE}</p>
        <div style={{ textAlign: 'center', paddingTop: '10px' }}>
          {canDeleteUser && (
            <>
              <Button
                color="primary btn-danger"
                onClick={() => {
                  props.onDelete(UserDeleteType.HardDelete);
                }}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                {USER_DELETE_DATA_FOREVER}
              </Button>
              <DivSpacer />
              <Button
                color="primary btn-warning"
                onClick={() => {
                  props.onDelete(UserDeleteType.Inactive);
                }}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                {USER_DELETE_DATA_INACTIVE}
              </Button>
              <DivSpacer />
              <Button
                color="primary btn-success "
                onClick={() => {
                  props.onDelete(UserDeleteType.SoftDelete);
                }}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                {USER_DELETE_DATA_ARCHIVE}
              </Button>
            </>
          )}
          {!canDeleteUser && <>Unauthorized Action</>}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          {CLOSE}
        </Button>
      </ModalFooter>
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }} />;
});

export default connect(null, { hasPermission })(DeleteUserPopup);
