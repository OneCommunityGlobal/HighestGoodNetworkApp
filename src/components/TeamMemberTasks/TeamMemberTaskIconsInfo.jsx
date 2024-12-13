import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { boxStyle, boxStyleDark } from 'styles';
import './style.css';
import '../Header/DarkMode.css';
import { useSelector } from 'react-redux';
import { infoTaskIconContent } from './infoTaskIconContent';

const TeamMemberTaskInfo = React.memo(() => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [infoTaskIconModal, setInfoTaskIconModal] = useState(false);

  const toggleInfoTaskIconModal = () => {
    setInfoTaskIconModal(!infoTaskIconModal);
  };

  const handleModalOpen = () => {
    setInfoTaskIconModal(true);
  };

  return (
    <>
      <FontAwesomeIcon
        className="team-member-task-info"
        icon={faInfoCircle}
        title="Click this icon to learn about the task icons"
        onClick={handleModalOpen}
        color={darkMode ? 'lightgray' : ''}
      />
      <Modal
        className={darkMode ? 'text-light dark-mode' : ''}
        backdropClassName="task-info-modal-backdrop"
        isOpen={infoTaskIconModal}
        toggle={toggleInfoTaskIconModal}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggleInfoTaskIconModal}>
          Task Icons Info
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{infoTaskIconContent}</ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            onClick={toggleInfoTaskIconModal}
            color="secondary"
            className="float-left"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
});

export default TeamMemberTaskInfo;
