import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Button } from 'reactstrap';
import { useStore, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  resourcesToString,
  booleanToString,
  numberToString,
  arrayToString,
  trimParagraphTags,
  datetimeToDate,
} from '../../TeamMemberTasks/components/TaskDifferenceModal';
import DiffedText from '../../TeamMemberTasks/components/DiffedText';
import { updateTask } from '../../../actions/task';
import hasPermission from '../../../utils/permissions';
import { incrementDashboardTaskCount } from '../../../actions/dashboardActions';
import { rejectTaskEditSuggestionHTTP } from '../service';
import { rejectTaskEditSuggestionSuccess } from '../actions';
import { fetchTaskEditSuggestions } from '../thunks';

export default function TaskEditSuggestionsModal({
  isTaskEditSuggestionModalOpen,
  taskEditSuggestion,
  handleToggleTaskEditSuggestionModal,
  userRole,
}) {
  const dispatch = useDispatch();

  const { getState } = useStore();

  const approveTask = async () => {
    try {
      await rejectTaskEditSuggestionHTTP(taskEditSuggestion._id).then(() => {
        updateTask(
          taskEditSuggestion.taskId,
          taskEditSuggestion.newTask,
          dispatch(hasPermission('updateTask')),
        )(dispatch, getState);
      });
      dispatch(rejectTaskEditSuggestionSuccess(taskEditSuggestion._id));

      if (userRole !== 'Volunteer') {
        dispatch(incrementDashboardTaskCount(taskEditSuggestion.taskId));
      }
    } catch (e) {
      dispatch(fetchTaskEditSuggestions());
      toast.error(
        'The suggestion might have already been resolved. Reloading the suggestion list...',
      );
    }
    handleToggleTaskEditSuggestionModal();
  };

  const rejectTask = async () => {
    try {
      await rejectTaskEditSuggestionHTTP(taskEditSuggestion._id);
      dispatch(rejectTaskEditSuggestionSuccess(taskEditSuggestion._id));
    } catch (e) {
      dispatch(fetchTaskEditSuggestions());
      toast.error(
        'The suggestion might have already been resolved. Reloading the suggestion list...',
      );
    }
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
                  <th scope="col" data-tip="WBS ID">
                    WBS #
                  </th>
                  {taskEditSuggestion && taskEditSuggestion.oldTask && (
                    <th scope="col">{taskEditSuggestion.oldTask.num}</th>
                  )}
                </tr>
                <tr>
                  <th scope="col">Task Name</th>
                  <th scope="col" aria-label="Task Name">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.taskName}
                      newText={taskEditSuggestion.newTask.taskName}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Priority</th>
                  <th scope="col" aria-label="Priority">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.priority}
                      newText={taskEditSuggestion.newTask.priority}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Resources</th>
                  <th scope="col" aria-label="Resources">
                    <DiffedText
                      oldText={resourcesToString(taskEditSuggestion.oldTask.resources)}
                      newText={resourcesToString(taskEditSuggestion.newTask.resources)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Assigned</th>
                  <th scope="col" aria-label="Assigned">
                    <DiffedText
                      oldText={booleanToString(taskEditSuggestion.oldTask.isAssigned)}
                      newText={booleanToString(taskEditSuggestion.newTask.isAssigned)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col" aria-label="Status">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.status}
                      newText={taskEditSuggestion.newTask.status}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col" data-tip="Hours - Best-case">
                    Hours - Best-case
                  </th>
                  <th scope="col" data-tip="Hours - Best-case" aria-label="Best Hours">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursBest)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursBest)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col" data-tip="Hours - Worst-case">
                    Hours - Worst-case
                  </th>
                  <th scope="col" data-tip="Hours - Worst-case" aria-label="Worst Hours">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursWorst)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursWorst)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col" data-tip="Hours - Most-case">
                    Hours - Most-case
                  </th>
                  <th scope="col" data-tip="Hours - Most-case" aria-label="Most Hours">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.hoursMost)}
                      newText={numberToString(taskEditSuggestion.newTask.hoursMost)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col" data-tip="Estimated Hours">
                    Estimated Hours
                  </th>
                  <th scope="col" data-tip="Estimated Hours" aria-label="Estimated Hours">
                    <DiffedText
                      oldText={numberToString(taskEditSuggestion.oldTask.estimatedHours)}
                      newText={numberToString(taskEditSuggestion.newTask.estimatedHours)}
                    />
                  </th>
                </tr>

                <tr>
                  <th scope="col">Links</th>
                  <th scope="col" aria-label="Links">
                    <DiffedText
                      oldText={arrayToString(taskEditSuggestion.oldTask.links)}
                      newText={arrayToString(taskEditSuggestion.newTask.links)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Classification</th>
                  <th scope="col" aria-label="Classifications">
                    <DiffedText
                      oldText={taskEditSuggestion.oldTask.classification}
                      newText={taskEditSuggestion.newTask.classification}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">Why this Task is Important</th>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.whyInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.whyInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="col">Design Intent</th>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.intentInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.intentInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="col">Endstate</th>
                  <td>
                    <DiffedText
                      oldText={trimParagraphTags(taskEditSuggestion.oldTask.endstateInfo)}
                      newText={trimParagraphTags(taskEditSuggestion.newTask.endstateInfo)}
                    />
                  </td>
                </tr>
                <tr>
                  <th scope="col">Start Date</th>
                  <th scope="col" aria-label="Start Date">
                    <DiffedText
                      oldText={datetimeToDate(taskEditSuggestion.oldTask.startedDatetime)}
                      newText={datetimeToDate(taskEditSuggestion.newTask.startedDatetime)}
                    />
                  </th>
                </tr>
                <tr>
                  <th scope="col">End Date</th>
                  <th scope="col" aria-label="End Date">
                    <DiffedText
                      oldText={datetimeToDate(taskEditSuggestion.oldTask.dueDatetime)}
                      newText={datetimeToDate(taskEditSuggestion.newTask.dueDatetime)}
                    />
                  </th>
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
            <Button color="danger" style={{ marginLeft: 'auto' }} onClick={rejectTask}>
              Reject
            </Button>
          </Col>
        </Row>
      </ModalFooter>
    </Modal>
  );
}
