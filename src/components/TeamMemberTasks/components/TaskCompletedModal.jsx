import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React, { useState } from 'react';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../Header/DarkMode.css';
import { toast } from 'react-toastify';
import '../../Header/DarkMode.css';

const TaskCompletedModal = React.memo(props => {
  const { darkMode } = props;

  const closeFunction = () => {
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

    if (props.setUpdatedTasks) {
      props.setUpdatedTasks(prevTasks =>
        prevTasks.map(t => (t._id === task._id ? updatedTask : t)),
      );
    }
  };

  const removeUserFromTask = task => {
    const newResources = task.resources.filter(item => item.userID !== props.userId);
    const updatedTask = { ...task, resources: newResources };
    props.updateTask(task._id, updatedTask);
    props.setUpdatedTasks([]);
    toast.success('User has been removed from the task successfully.');
  };

  const handleClick = () => {
    const { scrollY } = window; // Save scroll position
    closeFunction();

    if (props.taskModalOption === 'Checkmark') {
      removeTaskFromUser(props.task);
    } else {
      removeUserFromTask(props.task);
    }

    window.scrollTo(0, scrollY);
  };

  const isCheckmark = props.taskModalOption === 'Checkmark';
  const modalHeader = isCheckmark ? 'Mark as Done' : 'Remove User from Task';
  const modalBody = isCheckmark
    ? 'Are you sure you want to mark this task as done?'
    : 'Are you sure you want to remove this user from the task?';

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={() => props.popupClose()}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader toggle={() => props.popupClose()} className={darkMode ? 'bg-space-cadet' : ''}>
        {modalHeader}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>{modalBody}</p>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="primary" onClick={handleClick} style={darkMode ? boxStyleDark : boxStyle}>
            {modalHeader}
          </Button>
          <Button
            onClick={() => {
              closeFunction();
            }}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
});

export default TaskCompletedModal;
