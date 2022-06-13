import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap';
import DiffedText from './DiffedText';

export const TaskDifferenceModal = ({ taskNotifications, task, onApprove }) => (
  <Modal size="xl">
    <ModalHeader>Task Info Changes</ModalHeader>
    <ModalBody>
      {taskNotifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <h4>{`${task.taskNum} ${task.taskName}`}</h4>
              <Table striped>
                <thead>
                  <tr>
                    <th></th>
                    <th>Previous</th>
                    <th>New</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {!notification.oldTask.oldWhyInfo || notification.oldTask.oldWhyInfo !==
                  task.whyInfo ? (
                    <tr>
                      <th>Why Task is Important</th>
                      <td>{!notification.oldTask.oldWhyInfo ? '' : notification.oldTask.oldWhyInfo}</td>
                      <td>{task.whyInfo}</td>
                      <td>
                        <DiffedText
                          oldText={!notification.oldTask.oldWhyInfo ? '' : notification.oldTask.oldWhyInfo}
                          newText={task.whyInfo}
                        />
                      </td>
                    </tr>
                  ) : null}
                  {!notification.oldTask.oldIntentInfo || notification.oldTask.oldIntentInfo !==
                  task.intentInfo ? (
                    <tr>
                      <th>Intent of Task</th>
                      <td>{!notification.oldTask.oldIntentInfo ? '' : notification.oldTask.oldIntentInfo}</td>
                      <td>{task.intentInfo}</td>
                      <td>
                        <DiffedText
                          oldText={!notification.oldTask.oldIntentInfo ? '' : notification.oldTask.oldIntentInfo}
                          newText={task.intentInfo}
                        />
                      </td>
                    </tr>
                  ) : null}
                  {!notification.oldTask.oldEndstateInfo || notification.oldTask.oldEndstateInfo !==
                  task.endstateInfo ? (
                    <tr>
                      <th>Task Endstate</th>
                      <td>{!notification.oldTask.oldEndstateInfo ? '' : notification.oldTask.oldEndstateInfo}</td>
                      <td>{task.endstateInfo}</td>
                      <td>
                        <DiffedText
                          oldText={!notification.oldTask.oldEndstateInfo ? '' : notification.oldTask.oldEndstateInfo}
                          newText={task.endstateInfo}
                        />
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </React.Fragment>
          ))}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={onApprove}>
        Okay
      </Button>
    </ModalFooter>
  </Modal>
);
