import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import DiffedText from './DiffedText';
import { boxStyle } from 'styles';

export const resourcesToString = resources => {
  if (!resources) {
    return '';
  }
  const namesString = resources.reduce((acc, resource) => acc + ',' + resource.name, '');
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
  return arr.reduce((acc, ele) => acc + '\n' + ele, '').trim();
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
  return month + '/' + day + '/' + year;
};

export const TaskDifferenceModal = ({
  taskNotifications,
  task,
  onApprove,
  userId,
  isOpen,
  toggle,
  loggedInUserId,
}) => (
  <Modal size="xl" isOpen={isOpen} toggle={() => toggle(undefined, [])}>
    <ModalHeader toggle={() => toggle(undefined, [])}>Task Info Changes</ModalHeader>
    <ModalBody>
      {taskNotifications &&
        taskNotifications.map(
          taskNotification =>
            taskNotification.userId === userId && (
              <div key={taskNotification.taskId} style={{ textAlign: 'center' }}>
                <div>
                  <span style={{ color: 'black', fontWeight: 'bold' }}>
                    Black Bold = No Changes
                  </span>
                  <span
                    style={{ color: 'red', textDecorationLine: 'line-through', marginLeft: '30px' }}
                  >
                    Red Strikethrough = Deleted
                  </span>
                  <span style={{ color: 'green', marginLeft: '30px' }}>Green = Added</span>
                </div>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <td scope="col" data-tip="WBS ID">
                        WBS #
                      </td>
                      <td scope="col">{task.num}</td>
                    </tr>
                    <tr>
                      <td scope="col">Task Name</td>
                      <td scope="col">
                        <DiffedText
                          oldText={taskNotification.oldTask?.taskName}
                          newText={task.taskName}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Priority</td>
                      <td scope="col">
                        <DiffedText
                          oldText={taskNotification.oldTask?.priority}
                          newText={task.priority}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Resources</td>
                      <td scope="col">
                        <DiffedText
                          oldText={resourcesToString(taskNotification.oldTask?.resources)}
                          newText={resourcesToString(task.resources)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Assigned</td>
                      <td scope="col">
                        <DiffedText
                          oldText={booleanToString(taskNotification.oldTask?.isAssigned)}
                          newText={booleanToString(task.isAssigned)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Status</td>
                      <td scope="col">
                        <DiffedText
                          oldText={taskNotification.oldTask?.status}
                          newText={task.status}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col" data-tip="Hours - Best-case">
                        Hours - Best-case
                      </td>
                      <td scope="col" data-tip="Hours - Best-case">
                        <DiffedText
                          oldText={numberToString(taskNotification.oldTask?.hoursBest)}
                          newText={numberToString(task.hoursBest)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col" data-tip="Hours - Worst-case">
                        Hours - Worst-case
                      </td>
                      <td scope="col" data-tip="Hours - Worst-case">
                        <DiffedText
                          oldText={numberToString(taskNotification.oldTask?.hoursWorst)}
                          newText={numberToString(task.hoursWorst)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col" data-tip="Hours - Most-case">
                        Hours - Most-case
                      </td>
                      <td scope="col" data-tip="Hours - Most-case">
                        <DiffedText
                          oldText={numberToString(taskNotification.oldTask?.hoursMost)}
                          newText={numberToString(task.hoursMost)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col" data-tip="Estimated Hours">
                        Estimated Hours
                      </td>
                      <td scope="col" data-tip="Estimated Hours">
                        <DiffedText
                          oldText={numberToString(taskNotification.oldTask?.estimatedHours)}
                          newText={numberToString(task.estimatedHours)}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td scope="col">Links</td>
                      <td scope="col">
                        <DiffedText
                          oldText={arrayToString(taskNotification.oldTask?.links)}
                          newText={arrayToString(task.links)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Classification</td>
                      <td scope="col">
                        <DiffedText
                          oldText={taskNotification.oldTask?.classification}
                          newText={task.classification}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Why this Task is Important</td>
                      <td>
                        <DiffedText
                          oldText={trimParagraphTags(taskNotification.oldTask?.whyInfo)}
                          newText={trimParagraphTags(task.whyInfo)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Design Intent</td>
                      <td>
                        <DiffedText
                          oldText={trimParagraphTags(taskNotification.oldTask?.intentInfo)}
                          newText={trimParagraphTags(task.intentInfo)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Endstate</td>
                      <td>
                        <DiffedText
                          oldText={trimParagraphTags(taskNotification.oldTask?.endstateInfo)}
                          newText={trimParagraphTags(task.endstateInfo)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">Start Date</td>
                      <td scope="col">
                        <DiffedText
                          oldText={datetimeToDate(taskNotification.oldTask?.startedDatetime)}
                          newText={datetimeToDate(task.startedDatetime)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td scope="col">End Date</td>
                      <td scope="col">
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
    <ModalFooter>
      {loggedInUserId === userId && (
        <Button
          color="primary"
          onClick={() => onApprove(userId, task._id, taskNotifications[0]._id)}
          style={boxStyle}
        >
          Mark as read
        </Button>
      )}
    </ModalFooter>
  </Modal>
);
