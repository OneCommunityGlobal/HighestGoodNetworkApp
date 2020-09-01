/**
 * The line below will exclude/ignore this file from Jest test coverage.
 * This is because the file is not currently being used.
 * If should be used make sure to remove the line below
 */
/* istanbul ignore file */


/**
 * To turn the Modal WeeklySummary implementation on do the following.
 *  1 ) In the Dashboard.jsx make sure to add these:
 *
 *        import ModalWeeklySummary from '../WeeklySummary/ModalWeeklySummary';
 *
 *  2 ) Replace <WeeklySummary /> with this:
 *
 *        <ModalWeeklySummary buttonLabel="Weekly Summary" className="weekly-summary-modal" />
 *
 */

import React, { useState } from 'react';
import {
  Button, Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import WeeklySummary from './WeeklySummary';

const ModalWeeklySummary = (props) => {
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
          <WeeklySummary />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ModalWeeklySummary;
