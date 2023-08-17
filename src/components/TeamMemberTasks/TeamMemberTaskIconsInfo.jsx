import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { boxStyle } from 'styles';
import './style.css';

const infoTaskIconContent = `Red Bell Icon: When clicked, this will show any task changes\n
  Green Checkmark Icon: When clicked, this will mark the task as completed\n
  X Mark Icon: When clicked, this will remove the user from that task`;

const TeamMemberTaskInfo = React.memo(() => {
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
            onClick={() => {
                handleModalOpen();
            }}
        />
        <Modal backdropClassName="task-info-modal-backdrop" isOpen={infoTaskIconModal} toggle={toggleInfoTaskIconModal}>
            <ModalHeader toggle={toggleInfoTaskIconModal}>
                Task Icons Info
            </ModalHeader>
            <ModalBody>
                {infoTaskIconContent.split('\n').map((item, i) => (
                <p key={i}>{item}</p>
                ))}
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={toggleInfoTaskIconModal}
                    color="secondary"
                    className="float-left"
                    style={boxStyle}
                    >
                    {' '}
                    Ok{' '}
                </Button>
            </ModalFooter>
        </Modal>
        </>
    )
});

export default TeamMemberTaskInfo;
