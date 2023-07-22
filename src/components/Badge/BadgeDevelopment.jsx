import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import CreateNewBadgePopup from './CreateNewBadgePopup';

const BadgeDevelopment = props => {
  const [isCreateNewBadgePopupOpen, setCreateNewBadgePopupOpen] = useState(false);

  const toggle = () =>
    setCreateNewBadgePopupOpen(isCreateNewBadgePopupOpen => !isCreateNewBadgePopupOpen);

  return (
    <div>
      <Button className="btn--dark-sea-green" onClick={toggle} style={{ margin: 20 }}>
        Create New Badge
      </Button>
      <Modal isOpen={isCreateNewBadgePopupOpen} toggle={toggle} backdrop="static">
        <ModalHeader toggle={toggle}>New Badge</ModalHeader>
        <ModalBody>
          <CreateNewBadgePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      <BadgeDevelopmentTable allBadgeData={props.allBadgeData} />
    </div>
  );
};

export default BadgeDevelopment;
