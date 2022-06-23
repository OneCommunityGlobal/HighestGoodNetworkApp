import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import DiffedText from './DiffedText';

const resourcesToString = (resources) => {
  if (!resources) {
    return "";
  }
  const namesString = resources.reduce((acc, resource) => acc + "," + resource.name, "");
  const trimmed = namesString.replace(/(^,)|(,$)/g, '');
  return trimmed;
};

const booleanToString = (bool) => {
  if (bool == null) {
    return "";
  }
  return bool.toString();
}

const numberToString = (num) => {
  if (num == null) {
    return "";
  }
  return num.toString();
}

const arrayToString = (arr) => {
  if (arr == null) {
    return "";
  }
  return arr.reduce((acc, ele) => acc + "\n " + ele, "").trim();
}

const trimParagraphTags = (str) => {
  if (str == null) {
    return "";
  }
  return str.replace(/(<p[^>]+?>|<p>|<\/p>)/img, "");
}

const datetimeToDate = (datetime) => {
  if (datetime == null) {
    return "";
  }
  const date = new Date(datetime);
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();
  return day + "/" + month + "/" + year;
}

export const TaskDifferenceModal = ({ taskNotifications, task, onApprove, isOpen, toggle }) => (
  <Modal size="xl" isOpen={isOpen} toggle={() => toggle(undefined, [])}>
    <ModalHeader toggle={() => toggle(undefined, [])}>Task Info Changes</ModalHeader>
    <ModalBody>
      {taskNotifications.map((taskNotification) => (
          <table className="table table-bordered">
            <tbody>
              {/* <tr>
                <td scope="col" data-tip="WBS ID">
                  WBS #
                </td>
                <td scope="col">{task.wbsId}</td>
              </tr> */}
              <tr>
                <td scope="col">Task Name</td>
                <td scope="col">
                  <DiffedText oldText={taskNotification.oldTask.oldTaskName} newText={task.taskName}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Priority</td>
                <td scope="col">
                <DiffedText oldText={taskNotification.oldTask.oldPriority} newText={task.priority}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Resources</td>
                <td scope="col">
                  <DiffedText oldText={resourcesToString(taskNotification.oldTask.oldResources)} newText={resourcesToString(task.resources)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Assigned</td>
                <td scope="col">
                  <DiffedText oldText={booleanToString(taskNotification.oldTask.oldIsAssigned)} newText={booleanToString(task.isAssigned)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Status</td>
                <td scope="col">
                  <DiffedText oldText={taskNotification.oldTask.oldStatus} newText={task.status}/>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Best-case">
                  Hours - Best-case
                </td>
                <td scope="col" data-tip="Hours - Best-case">
                  <DiffedText oldText={numberToString(taskNotification.oldTask.oldHoursBest)} newText={numberToString(task.hoursBest)}/>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Worst-case">
                  Hours - Worst-case
                </td>
                <td scope="col" data-tip="Hours - Worst-case">
                  <DiffedText oldText={numberToString(taskNotification.oldTask.oldHoursWorst)} newText={numberToString(task.hoursWorst)}/>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Most-case">
                  Hours - Most-case
                </td>
                <td scope="col" data-tip="Hours - Most-case">
                  <DiffedText oldText={numberToString(taskNotification.oldTask.oldHoursMost)} newText={numberToString(task.hoursMost)}/>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">
                  Estimated Hours
                </td>
                <td scope="col" data-tip="Estimated Hours">
                  <DiffedText oldText={numberToString(taskNotification.oldTask.oldEstimatedHours)} newText={numberToString(task.estimatedHours)}/>
                </td>
              </tr>

              <tr>
                <td scope="col">Links</td>
                <td scope="col">
                  <DiffedText oldText={arrayToString(taskNotification.oldTask.oldLinks)} newText={arrayToString(task.links)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Classification</td>
                <td scope="col">
                  <DiffedText oldText={taskNotification.oldTask.oldClassification} newText={task.classification}/>
                </td>
              </tr>
              <tr>
                <td scope="col">
                  Why this Task is Important
                </td>
                <td>
                  <DiffedText oldText={trimParagraphTags(taskNotification.oldTask.oldWhyInfo)} newText={trimParagraphTags(task.whyInfo)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">
                  Design Intent
                </td>
                <td>
                  <DiffedText oldText={trimParagraphTags(taskNotification.oldTask.oldIntentInfo)} newText={trimParagraphTags(task.intentInfo)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">
                  Endstate
                </td>
                <td>
                  <DiffedText oldText={trimParagraphTags(taskNotification.oldTask.oldEndstateInfo)} newText={trimParagraphTags(task.endstateInfo)}/>
                </td>
              </tr>
              <tr>
                <td scope="col">Start Date</td>
                <td scope="col">
                  <DiffedText oldText={datetimeToDate(taskNotification.oldTask.oldStartedDatetime)} newText={datetimeToDate(task.startedDatetime)}/>
                  {/* <div>
                    <DayPickerInput
                      format={FORMAT}
                      formatDate={formatDate}
                      placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                      onDayChange={(day, mod, input) => changeDateStart(input.state.value)}
                      value={startedDate}
                    />
                    <div className="warning">
                      {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                    </div>
                  </div> */}
                </td>
              </tr>
              <tr>
                <td scope="col">End Date</td>
                <td scope="col">
                  <DiffedText oldText={datetimeToDate(taskNotification.oldTask.oldDueDatetime)} newText={datetimeToDate(task.dueDatetime)}/>
                  {/* <DayPickerInput
                    format={FORMAT}
                    formatDate={formatDate}
                    placeholder={`${dateFnsFormat(new Date(), FORMAT)}`}
                    onDayChange={(day, mod, input) => changeDateEnd(input.state.value)}
                    value={dueDate}
                  />
                  <div className="warning">
                    {dateWarning ? DUE_DATE_MUST_GREATER_THAN_START_DATE : ''}
                  </div> */}
                </td>
              </tr>
            </tbody>
          </table>
          ))}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={onApprove}>
        Mark as read
      </Button>
    </ModalFooter>
  </Modal>
);
