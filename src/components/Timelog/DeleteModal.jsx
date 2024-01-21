import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { deleteTimeEntry } from '../../actions/timeEntries';
import { updateUserProfile } from '../../actions/userProfile';

const DeleteModal = ({ timeEntry, userProfile, projectCategory, taskClassification }) => {
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();

  const toggle = () => setOpen(isOpen => !isOpen);

  const deleteEntry = async event => {
    if (event) {
      event.preventDefault();
    }

    dispatch(deleteTimeEntry(timeEntry));
    //update hours
    const formattedHours = parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
    if (!timeEntry.isTangible) {
      userProfile.totalIntangibleHrs -= formattedHours;
    } else {
      const category = projectCategory ? projectCategory : taskClassification;
      const { hoursByCategory } = userProfile;
      hoursByCategory[category] -= formattedHours;
    }

    const newHour = (
      userProfile.totalcommittedHours -
      timeEntry.hours -
      timeEntry.minutes / 60
    ).toFixed(2);

    const updatedUserProfile = {
      ...userProfile,
      totalcommittedHours: parseInt(newHour, 10),
    };

    dispatch(updateUserProfile(updatedUserProfile));
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
