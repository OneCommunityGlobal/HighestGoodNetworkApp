import { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import CustomModalHeader from 'components/common/Modal/CustomModalHeader';
import { boxStyle, boxStyleDark } from 'styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import CreateNewBadgePopup from './CreateNewBadgePopup';

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
        className={darkMode ? 'text-light' : ''}
      >
        <CustomModalHeader title="New Badge" toggle={() => toggle()} />
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <CreateNewBadgePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      <BadgeDevelopmentTable allBadgeData={props.allBadgeData} />
    </div>
  );
}

export default BadgeDevelopment;
