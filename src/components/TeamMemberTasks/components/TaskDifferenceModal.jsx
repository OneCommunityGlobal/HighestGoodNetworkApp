import React from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';

export const TaskDifferenceModal = ({ currentTaskNotifications, onApprove }) => (
  <Modal size="xl">
    <ModalHeader>Task Info Changes</ModalHeader>
    <ModalBody>
      {currentTaskNotifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <h4>{`${notification.taskNum} ${notification.taskName}`}</h4>
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
                  {notification.oldTaskInfos.oldWhyInfo !==
                  notification.newTaskInfos.newWhyInfo ? (
                    <tr>
                      <th>Why Task is Important</th>
                      <td>{notification.oldTaskInfos.oldWhyInfo}</td>
                      <td>{notification.newTaskInfos.newWhyInfo}</td>
                      <td>
                        <DiffedText
                          oldText={notification.oldTaskInfos.oldWhyInfo}
                          newText={notification.newTaskInfos.newWhyInfo}
                        />
                      </td>
                    </tr>
                  ) : null}
                  {notification.oldTaskInfos.oldIntentInfo !==
                  notification.newTaskInfos.newIntentInfo ? (
                    <tr>
                      <th>Intent of Task</th>
                      <td>{notification.oldTaskInfos.oldIntentInfo}</td>
                      <td>{notification.newTaskInfos.newIntentInfo}</td>
                      <td>
                        <DiffedText
                          oldText={notification.oldTaskInfos.oldIntentInfo}
                          newText={notification.newTaskInfos.newIntentInfo}
                        />
                      </td>
                    </tr>
                  ) : null}
                  {notification.oldTaskInfos.oldEndstateInfo !==
                  notification.newTaskInfos.newEndstateInfo ? (
                    <tr>
                      <th>Task Endstate</th>
                      <td>{notification.oldTaskInfos.oldEndstateInfo}</td>
                      <td>{notification.newTaskInfos.newEndstateInfo}</td>
                      <td>
                        <DiffedText
                          oldText={notification.oldTaskInfos.oldEndstateInfo}
                          newText={notification.newTaskInfos.newEndstateInfo}
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
