import { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import CreateNewBadgePopup from './CreateNewBadgePopup';
import hasPermission from '../../utils/permissions';
import '../Header/DarkMode.css';

function BadgeDevelopment(props) {
  const { darkMode } = props;

  const [isCreateNewBadgePopupOpen, setCreateNewBadgePopupOpen] = useState(false);

  const toggle = () => setCreateNewBadgePopupOpen(prevIsOpen => !prevIsOpen);

  const canCreateBadge = props.hasPermission('createBadges');

  return (
    <div className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
      <Button
        className="btn--dark-sea-green"
        onClick={toggle}
        disabled={!canCreateBadge}
        style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}
      >
        Create New Badge
      </Button>
      <Modal
        isOpen={isCreateNewBadgePopupOpen}
        toggle={toggle}
        backdrop="static"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
          New Badge
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <CreateNewBadgePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      <BadgeDevelopmentTable allBadgeData={props.allBadgeData} />
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeDevelopment);
