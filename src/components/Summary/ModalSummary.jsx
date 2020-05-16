/**
 * To turn the Modal Summary implementation on do the following.
 *  1 ) In the Dashboard.jsx make sure to add these:
 *
 *        import ModalSummary from '../Summary/ModalSummary';
 *
 *  2 ) Replace <Summary /> with this:
 *
 *        <ModalSummary buttonLabel="Weekly Summary" className="weekly-summary-modal" />
 *
 */

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
