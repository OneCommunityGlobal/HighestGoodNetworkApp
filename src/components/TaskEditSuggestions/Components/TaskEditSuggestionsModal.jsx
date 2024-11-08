import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Button } from 'reactstrap';
import {
  resourcesToString,
  booleanToString,
  numberToString,
  arrayToString,
  trimParagraphTags,
  datetimeToDate,
} from 'components/TeamMemberTasks/components/TaskDifferenceModal';
import DiffedText from 'components/TeamMemberTasks/components/DiffedText';
import { useDispatch } from 'react-redux';
import { rejectTaskEditSuggestion } from '../thunks';
import { updateTask } from 'actions/task';
import hasPermission from 'utils/permissions';
import { useSelector, useStore } from 'react-redux';
import { useState } from 'react';

export const TaskEditSuggestionsModal = ({
  isTaskEditSuggestionModalOpen,
  taskEditSuggestion,
  handleToggleTaskEditSuggestionModal,
}) => {
  const dispatch = useDispatch();

  const { getState } = useStore();

  const approveTask = () => {
    // console.log('mainproblem', taskEditSuggestion);
    updateTask(
      taskEditSuggestion.taskId,
      taskEditSuggestion.newTask,
      dispatch(hasPermission('updateTask')),
    )(dispatch, getState);
    dispatch(rejectTaskEditSuggestion(taskEditSuggestion._id));
    handleToggleTaskEditSuggestionModal();
  };

  return (
    <Modal
      size="xl"
      isOpen={isTaskEditSuggestionModalOpen}
      toggle={() => handleToggleTaskEditSuggestionModal()}
    >
      <ModalHeader toggle={() => handleToggleTaskEditSuggestionModal()}>
        {taskEditSuggestion && `Changes suggested by: ${taskEditSuggestion.user}`}
      </ModalHeader>
      <ModalBody>
        {taskEditSuggestion && (
          <div style={{ textAlign: 'center' }}>
            <div>
              <span style={{ color: 'black', fontWeight: 'bold' }}>Black Bold = No Changes</span>
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
                  {taskEditSuggestion && taskEditSuggestion.oldTask && <td scope="col">{taskEditSuggestion.oldTask.num}</td>}
                </tr>
                <tr>
                  <td scope="col">Task Name</td>
                  <td scope="col">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.taskName}
                      newText={taskEditSuggestion.newTask.taskName}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Priority</td>
                  <td scope="col">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.priority}
                      newText={taskEditSuggestion.newTask.priority}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Resources</td>
                  <td scope="col">
                    <DiffedText
                      oldText={resourcesToString(taskEditSuggestion.oldTask.resources)}
                      newText={resourcesToString(taskEditSuggestion.newTask.resources)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Assigned</td>
                  <td scope="col">
                    <DiffedText
                      oldText={booleanToString(taskEditSuggestion.oldTask.isAssigned)}
                      newText={booleanToString(taskEditSuggestion.newTask.isAssigned)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Status</td>
                  <td scope="col">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.status}
                      newText={taskEditSuggestion.newTask.status}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col" data-tip="Hours - Best-case">
                    Hours - Best-case
                  </td>
                  <td scope="col" data-tip="Hours - Best-case">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursBest)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursBest)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col" data-tip="Hours - Worst-case">
                    Hours - Worst-case
                  </td>
                  <td scope="col" data-tip="Hours - Worst-case">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursWorst)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursWorst)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col" data-tip="Hours - Most-case">
                    Hours - Most-case
                  </td>
                  <td scope="col" data-tip="Hours - Most-case">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursMost)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursMost)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col" data-tip="Estimated Hours">
                    Estimated Hours
                  </td>
                  <td scope="col" data-tip="Estimated Hours">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.estimatedHours)}
                      newText={numberToString(taskEditSuggestion.newTask.estimatedHours)}
                    />
                  </td>
                </tr>

                <tr>
                  <td scope="col">Links</td>
                  <td scope="col">
                    <DiffedText
                      oldText={arrayToString(taskEditSuggestion.oldTask.links)}
                      newText={arrayToString(taskEditSuggestion.newTask.links)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Classification</td>
                  <td scope="col">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.classification}
                      newText={taskEditSuggestion.newTask.classification}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Why this Task is Important</td>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.whyInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.whyInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Design Intent</td>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.intentInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.intentInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Endstate</td>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.endstateInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.endstateInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">Start Date</td>
                  <td scope="col">
                    <DiffedText
                      oldText={datetimeToDate(taskEditSuggestion.oldTask.startedDatetime)}
                      newText={datetimeToDate(taskEditSuggestion.newTask.startedDatetime)}
                    />
                  </td>
                </tr>
                <tr>
                  <td scope="col">End Date</td>
                  <td scope="col">
                    <DiffedText
                      oldText={datetimeToDate(taskEditSuggestion.oldTask.dueDatetime)}
                      newText={datetimeToDate(taskEditSuggestion.newTask.dueDatetime)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Row>
          <Col>
            <Button color="success" onClick={approveTask}>
              Approve
            </Button>
          </Col>
          <Col style={{ display: 'flex' }}>
            <Button
              color="danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => {
                dispatch(rejectTaskEditSuggestion(taskEditSuggestion._id));
                handleToggleTaskEditSuggestionModal();
              }}
            >
              Reject
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
};
