import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { boxStyleDark, boxStyle } from '../../../styles';
import '../../Header/DarkMode.css';

function TaskChangeLogFallback({ isOpen, toggle, task, taskNotifications, darkMode }) {
  return (
    <Modal
      className={darkMode ? 'text-light dark-mode' : ''}
      size="lg"
      isOpen={isOpen}
      toggle={toggle}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
        Task Change History - {task?.taskName}
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Alert color="info">
          <h5>🔧 Backend Integration Required</h5>
          <p>
            The individual change tracking feature requires the new backend API to be deployed.
            Currently showing fallback mode with notification-based data.
          </p>

          <h6>What this feature will provide:</h6>
          <ul>
            <li>
              ✅ <strong>Individual change rows</strong> - Each modification gets its own entry
            </li>
            <li>
              ✅ <strong>User attribution</strong> - See who made each change
            </li>
            <li>
              ✅ <strong>Detailed timestamps</strong> - Exact time each change was made
            </li>
            <li>
              ✅ <strong>Change descriptions</strong> - Clear before/after values
            </li>
            <li>
              ✅ <strong>User profiles</strong> - Profile pictures and email addresses
            </li>
            <li>
              ✅ <strong>Change categorization</strong> - Color-coded change types
            </li>
            <li>
              ✅ <strong>Pagination</strong> - Handle large change histories
            </li>
          </ul>

          <h6>Current notification data available:</h6>
          {taskNotifications && taskNotifications.length > 0 ? (
            <div
              className="mt-3 p-3"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' }}
            >
              <p>
                <strong>Cumulative changes detected:</strong>
              </p>
              <ul>
                {taskNotifications.map(notification => (
                  <li key={notification._id || notification.timestamp || Math.random()}>
                    Notification from{' '}
                    {notification.createdAt || notification.timestamp || 'unknown time'}
                    {notification.oldTask && (
                      <ul>
                        <li>Old task name: {notification.oldTask.taskName || 'Not set'}</li>
                        <li>Old priority: {notification.oldTask.priority || 'Not set'}</li>
                        <li>Old status: {notification.oldTask.status || 'Not set'}</li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>
              <em>No notification data available for this task.</em>
            </p>
          )}
        </Alert>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default TaskChangeLogFallback;
