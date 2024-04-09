import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { deleteTimeEntry } from '../../actions/timeEntries';
import {toast} from 'react-toastify';

const DeleteModal = ({ timeEntry }) => {
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();

  const toggle = () => setOpen(isOpen => !isOpen);

  const deleteEntry = async () => {
    try {
      const deleteTimeStatus = dispatch(deleteTimeEntry(timeEntry));
      if (deleteTimeStatus != 200){
        throw new Error ('error occurred while dispatching delete time entry action');
      }
    } catch (err) {
      toast.error(`Sorry an error occured: ${err.message}`)
    }
  };

  return (
    <span>
      <FontAwesomeIcon icon={faTrashAlt} size="lg" className="mr-3 text-primary" onClick={toggle} />
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalBody>Are you sure you want to delete this entry?</ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            {' '}
            Cancel{' '}
          </Button>
          <Button onClick={deleteEntry} color="danger">
            {' '}
            Delete{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </span>
  );
};

export default DeleteModal;
