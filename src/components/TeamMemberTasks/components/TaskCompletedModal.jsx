import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React from 'react';
import { boxStyle } from 'styles';
import { useState } from 'react';

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
    const newResources = task.resources.filter(item => item.userID !== props.userId);
    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask);
  };

  let isCheckmark = props.taskModalOption === 'Checkmark';
  let modalHeader = isCheckmark ? 'Mark as Done' : 'Remove User from Task';
  let modalBody = isCheckmark
    ? 'Are you sure you want to mark this task as done?'
    : 'Are you sure you want to remove this user from the task?';

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
                {
                  props.taskModalOption === 'Checkmark'
                    ? removeTaskFromUser(props.task)
                    : removeUserFromTask(props.task);
                }
              }}
              disabled={isLoadingTask}
              style={boxStyle}
            >
              {modalHeader}
            </Button>
            <Button
              onClick={() => {
                closeFunction();
              }}
              style={boxStyle}
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
