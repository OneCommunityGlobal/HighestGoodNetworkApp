import './reports.css';
import React, { useState } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import EditTaskModal from './../Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import 'react-table/react-table.css';
import Collapse from 'react-bootstrap/Collapse';

const ShowCollapse = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(!open)} aria-expanded={open}>
        {props.resources.length} ➤
      </Button>

      <div>{props.resources[0].name}</div>

      {props.resources.slice(1).map((resource) => (
        <Collapse in={open}>
          <div key={resource._id} white-space="pre-line" white-space="nowrap" className="new-line">
            {resource.name}
          </div>
        </Collapse>
      ))}
    </div>
  );
};
const TasksDetail = (props) => {
  let tasksList = [];
  let tasks = [];
  tasks = props.tasks_filter;
  if (props.tasks_filter.length > 0) {
    if (!(props.isActive === '')) {
      tasks = tasks.filter((item) => item.isActive === props.isActive);
    }
    if (!(props.isAssigned === '')) {
      tasks = tasks.filter((item) => item.isAssigned === props.isAssigned);
    }

    if (props.priority === 'No filter') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }
    if (props.status === 'No filter') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }

    if (props.priorityList.length > 0) {
      var i = 0;
      var get_tasks = [];
      while (i < props.priorityList.length) {
        if (props.priorityList[i] != 'Filter Off') {
          for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].priority === props.priorityList[i]) {
              get_tasks.push(tasks[j]);
            }
          }
          i += 1;
        } else {
          get_tasks = props.tasks_filter;
          break;
        }
      }
      tasks = get_tasks;
    }

    if (props.classificationList.length > 0) {
      var i = 0;
      var get_tasks = [];
      while (i < props.classificationList.length) {
        if (props.classificationList[i] != 'Filter Off') {
          for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].classification === props.classificationList[i]) {
              get_tasks.push(tasks[j]);
            }
          }
          i += 1;
        } else {
          get_tasks = props.tasks_filter;
          break;
        }
      }
      tasks = get_tasks;
    }
    if (props.statusList.length > 0) {
      var i = 0;
      var get_tasks = [];
      while (i < props.statusList.length) {
        if (props.statusList[i] != 'Filter Off') {
          for (var j = 0; j < tasks.length; j++) {
            if (tasks[j].status === props.statusList[i]) {
              get_tasks.push(tasks[j]);
            }
          }
          i += 1;
        } else {
          get_tasks = props.tasks_filter;
          break;
        }
      }
      tasks = get_tasks;
    }

    if (props.classification === 'Filter Off') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }
    if (props.users === 'Filter Off') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }
    if (props.isAssigned === 'Filter Off') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }
    if (props.users === 'Filter Off') {
      tasks = props.tasks_filter.filter((item) => item.isActive === props.isActive);
    }

    if (!(props.users === '')) {
      let test = [];
      for (var i = 0; i < tasks.length; i++) {
        for (var j = 0; j < tasks[i].resources.length; j++) {
          if (tasks[i].resources[j].name === props.users) {
            test.push(tasks[i]);
          }
        }
      }
      tasks = test;
    }
  }

  tasksList = tasks.map((task, index) => (
    <tr id={'tr_' + task._id}>
      <th scope="row">
        <EditTaskModal
          key={`editTask_${task._id}`}
          parentNum={task.num}
          taskId={task._id}
          wbsId={task.wbsId}
          parentId1={task.parentId1}
          parentId2={task.parentId2}
          parentId3={task.parentId3}
          mother={task.mother}
          level={task.level}
        />
      </th>
      <th scope="row">
        <div>{index + 1}</div>
      </th>
      <td>{task.taskName}</td>
      <td>{task.priority}</td>
      <td>{task.status}</td>
      <td>
        {task.resources.length <= 2 ? (
          task.resources.map((resource) => <div key={resource._id}>{resource.name}</div>)
        ) : (
          <ShowCollapse resources={task.resources} />
        )}
      </td>

      <td className="projects__active--input">
        {task.isActive ? (
          <tasks className="isActive">
            <i className="fa fa-circle" aria-hidden="true"></i>
          </tasks>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true"></i>
          </div>
        )}
      </td>

      <td className="projects__active--input">
        {task.isAssigned ? <div>Assign</div> : <div>Not Assign</div>}
      </td>
      <td className="projects__active--input">{task.classification}</td>
      <td className="projects__active--input">{task.estimatedHours.toFixed(2)}</td>
      <td>{task.startedDatetime}</td>
      <td>{task.dueDatetime}</td>
    </tr>
  ));

  return (
    <div>
      <h2>Total: {tasksList.length}</h2>
      <div className="table-responsive-sm">
        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
              <th scope="col" id="projects__order">
                Action
              </th>
              <th scope="col" id="projects__order">
                #
              </th>
              <th scope="col" id="projects__active">
                Task
              </th>
              <th scope="col" id="projects__active">
                Priority
              </th>
              <th scope="col" id="projects__active">
                Status
              </th>
              <th scope="col">Resources</th>
              <th scope="col" id="projects__active">
                Active
              </th>
              <th scope="col" id="projects__active">
                Assign
              </th>
              <th scope="col" id="projects__active">
                Class
              </th>
              <th scope="col" id="projects__active">
                Estimated Hours
              </th>
              <th scope="col" id="projects__active">
                Start Date
              </th>
              <th scope="col" id="projects__active">
                End Date
              </th>
            </tr>
          </thead>
          <tbody>{tasksList}</tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksDetail;
