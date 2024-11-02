import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import EditTaskModal from '../../Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import 'react-table/react-table.css';
import Collapse from 'react-bootstrap/Collapse';
import './TasksDetail.css';

const ShowCollapse = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div>{props.resources[0].name}</div>
      {props.resources.slice(1).map((resource) => (
        <Collapse in={open} key={resource._id}>
          <div>{resource.name}</div>
        </Collapse>
      ))}
      <Button onClick={() => setOpen(!open)} aria-expanded={open} size='sm'>
        {props.resources.length} ➤
      </Button>
    </>
  );
};

const formatDate = (datetime) => {
  if(datetime){
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(datetime).toLocaleDateString(undefined, options);
  }
  return 'N/A'
};

const truncate = (str, n) => {
  return str.length > n ? str.substring(0, n - 1) + '...' : str;
};

export const TasksDetail = (props) => {
  const [filteredTasks, setFilteredTasks] = useState(props.tasks_filter);
  const darkMode = props.darkMode;
  let tasksList = [];
  let tasks = props.tasks_filter;

  useEffect(() => {
    let tasks = props.tasks_filter;
    if (props.users) {
      let test = [];
      for (var i = 0; i < tasks.length; i++) {
        for (var j = 0; i < tasks[i].resources.length; j++) {
          if (tasks[i].resources[j].name === props.users) {
            test.push(tasks[i]);
          }
        }
      }
    }
  tasksList = tasks.map((task, index) => (
    <div key={task._id} className={`tasks-detail-grid tasks-detail-table-row ${darkMode ? 'dark-mode-row' : ''}`}>
      <div>
        <EditTaskModal
          key={`updateTask_${task._id}`}
          parentNum={task.num}
          taskId={task._id}
          wbsId={task.wbsId}
          parentId1={task.parentId1}
          parentId2={task.parentId2}
          parentId3={task.parentId3}
          mother={task.mother}
          level={task.level}
        />
      </div>
      <div className="tasks-detail-center-cells">
        {index + 1}
      </div>
      <div className="tasks-detail-task-name">{task.taskName}</div>
      <div>{task.priority}</div>
      <div>{task.status}</div>
      <div>
        {task.resources.length <= 2 ? (
          task.resources.map((resource) => <div key={resource._id}>{resource.name}</div>)
        ) : (
          <ShowCollapse resources={task.resources} />
        )}
      </td>
      <td className="tasks-detail-center-cells">
        {task.isActive ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true"></i>
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true"></i>
          </div>
        )}
      </td>
      <td className="tasks-detail-center-cells collapse-column">
        {task.isAssigned ? <div>Assign</div> : <div>Not Assign</div>}
      </div>
      <div className="tasks-detail-center-cells">{task.classification}</div>
      <div className="tasks-detail-center-cells">{task.estimatedHours.toFixed(2)}</div>
      <div>{task.startedDatetime ? task.startedDatetime : ''}</div>
      <div>{task.dueDatetime ? task.dueDatetime : ''}</div>
    </div>
  ));

  return (
    <div className={`scrollable-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tasks-detail-total">Total: {tasksList.length}</div>
      <div className={`tasks-detail-grid tasks-detail-table-head ${darkMode ? 'dark-mode-row' : ''}`}>
        <div className="tasks-detail-center-cells">#</div>
        <div>Task</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Resources</div>
        <div className="tasks-detail-center-cells">Active</div>
        <div className="tasks-detail-center-cells">Assign</div>
        <div className="tasks-detail-center-cells">Class</div>
        <div className="tasks-detail-center-cells">Estimated Hours</div>
        <div>Start Date</div>
        <div>End Date</div>
      </div>
      <div>{tasksList}</div>
    </div>
  );
};
