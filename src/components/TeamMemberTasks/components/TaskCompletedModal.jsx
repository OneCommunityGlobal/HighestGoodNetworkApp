import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React from 'react';
import { useEffect } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { useState } from 'react';

/**
 * Modal popup to delete the user profile
 */
const TaskCompletedModal = React.memo(props => {
  const [isLoadingTask, setIsLoadingTask] = useState(true);

  const closePopup = e => {
    props.popupClose();
  };

  const loadUserTasks = async userId => {
    axios
      .get(ENDPOINTS.TASKS_BY_USERID(userId))
      .then(res => {
        props.setTasks(res?.data || []);
        setIsLoadingTask(false);
      })
      .catch(err => console.log(err));
  };

  const removeTaskFromUser = task => {
    setIsLoadingTask(true)
    const resources = [...task.resources];
    const newResources = resources?.map(resource => {
      let newResource = { ...resource };
      if (resource.userID === props.userId) {
        newResource = {
          ...resource,
          completedTask: true,
        };
      }
      return newResource;
    });

    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask, setIsLoadingTask);
  };

  useEffect(() => {
    loadUserTasks(props.userId);
  }, [props.userID, props.tasks]);

  return (
    <Modal isOpen={props.isOpen} toggle={() => props.popupClose()}>
      <ModalHeader toggle={() => props.popupClose()}>Mark as Done</ModalHeader>
      {!isLoadingTask ? (
        <ModalBody>
          <p>Are you sure you want to mark this task as done?</p>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                removeTaskFromUser(props.task);
              }}
            >
              Confirm
            </Button>
            <Button
              onClick={() => {
                props.setClickedToShowModal(false);
                props.setCurrentUserId('');
                closePopup();
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalBody>
      ) : (
        <ModalBody>
          <p>Loading...</p>
        </ModalBody>
      )}
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default TaskCompletedModal;
