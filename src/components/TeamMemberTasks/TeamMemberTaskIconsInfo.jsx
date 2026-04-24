import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import { useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from '~/styles';
import '../Header/index.module.css';
import infoTaskIconContent from './infoTaskIconContent';
import styles from './style.module.css';

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
        className={styles['team-member-task-info']}
        icon={faInfoCircle}
        title="Click this icon to learn about the task icons"
        onClick={handleModalOpen}
        color={darkMode ? 'lightgray' : ''}
      />
      <Modal
        className={darkMode ? 'text-light dark-mode' : ''}
        backdropClassName={styles['task-info-modal-backdrop']}
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

TeamMemberTaskInfo.displayName = 'TeamMemberTaskInfo';

export default TeamMemberTaskInfo;
