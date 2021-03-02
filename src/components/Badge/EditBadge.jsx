import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import EditBadgeTable from './EditBadgeTable';
import CreateNewBadge from './CreateNewBadge';

const EditBadge = (props) => {

  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <div>
      <Button className="btn--dark-sea-green" onClick={toggle} style={{ margin: 20 }}>Create New Badge</Button>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>New Badge</ModalHeader>
        <ModalBody><CreateNewBadge toggle={toggle} /></ModalBody>
      </Modal>
      <EditBadgeTable allBadgeData={props.allBadgeData} />
    </div >
  );
}



export default EditBadge;
