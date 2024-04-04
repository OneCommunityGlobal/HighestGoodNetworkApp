import React, { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const RoleInfoModal = ({ info }) => {
  const [isOpen, setOpen] = useState(false);
  const { infoContent, CanRead } = { ...info };
  const handleMouseOver = () => {
    setOpen(true);
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
          <Modal isOpen={isOpen} size="lg">
            <ModalHeader>Welcome to Information Page!</ModalHeader>
            <ModalBody>
              <div
                style={{ paddingLeft: '20px' }}
                dangerouslySetInnerHTML={{ __html: infoContent }}
              />
            </ModalBody>
            <ModalFooter>
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
