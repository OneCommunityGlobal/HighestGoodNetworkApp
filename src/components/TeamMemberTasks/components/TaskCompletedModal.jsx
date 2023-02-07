import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useEffect } from 'react';

/**
 * Modal popup to delete the user profile
 */
const TaskCompletedModal = React.memo(props => {
  useEffect(() => {
    props.loadUserTasks(props.userId);
  });

  const removeOrAddTaskFromUser = (task, method) => {
    const resources = [...task.resources];
    const newResources = resources?.map(resource => {
      let newResource = { ...resource };
      if (resource.userID === props.userId) {
        if (method === 'remove') {
          newResource = {
            ...resource,
            completedTask: true,
          };
        } else if (method === 'add') {
          newResource = {
            ...resource,
            completedTask: false,
          };
        }
      }
      return newResource;
    });

    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask, method);
  };

  return (
    <Modal isOpen={props.isOpen} toggle={() => props.popupClose()}>
      <ModalHeader toggle={() => props.popupClose()}>Mark as Completed</ModalHeader>
      <ModalBody>
        <p>Are you sure you want to mark this task as Completed?</p>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              removeOrAddTaskFromUser(props.task, 'remove');
              props.submitTasks();
              props.popupClose();
            }}
          >
            Confirm
          </Button>
          <Button onClick={() => props.popupClose()}>Cancel</Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
});

const DivSpacer = React.memo(() => {
  return <div style={{ padding: '5px' }}></div>;
});

export default TaskCompletedModal;
