import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { deleteTimeEntry } from '../../actions/timeEntries';
import { updateUserProfile } from '../../actions/userProfile';
import fixDiscrepancy from 'utils/fixDiscrepancy';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import {toast} from 'react-toastify';

const DeleteModal = ({ timeEntry, projectCategory, taskClassification,userProfile}) => {
  const [isOpen, setOpen] = useState(false);
  const dispatch = useDispatch();
  const toggle = () => setOpen(isOpen => !isOpen);

  const deleteEntry = async event => {
    const { isTangible, personId, hours, minutes } = timeEntry;
    const url = ENDPOINTS.USER_PROFILE(personId);

    if (event) {
      event.preventDefault();
    }

    try {
      const { data: userProfile } = await axios.get(url);

      fixDiscrepancy(userProfile);

      const deleteTimeStatus = await dispatch(deleteTimeEntry({...timeEntry,role:userProfile?.role}));
      if(deleteTimeStatus == 403)
      {
        throw new Error ('Unauthorized to perform the action');
      }
      
      if (deleteTimeStatus != 200){
        throw new Error ('error occurred while dispatching delete time entry action');
      }

      const formattedHours = Number((parseInt(hours) + parseInt(minutes) / 60).toFixed(2));
      if (!isTangible) {
        const totalIntangibleHours = Number(
          (userProfile.totalIntangibleHrs - formattedHours).toFixed(2),
          );
          userProfile.totalIntangibleHrs = totalIntangibleHours;
        } else {
          const category = projectCategory ? projectCategory : taskClassification;
          const { hoursByCategory } = userProfile;
          hoursByCategory[category] -= formattedHours;
        }
        
        const updatedUserProfile = {
          ...userProfile,
        };

      await dispatch(updateUserProfile(updatedUserProfile));

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
