// Version: 1.3.0

import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

// Component for displaying task progress notifications via a notification bell
const NotificationBell = React.memo(({ authUser, usersWithTasks, darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = authUser.userid;

  // Milestone keys for tracking progress in local storage
  const milestoneStorageKeys = {
    '0%': `${userId}_0percent`,
    '50%': `${userId}_50percent`,
    '75%': `${userId}_75percent`,
    '90%': `${userId}_90percent`,
    '100%': `${userId}_100percent`,
  };

  // Calculate completion percentage based on logged and estimated hours
  const calculateCompletionPercentage = useCallback((hoursLogged, estimatedHours) => {
    if (hoursLogged < 0 || estimatedHours <= 0) return null;
    const percentage = (hoursLogged / estimatedHours) * 100;
    if (percentage >= 100) return '100%';
    if (percentage >= 90) return '90%';
    if (percentage >= 75) return '75%';
    if (percentage >= 50) return '50%';
    if (hoursLogged === 0) return '0%';
    return null;
  }, []);

  // Check if a task is either completed or submitted
  const isTaskSubmittedOrCompleted = useCallback((task) => {
    return task.resources.some(
      (resource) => resource.completedTask || resource.reviewStatus === 'Submitted'
    );
  }, []);

  // Check if the user has already seen the milestone
  const hasMilestoneBeenSeen = (taskId, milestone) => {
    return localStorage.getItem(`${taskId}_${milestoneStorageKeys[milestone]}`) === 'true';
  };

  // Mark a milestone as seen in local storage
  const markMilestoneAsSeen = (taskId, milestone) => {
    localStorage.setItem(`${taskId}_${milestoneStorageKeys[milestone]}`, 'true');
  };

  // Reset milestones when estimated hours change
  const resetMilestonesForTask = (taskId) => {
    Object.keys(milestoneStorageKeys).forEach((milestone) => {
      localStorage.removeItem(`${taskId}_${milestoneStorageKeys[milestone]}`);
    });
  };

  // Calculate notifications based on task progress and milestones
  const calculateNotifications = useCallback(() => {
    if (!authUser || !usersWithTasks) return;

    const userTasks = usersWithTasks.find((user) => user.personId === userId);
    if (!userTasks?.tasks) return;

    const newNotifications = [];
    userTasks.tasks.forEach((task) => {
      if (isTaskSubmittedOrCompleted(task)) return;

      const previousEstimatedHours = parseFloat(
        localStorage.getItem(`${task._id}_estimatedHours`)
      );
      if (previousEstimatedHours !== task.estimatedHours) {
        resetMilestonesForTask(task._id);
        localStorage.setItem(`${task._id}_estimatedHours`, task.estimatedHours);
      }

      const currentPercentage = calculateCompletionPercentage(
        task.hoursLogged,
        task.estimatedHours
      );
      if (currentPercentage && !hasMilestoneBeenSeen(task._id, currentPercentage)) {
        const milestoneMessages = {
          '0%': `Hello! You haven't started on ${task.taskName} yet.`,
          '50%': `Well done! You've completed 50% of ${task.taskName}.`,
          '75%': `Great progress! ${task.taskName} is now 75% complete.`,
          '90%': `Almost there! ${task.taskName} is 90% complete.`,
          '100%': `Congratulations! You've completed ${task.taskName}. Fantastic job!`,
        };

        newNotifications.push({
          taskName: task.taskName,
          percentage: currentPercentage,
          taskId: task._id,
          message: milestoneMessages[currentPercentage],
        });

        markMilestoneAsSeen(task._id, currentPercentage);
      }
    });

    setNotifications(newNotifications);
  }, [
    authUser,
    usersWithTasks,
    calculateCompletionPercentage,
    isTaskSubmittedOrCompleted,
  ]);

  // Debounce notification calculation to prevent rapid updates
  useEffect(() => {
    const debounceTimeout = setTimeout(calculateNotifications, 300);
    return () => clearTimeout(debounceTimeout);
  }, [calculateNotifications, usersWithTasks]);

  // Toggle notification modal visibility
  const toggleModalVisibility = () => {
    setIsModalOpen((prevState) => !prevState);
    if (isModalOpen) {
      setNotifications([]); // Clear notifications when the modal is closed
    }
  };

  // Handle dark mode re-rendering for modal consistency
  useEffect(() => {
    if (isModalOpen) {
      setIsModalOpen(false);
      setTimeout(() => setIsModalOpen(true), 0);
    }
  }, [darkMode]);

  return (
    <div>
      <i
        className="fa fa-bell i-large"
        onClick={toggleModalVisibility}
        style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, .5)' }}
        aria-label="Notification Bell"
      >
        {notifications.length > 0 && (
          <i className="badge badge-pill badge-danger badge-notify">
            {notifications.length}
          </i>
        )}
      </i>

      <Modal
        isOpen={isModalOpen}
        toggle={toggleModalVisibility}
        className={darkMode ? 'dark-modal' : ''}
        contentClassName={darkMode ? 'bg-yinmn-blue text-light' : ''}
      >
        <ModalHeader
          toggle={toggleModalVisibility}
          className={darkMode ? 'bg-space-cadet text-light' : ''}
        >
          Task Progress Notifications
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
          {notifications.length === 0 ? (
            <p>No new notifications available.</p>
          ) : (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index}>
                  {notification.message.length > 200
                    ? `${notification.message.substring(0, 200)}...`
                    : notification.message}
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-space-cadet text-light' : ''}>
          <Button color="primary" onClick={toggleModalVisibility}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});

// Map Redux state to props
const mapStateToProps = (state) => ({
  authUser: state.auth.user,
  usersWithTasks: state.teamMemberTasks.usersWithTasks,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(NotificationBell);