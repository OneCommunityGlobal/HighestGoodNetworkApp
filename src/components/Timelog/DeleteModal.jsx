import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { deleteTimeEntry } from '../../actions/timeEntries';
import {toast} from 'react-toastify';

const DeleteModal = ({ timeEntry, projectCategory, taskClassification,userProfile }) => {
  const [isOpen, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useDispatch();

  const toggle = () => setOpen(isOpen => !isOpen);

  const deleteEntry = async () => {
    setIsProcessing(true);
    try {
      await dispatch(deleteTimeEntry(timeEntry));
    } catch (error) {
      toast.error(`An error occurred while dispatching delete time entry action: ${error.message}`)
    }
    setIsProcessing(false);
    toggle();
  };

  return (
    <span>
      <FontAwesomeIcon icon={faTrashAlt} size="lg" className="mr-3 text-primary" onClick={toggle} />
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalBody>Are you sure you want to delete this entry?</ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            Cancel
          </Button>
          <Button onClick={deleteEntry} color="danger" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>
    </span>
  );
};

export default DeleteModal;
