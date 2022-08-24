import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalFooter, Row, Col, Button, Container } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { rejectTaskEditSuggestion } from '../thunks';
import { updateTask } from 'actions/task';
import { TaskEditSuggestionModalBodyView } from './TaskEditSuggestionModalBodyView';
import { TaskEditSuggestionModalBodyEdit } from './TaskEditSuggestionModalBodyEdit/TaskEditSuggestionModalBodyEdit';

export const TaskEditSuggestionsModal = ({isTaskEditSuggestionModalOpen, taskEditSuggestion, handleToggleTaskEditSuggestionModal}) => {

  const dispatch = useDispatch();

  const [isView, setIsView] = useState(true);
  const [newTask, setNewTask] = useState(taskEditSuggestion ? taskEditSuggestion.newTask : {});

  useEffect(() => {
    setNewTask(taskEditSuggestion ? taskEditSuggestion.newTask : {});
  }, [taskEditSuggestion]);

  return (
    <Modal size="xl" isOpen={isTaskEditSuggestionModalOpen} toggle={() => handleToggleTaskEditSuggestionModal()}>
    <ModalHeader toggle={() => handleToggleTaskEditSuggestionModal()}>
      {taskEditSuggestion && `Changes suggested by: ${taskEditSuggestion.user}`}
    </ModalHeader>
    {isView ? <TaskEditSuggestionModalBodyView taskEditSuggestion={taskEditSuggestion}/> : <TaskEditSuggestionModalBodyEdit taskEditSuggestion={taskEditSuggestion} newTask={newTask} setNewTask={setNewTask}/>}
    <ModalFooter>
      <Row>
        <Col>
          <Button color="success" onClick={() => {
            if (isView) {
              dispatch(updateTask(taskEditSuggestion.taskId, taskEditSuggestion.newTask, true));
              dispatch(rejectTaskEditSuggestion(taskEditSuggestion._id));
              handleToggleTaskEditSuggestionModal();
            } else {
              dispatch(updateTask(taskEditSuggestion.taskId, newTask, true));
              dispatch(rejectTaskEditSuggestion(taskEditSuggestion._id));
              handleToggleTaskEditSuggestionModal();
            }
          }}>
            <i class="fa fa-check"></i>
          </Button>
        </Col>
        <Col style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Button color='primary' onClick={() => setIsView(!isView)}><i class="fa fa-pencil" aria-hidden="true"></i></Button>
        </Col>
        <Col style={{display: "flex"}}>
          <Button color="danger" style={{marginLeft: "auto"}} onClick={() => {
            dispatch(rejectTaskEditSuggestion(taskEditSuggestion._id));
            handleToggleTaskEditSuggestionModal();
            }}>
            <i class="fa fa-trash"s></i>
          </Button>
        </Col>
      </Row>
    </ModalFooter>
  </Modal>
  );
}