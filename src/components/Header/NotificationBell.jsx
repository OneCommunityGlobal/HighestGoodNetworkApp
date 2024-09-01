// Version: 1.1.2 - Improved Notification Handling for Multiple Tasks and Dynamic Updates

import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

// Component for displaying task progress notifications via a notification bell
const NotificationBell = React.memo(({ authUser, usersWithTasks, darkMode }) => {
  const [notifications, setNotifications] = useState([]); // Stores current notifications to display
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls the visibility of the notification modal
  const userId = authUser.userid;

  // Define keys for each milestone to track in local storage
  const milestoneStorageKeys = {
    '0%': `${userId}_0percent`,
    '50%': `${userId}_50percent`,
    '75%': `${userId}_75percent`,
    '90%': `${userId}_90percent`,
  };

  // Function to calculate completion percentage based on logged hours and estimated hours
  const calculateCompletionPercentage = useCallback((hoursLogged, estimatedHours) => {
    if (hoursLogged < 0 || estimatedHours <= 0) return null; // Handle invalid or zero estimated hours
    if (hoursLogged === 0 && estimatedHours > 0) return '0%';
    if (hoursLogged && estimatedHours) {
      const percentage = (hoursLogged / estimatedHours) * 100;
      if (percentage >= 100) return null; // Ignore tasks that are 100% or more complete
      if (percentage >= 90) return '90%';
      if (percentage >= 75) return '75%';
      if (percentage >= 50) return '50%';
    }
    return null;
  }, []);

  // Function to check if a task is submitted or completed
  const isTaskSubmittedOrCompleted = useCallback((task) => {
    return task.resources.some(
      (resource) => resource.completedTask || resource.reviewStatus === 'Submitted'
    );
  }, []);

  // Function to check if a milestone has been seen by the user
  const hasMilestoneBeenSeen = (taskId, milestone) => {
    const key = `${taskId}_${milestoneStorageKeys[milestone]}`;
    return localStorage.getItem(key) === 'true';
  };

  // Function to mark a milestone as seen in local storage
  const markMilestoneAsSeen = (taskId, milestone) => {
    const key = `${taskId}_${milestoneStorageKeys[milestone]}`;
    localStorage.setItem(key, 'true');
  };

  // Function to calculate notifications based on task progress and milestones
  const calculateNotifications = useCallback(() => {
    if (!authUser || !usersWithTasks) return;

    const userTasks = usersWithTasks.find((user) => user.personId === authUser.userid);
    if (!userTasks || !userTasks.tasks) return;

    const newNotifications = [];

    userTasks.tasks.forEach((task) => {
      if (isTaskSubmittedOrCompleted(task)) return; // Skip tasks that are submitted or completed

      const currentPercentage = calculateCompletionPercentage(
        task.hoursLogged,
        task.estimatedHours
      );

      if (currentPercentage && !hasMilestoneBeenSeen(task._id, currentPercentage)) {
        const milestoneMessages = {
          '0%': `Hello! You haven't started on ${task.taskName} yet. Please take some time to begin when you're ready.`,
          '50%': `Well done! You've completed 50% of ${task.taskName}. Keep up the good work!`,
          '75%': `Great progress! ${task.taskName} is now 75% complete. You're doing well.`,
          '90%': `Almost there! ${task.taskName} is 90% complete. Let's finish this task successfully.`,
        };

        newNotifications.push({
          taskName: task.taskName,
          percentage: currentPercentage,
          taskId: task._id,
          message: milestoneMessages[currentPercentage],
        });

        markMilestoneAsSeen(task._id, currentPercentage); // Mark this milestone as seen
      }
    });

    setNotifications(newNotifications); // Update notifications state with new notifications
  }, [
    authUser,
    usersWithTasks,
    calculateCompletionPercentage,
    isTaskSubmittedOrCompleted,
  ]);

  // Calculate notifications whenever dependencies change
  useEffect(() => {
    calculateNotifications();
  }, [calculateNotifications, usersWithTasks]); // Add usersWithTasks to dependency array to ensure updates on task changes

  // Toggle the visibility of the notification modal and clear notifications when closed
  const toggleModalVisibility = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setNotifications([]); // Clear notifications when the modal is closed
    }
  };

  return (
    <div>
      <i
        className="fa fa-bell i-large"
        onClick={toggleModalVisibility}
        style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, .5)' }} // Default bell color
      >
        {notifications.length > 0 && (
          <i className="badge badge-pill badge-danger badge-notify">
            {notifications.length}
          </i>
        )}
        <span className="sr-only">unread messages</span>
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
                <li key={index}>{notification.message}</li>
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

// Map Redux state to props for this component
const mapStateToProps = (state) => ({
  authUser: state.auth.user,
  usersWithTasks: state.teamMemberTasks.usersWithTasks,
  darkMode: state.theme.darkMode, // Dark mode setting from global state
});

export default connect(mapStateToProps)(NotificationBell);
