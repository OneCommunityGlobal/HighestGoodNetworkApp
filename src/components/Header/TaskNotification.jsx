import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const TaskNotificationDebugger = ({ authUser, userTasks, darkMode }) => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = authUser?.userid;

  const milestoneStorageKeys = useMemo(() => ({
    '50%': `${userId}_50percent`,
    '75%': `${userId}_75percent`,
    '90%': `${userId}_90percent`,
    'no_estimation': `${userId}_no_estimation`,
    'over_100%': `${userId}_over_100percent`,
  }), [userId]);

  const calculateCompletionPercentage = useCallback((hoursLogged, estimatedHours) => {
    if (hoursLogged <= 0) return 0;
    if (estimatedHours <= 0) return null; // Avoid division by zero
    const percentage = (hoursLogged / estimatedHours) * 100;
    return Math.min(percentage, 100); // Cap the percentage at 100%
  }, []);

  const isTaskCompletedOrSubmitted = useCallback((task) => {
    const isCompleted = task.resources.some(
      resource => resource.userID === userId && resource.completedTask
    );
    const isUnderReview = task.relatedWorkLinks.length > 0 ||
      task.resources.some(resource => resource.userID === userId && resource.reviewStatus === 'Submitted');
    return { isCompleted, isUnderReview };
  }, [userId]);

  const hasMilestoneBeenSeen = (taskId, milestone) => {
    return localStorage.getItem(`${taskId}_${milestoneStorageKeys[milestone]}`) === 'true';
  };

  const markMilestoneAsSeen = (taskId, milestone) => {
    localStorage.setItem(`${taskId}_${milestoneStorageKeys[milestone]}`, 'true');
  };

  const resetMilestonesForTask = (taskId) => {
    Object.keys(milestoneStorageKeys).forEach((milestone) => {
      localStorage.removeItem(`${taskId}_${milestoneStorageKeys[milestone]}`);
    });
  };

  const calculateNotifications = useCallback(() => {
    if (!authUser || !userTasks?.tasks) {
      console.log("No authUser or userTasks are not available.");
      return;
    }

    const newNotifications = [];
    console.log("Starting notification calculation...");

    userTasks.tasks.forEach((task) => {
      console.log(`Checking task: ${task.taskName}`);

      // Check if task is completed or under review
      const { isCompleted, isUnderReview } = isTaskCompletedOrSubmitted(task);
      console.log(`- Is Completed: ${isCompleted}, Is Under Review: ${isUnderReview}`);

      if (isCompleted || isUnderReview) {
        console.log(`Skipping task ${task.taskName} as it is either completed or under review.`);
        return;
      }

      // Check if estimated hours have changed and reset milestones if so
      const previousEstimatedHours = parseFloat(localStorage.getItem(`${task._id}_estimatedHours`));
      if (previousEstimatedHours !== task.estimatedHours) {
        console.log(`- Estimated hours changed for task ${task.taskName} from ${previousEstimatedHours} to ${task.estimatedHours}. Resetting milestones.`);
        resetMilestonesForTask(task._id);
        localStorage.setItem(`${task._id}_estimatedHours`, task.estimatedHours);
      }

      // Calculate completion percentage
      const completionPercentage = calculateCompletionPercentage(task.hoursLogged, task.estimatedHours);
      console.log(`- Completion Percentage for ${task.taskName}: ${completionPercentage}%`);

      // Add notification if estimated hours is 0
      if (task.estimatedHours === 0 && !hasMilestoneBeenSeen(task._id, 'no_estimation')) {
        console.log(`- Adding notification for ${task.taskName} as estimated hours is 0.`);
        newNotifications.push({
          taskName: task.taskName,
          milestone: 'no_estimation',
          message: `${task.taskName}: Estimated hours are set to 0. Please consult your manager to confirm the correct estimated hours.`,
        });
        markMilestoneAsSeen(task._id, 'no_estimation');
      }

      // Check for milestone notifications (50%, 75%, 90%)
      const milestones = {
        '50%': "You've completed 50% of the task.",
        '75%': "You're at 75% completion. Keep up the good work!",
        '90%': "Almost done! You've reached 90% completion.",
      };

      Object.keys(milestones).forEach((milestone) => {
        if (completionPercentage >= parseInt(milestone) && !hasMilestoneBeenSeen(task._id, milestone)) {
          console.log(`- Adding ${milestone} notification for ${task.taskName}.`);
          newNotifications.push({
            taskName: task.taskName,
            milestone,
            message: `${task.taskName}: ${milestones[milestone]}`,
          });
          markMilestoneAsSeen(task._id, milestone);
        }
      });

      // Add notification if hoursLogged is 0
      if (task.hoursLogged === 0 && !hasMilestoneBeenSeen(task._id, '0%')) {
        console.log(`- Adding notification for ${task.taskName} as hoursLogged is 0.`);
        newNotifications.push({
          taskName: task.taskName,
          milestone: '0%',
          message: `${task.taskName}: You haven't started this task yet.`,
        });
        markMilestoneAsSeen(task._id, '0%');
      }

      // Add notification if hoursLogged exceeds estimatedHours
      if (task.hoursLogged > task.estimatedHours && !hasMilestoneBeenSeen(task._id, 'over_100%')) {
        console.log(`- Adding notification for ${task.taskName} as hoursLogged exceeded estimated hours.`);
        newNotifications.push({
          taskName: task.taskName,
          milestone: 'over_100%',
          message: `${task.taskName}: You've logged more hours than the estimated hours. Please review this with your manager if necessary.`,
        });
        markMilestoneAsSeen(task._id, 'over_100%');
      }
    });

    setNotifications(newNotifications);
    console.log("Final Notifications Array:", newNotifications); // Debugging log
  }, [authUser, userTasks, calculateCompletionPercentage, isTaskCompletedOrSubmitted]);

  useEffect(() => {
    const debounceTimeout = setTimeout(calculateNotifications, 500);
    return () => clearTimeout(debounceTimeout);
  }, [calculateNotifications]);

  const toggleModalVisibility = () => {
    setIsModalOpen((prevState) => !prevState);
    if (isModalOpen) {
      setNotifications([]); // Clear notifications when the modal is closed
    }
  };

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
      >
        <ModalHeader toggle={toggleModalVisibility}>
          Task Progress Notifications
        </ModalHeader>
        <ModalBody>
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
        <ModalFooter>
          <Button color="primary" onClick={toggleModalVisibility}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

// Map Redux state to props
const mapStateToProps = (state) => ({
  authUser: state.auth.user,
  userTasks: state.teamMemberTasks.usersWithTasks.find(user => user.personId === state.auth.user.userid),
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(TaskNotificationDebugger);