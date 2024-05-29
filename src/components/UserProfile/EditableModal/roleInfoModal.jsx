import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const RoleInfoModal = ({ info, auth}) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const { role } = auth.user;

  console.log(role);

  const [isOpen, setOpen] = useState(false);
  const [canEditInfoModal, setCanEditInfoModal] = useState(false);
  const { infoContent, CanRead } = { ...info };
  const handleMouseOver = () => {
    setOpen(true);

    if(role === "Owner"){
      setCanEditInfoModal(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (CanRead) {
    return (
      <span>
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for user class information"
          style={{ fontSize: 24, cursor: 'pointer', color: '#00CCFF', marginLeft: '5px' }}
          aria-hidden="true"
          className="fa fa-info-circle"
          onClick={handleMouseOver}
        />
        {isOpen && (
          <Modal isOpen={isOpen} size="lg" className={darkMode ? 'text-light' : ''}>
            <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Welcome to Information Page!</ModalHeader>
            <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
              <div
                style={{ paddingLeft: '20px' }}
                dangerouslySetInnerHTML={{ __html: infoContent }}
              />
            </ModalBody>
            <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Button onClick={handleClose}>Close</Button>
            </ModalFooter>
          </Modal>
        )}
      </span>
    );
  }
  return <></>;
};

export default RoleInfoModal;
