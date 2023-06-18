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

  const removeUserFromTask = task => {
    const removeIndex = task.resources.map(item => item.userID).indexOf(props.userId);
    const newResources = [
      ...task.resources.slice(0, removeIndex),
      ...task.resources.slice(removeIndex + 1
        )]
    const updatedTask = {...task, resources: newResources};
    props.updateTask(task._id, updatedTask);
  }

  let modalBody;
  let modalHeader;

  {props.taskModalOption === 'Checkmark' ? 
  (modalHeader = 'Mark as Done', modalBody = 'Are you sure you want to mark this task as done?') :
  (modalHeader = 'Remove User from Task', modalBody = 'Are you sure you want to remove this user from the task?')}

  return (
    <Modal isOpen={props.isOpen} toggle={() => props.popupClose()}>
      <ModalHeader toggle={() => props.popupClose()}>{modalHeader}</ModalHeader>
      {isLoadingTask ? (
        <ModalBody>
          <p>Loading...</p>
        </ModalBody>
      ) : (
        <ModalBody>
          <p>{modalBody}</p>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                setIsLoadingTask(true);
                {props.taskModalOption === 'Checkmark' ? 
                removeTaskFromUser(props.task) : 
                removeUserFromTask(props.task)
                }
              }}
              disabled={isLoadingTask}
            >
              {modalHeader}
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
