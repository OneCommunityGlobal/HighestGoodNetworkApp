import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function TimeLogConfirmationModal({ isOpen, toggleModal, onConfirm, onReject, onIntangible, darkMode }) {
    const [userChoice, setUserChoice] = useState('');

    const handleUserAction = (choice) => {
        setUserChoice(choice); 
        toggleModal();

        // Call corresponding action based on user's choice
        if (choice === 'confirmed') {
            onConfirm(); 
        } else if (choice === 'rejected') {
            onReject();
        } else if (choice === 'intangible') {
            onIntangible();
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggleModal} className={darkMode ? 'dark-mode' : ''}>
            <ModalHeader toggle={toggleModal}>HOLD ON TIGER!</ModalHeader>
            <ModalBody>
                If you are logging Intangible Time that you want converted to Tangible, you must include the reason why you didn’t use the required timer.
            </ModalBody>
            <ModalFooter>
                <Button color="success" onClick={() => handleUserAction('confirmed')} style={{ flex: 1, marginRight: '10px' }}>
                    Yep, totally did that! Please proceed.
                </Button>
                <Button color="danger" onClick={() => handleUserAction('rejected')} style={{ flex: 1, marginRight: '10px' }}>
                    Oops, didn’t do that! Take me back.
                </Button>
                <Button color="info" onClick={() => handleUserAction('intangible')} style={{ flex: 1, marginRight: '10px' }}>
                    Time is meant as Intangible. Please proceed.
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default TimeLogConfirmationModal;

