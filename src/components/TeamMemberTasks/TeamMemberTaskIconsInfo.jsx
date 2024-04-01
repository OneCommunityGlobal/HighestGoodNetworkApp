import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { boxStyle } from 'styles';
import './style.css';
import { infoTaskIconContent } from './infoTaskIconContent';
import { useSelector } from 'react-redux';

const TeamMemberTaskInfo = React.memo(() => {
    const darkMode = useSelector(state => state.theme.darkMode)
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
            color={darkMode ? 'grey' : ''}
        />
        <Modal backdropClassName="task-info-modal-backdrop" isOpen={infoTaskIconModal} toggle={toggleInfoTaskIconModal}>
            <ModalHeader toggle={toggleInfoTaskIconModal}>
                Task Icons Info
            </ModalHeader>
            <ModalBody>
                {infoTaskIconContent}
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={toggleInfoTaskIconModal}
                    color="secondary"
                    className="float-left"
                    style={boxStyle}
                >
                    Ok
                </Button>
            </ModalFooter>
        </Modal>
        </>
    )
});

export default TeamMemberTaskInfo;
