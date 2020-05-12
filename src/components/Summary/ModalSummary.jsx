import React, { useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import Summary from './Summary';

const ModalSummary = (props) => {
  const {
    buttonLabel,
    className,
  } = props;

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <div>
      <Button className="my-5" color="danger" onClick={toggle}>{buttonLabel}</Button>
      <Modal isOpen={modal} toggle={toggle} backdrop="static" size="lg" className={className}>
        <ModalHeader toggle={toggle}>Weekly Summary</ModalHeader>
        <ModalBody>
          <Summary />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ModalSummary;
