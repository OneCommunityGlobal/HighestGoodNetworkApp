import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React from 'react';
import { useState } from 'react';

/**
 * Modal popup to delete the user profile
 */
const TaskCompletedModal = React.memo(props => {
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const closeFunction = e => {
    props.setClickedToShowModal(false);
    props.setCurrentUserId('');
    props.popupClose();
  };

  const removeTaskFromUser = task => {
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
    props.updateTask(task._id, updatedTask);
  };

  return (
    <Modal isOpen={props.isOpen} toggle={() => props.popupClose()}>
      <ModalHeader toggle={() => props.popupClose()}>Mark as Done</ModalHeader>
      {isLoadingTask ? (
        <ModalBody>
          <p>Loading...</p>
        </ModalBody>
      ) : (
        <ModalBody>
          <p>Are you sure you want to mark this task as done?</p>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                setIsLoadingTask(true);
                removeTaskFromUser(props.task);
              }}
              disabled={isLoadingTask}
            >
              Mark as Done
            </Button>
            <Button
              onClick={() => {
                closeFunction()
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalBody>
      )}
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default TaskCompletedModal;
