import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import DiffedText from './DiffedText';


export const TaskDifferenceModal = ({ taskNotifications, task, onApprove, isOpen, toggle }) => (
  <Modal size="xl" isOpen={isOpen} toggle={() => toggle(undefined, [])}>
    <ModalHeader toggle={() => toggle(undefined, [])}>Task Info Changes</ModalHeader>
    <ModalBody>
      {taskNotifications.map((notification) => (
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
                  {/* Task Name */}
                </td>
              </tr>
              <tr>
                <td scope="col">Priority</td>
                <td scope="col">
                  {/* Priority */}
                </td>
              </tr>
              <tr>
                <td scope="col">Resources</td>
                <td scope="col">
                  {/* Resources */}
                </td>
              </tr>
              <tr>
                <td scope="col">Assigned</td>
                <td scope="col">
                  {/* isAssigned */}
                </td>
              </tr>
              <tr>
                <td scope="col">Status</td>
                <td scope="col">
                  {/* status */}
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Best-case">
                  Hours - Best-case
                </td>
                <td scope="col" data-tip="Hours - Best-case">
                  {/* hours best case */}
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Worst-case">
                  Hours - Worst-case
                </td>
                <td scope="col" data-tip="Hours - Worst-case">
                  {/* hours worst case */}
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours - Most-case">
                  Hours - Most-case
                </td>
                <td scope="col" data-tip="Hours - Most-case">
                  {/* hours most case */}
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">
                  Estimated Hours
                </td>
                <td scope="col" data-tip="Estimated Hours">
                  {/* estimated hours */}
                </td>
              </tr>

              <tr>
                <td scope="col">Links</td>
                <td scope="col">
                  {/* links */}
                </td>
              </tr>
              <tr>
                <td scope="col">Classification</td>
                <td scope="col">
                  {/* classification */}
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Why this Task is Important
                  {/* why important */}
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Design Intent
                  {/* intent */}
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan="2">
                  Endstate
                  {/* end info */}
                </td>
              </tr>
              <tr>
                <td scope="col">Start Date</td>
                <td scope="col">
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
