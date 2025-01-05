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
  if (datetime) {
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

  useEffect(() => {
    let tasks = props.tasks_filter;

    if (tasks.length > 0) {
      tasks = ['priority', 'status', 'classification', 'isActive', 'isAssigned'].reduce(
        (filteredTask, filter) => {
          return props[filter]
            ? filteredTask.filter(item => item[filter] === props[filter])
            : filteredTask;
        },
        tasks
      );

      if (props.users) {
        tasks = tasks.filter(task => task.resources.some(resource => resource.name === props.users));
      }
    }

    setFilteredTasks(tasks);
  }, [props.tasks_filter, props.priority, props.status, props.classification, props.isActive, props.isAssigned, props.users]);


  const tasksList = filteredTasks.map((task, index) => (
    <tr key={task._id} className={darkMode ? 'dark-mode-row' : ''}>
      <td>{index + 1}</td>
      <td className="tasks-detail-task-name">{truncate(task.taskName, 20)}</td>
      <td className="tasks-detail-center-cells">{task.priority}</td>
      <td>{task.status}</td>
      <td className="tasks-detail-center-cells">
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
      <td className="tasks-detail-center-cells">
        {task.isAssigned ? <div>Assign</div> : <div>Not Assign</div>}
      </td>
      <td className="tasks-detail-center-cells">{task.classification}</td>
      <td className="tasks-detail-center-cells">{task.estimatedHours.toFixed(2)}</td>
      <td className="tasks-detail-center-cells">{formatDate(task.startedDatetime)}</td>
      <td className="tasks-detail-center-cells">{formatDate(task.dueDatetime)}</td>
      <td>
        {props.toggleEditTasks && (
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
        )}
      </td>
    </tr>
  ));

  return (
    <div>
      <div className={`tasks-detail-total ${darkMode ? 'text-light' : ''}`}>Total: {tasksList.length}</div>
      <table className={`tasks-detail-table ${darkMode ? 'dark-mode-table' : ''}`}>
        <thead className='tasks-detail-table-head'>
          <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
            <th>#</th>
            <th>Task</th>
            <th className="tasks-detail-center-cells">Priority</th>
            <th>Status</th>
            <th className="tasks-detail-center-cells">Resources</th>
            <th className="tasks-detail-center-cells">Active</th>
            <th className="tasks-detail-center-cells">Assign</th>
            <th className="tasks-detail-center-cells">Class</th>
            <th className="tasks-detail-center-cells">Estimated Hours</th>
            <th className="tasks-detail-center-cells">Start Date</th>
            <th className="tasks-detail-center-cells">End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-mode' : ''}>{tasksList}</tbody>
      </table>
    </div>
  );
};
