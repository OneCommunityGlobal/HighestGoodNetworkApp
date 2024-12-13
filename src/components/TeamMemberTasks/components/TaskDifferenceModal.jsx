import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyleDark, boxStyle } from 'styles';
import DiffedText from './DiffedText';
import '../../Header/DarkMode.css';

export const resourcesToString = resources => {
  if (!resources) {
    return '';
  }
  const namesString = resources.reduce((acc, resource) => `${acc},${resource.name}`, '');
  const trimmed = namesString.replace(/(^,)|(,$)/g, '');
  return trimmed;
};

export const booleanToString = bool => {
  if (bool == null) {
    return '';
  }
  return bool ? 'Yes' : 'No';
};

export const numberToString = num => {
  if (num == null) {
    return '';
  }
  return num.toString();
};

export const arrayToString = arr => {
  if (arr == null) {
    return '';
  }
  return arr.reduce((acc, ele) => `${acc}\n${ele}`, '').trim();
};

export const trimParagraphTags = str => {
  if (str == null) {
    return '';
  }
  return str.replace(/(<p[^>]+?>|<p>|<\/p>)/gim, '');
};

export const datetimeToDate = datetime => {
  if (datetime == null) {
    return '';
  }
  const date = new Date(datetime);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  return `${month}/${day}/${year}`;
};

export function TaskDifferenceModal({
  taskNotifications,
  task,
  onApprove,
  userId,
  isOpen,
  toggle,
  loggedInUserId,
  darkMode,
}) {
  return (
    <Modal
      className={darkMode ? 'text-light dark-mode' : ''}
      size="xl"
      isOpen={isOpen}
      toggle={() => toggle(undefined, [])}
    >
      <ModalHeader
        className={darkMode ? 'bg-space-cadet' : ''}
        toggle={() => toggle(undefined, [])}
      >
        Task Info Changes
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        {taskNotifications &&
          taskNotifications.map(
            taskNotification =>
              taskNotification.userId === userId && (
                <div key={taskNotification.taskId} style={{ textAlign: 'center' }}>
                  <div>
                    <span style={{ color: darkMode ? 'white' : 'black', fontWeight: 'bold' }}>
                      {darkMode ? 'White' : 'Black'} Bold = No Changes
                    </span>
                    <span
                      style={{
                        color: 'red',
                        textDecorationLine: 'line-through',
                        marginLeft: '30px',
                      }}
                    >
                      Red Strikethrough = Deleted
                    </span>
                    <span style={{ color: 'green', marginLeft: '30px' }}>Green = Added</span>
                  </div>
                  <table className={`table table-bordered ${darkMode ? 'text-light' : ''}`}>
                    <tbody>
                      <tr>
                        <td data-tip="WBS ID">WBS #</td>
                        <td>{task.num}</td>
                      </tr>
                      <tr>
                        <td>Task Name</td>
                        <td>
                          <DiffedText
                            oldText={taskNotification.oldTask?.taskName}
                            newText={task.taskName}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Priority</td>
                        <td>
                          <DiffedText
                            oldText={taskNotification.oldTask?.priority}
                            newText={task.priority}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Resources</td>
                        <td>
                          <DiffedText
                            oldText={resourcesToString(taskNotification.oldTask?.resources)}
                            newText={resourcesToString(task.resources)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Assigned</td>
                        <td>
                          <DiffedText
                            oldText={booleanToString(taskNotification.oldTask?.isAssigned)}
                            newText={booleanToString(task.isAssigned)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Status</td>
                        <td>
                          <DiffedText
                            oldText={taskNotification.oldTask?.status}
                            newText={task.status}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td data-tip="Hours - Best-case">Hours - Best-case</td>
                        <td data-tip="Hours - Best-case">
                          <DiffedText
                            oldText={numberToString(taskNotification.oldTask?.hoursBest)}
                            newText={numberToString(task.hoursBest)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td data-tip="Hours - Worst-case">Hours - Worst-case</td>
                        <td data-tip="Hours - Worst-case">
                          <DiffedText
                            oldText={numberToString(taskNotification.oldTask?.hoursWorst)}
                            newText={numberToString(task.hoursWorst)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td data-tip="Hours - Most-case">Hours - Most-case</td>
                        <td data-tip="Hours - Most-case">
                          <DiffedText
                            oldText={numberToString(taskNotification.oldTask?.hoursMost)}
                            newText={numberToString(task.hoursMost)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td data-tip="Estimated Hours">Estimated Hours</td>
                        <td data-tip="Estimated Hours">
                          <DiffedText
                            oldText={numberToString(taskNotification.oldTask?.estimatedHours)}
                            newText={numberToString(task.estimatedHours)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Links</td>
                        <td>
                          <DiffedText
                            oldText={arrayToString(taskNotification.oldTask?.links)}
                            newText={arrayToString(task.links)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Classification</td>
                        <td>
                          <DiffedText
                            oldText={taskNotification.oldTask?.classification}
                            newText={task.classification}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Why this Task is Important</td>
                        <td>
                          <DiffedText
                            oldText={trimParagraphTags(taskNotification.oldTask?.whyInfo)}
                            newText={trimParagraphTags(task.whyInfo)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Design Intent</td>
                        <td>
                          <DiffedText
                            oldText={trimParagraphTags(taskNotification.oldTask?.intentInfo)}
                            newText={trimParagraphTags(task.intentInfo)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Endstate</td>
                        <td>
                          <DiffedText
                            oldText={trimParagraphTags(taskNotification.oldTask?.endstateInfo)}
                            newText={trimParagraphTags(task.endstateInfo)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Start Date</td>
                        <td>
                          <DiffedText
                            oldText={datetimeToDate(taskNotification.oldTask?.startedDatetime)}
                            newText={datetimeToDate(task.startedDatetime)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>End Date</td>
                        <td>
                          <DiffedText
                            oldText={datetimeToDate(taskNotification.oldTask?.dueDatetime)}
                            newText={datetimeToDate(task.dueDatetime)}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ),
          )}
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {loggedInUserId === userId && (
          <Button
            color="primary"
            onClick={() => onApprove(userId, task._id, taskNotifications[0]._id)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Mark as read
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
