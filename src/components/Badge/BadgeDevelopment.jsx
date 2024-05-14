import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import CreateNewBadgePopup from './CreateNewBadgePopup';
import '../Header/DarkMode.css';

function BadgeDevelopment(props) {
  const { darkMode } = props;

  const [isCreateNewBadgePopupOpen, setCreateNewBadgePopupOpen] = useState(false);

  const toggle = () => setCreateNewBadgePopupOpen(prevIsOpen => !prevIsOpen);

  return (
    <div className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
      <Button
        className="btn--dark-sea-green"
        onClick={toggle}
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

export default BadgeDevelopment;
