import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditTaskModal from '../../Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import 'react-table/react-table.css';
import Collapse from 'react-bootstrap/Collapse';
import './TasksDetail.css';

const ShowCollapse = props => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(!open)} aria-expanded={open}>
        {props.resources.length} ➤
      </Button>

      <div>{props.resources[0].name}</div>

      {props.resources.slice(1).map(resource => (
        <Collapse in={open}>
          <div key={resource._id} className="new-line">
            {resource.name}
          </div>
        </Collapse>
      ))}
    </div>
  );
};

export const TasksDetail = props => {
  let tasksList = [];
  let tasks = [];
  tasks = props.tasks_filter;

  if (props.tasks_filter.length > 0) {
    tasks = ['priority', 'status', 'classification', 'isActive', 'isAssigned'].reduce(
      (filteredTask, filter) => {
        return props[filter]
          ? filteredTask.filter(item => item[filter] === props[filter])
          : filteredTask;
      },
      tasks,
    );

    if (props.users) {
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
    <div key={task._id} className="tasks-detail-table-row">
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
      <div>
        <div>{index + 1}</div>
      </div>
      <div className="tasks-detail-task-name">{task.taskName}</div>
      <div>{task.priority}</div>
      <div>{task.status}</div>
      <div className="tasks-detail-center-cells">
        {task.resources.length <= 2 ? (
          task.resources.map(resource => <div key={resource._id}>{resource.name}</div>)
        ) : (
          <ShowCollapse resources={task.resources} />
        )}
      </div>

      <div className="tasks-detail-center-cells">
        {task.isActive ? (
          <tasks className="isActive">
            <i className="fa fa-circle" aria-hidden="true"></i>
          </tasks>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true"></i>
          </div>
        )}
      </div>

      <div className="tasks-detail-center-cells">
        {task.isAssigned ? <div>Assign</div> : <div>Not Assign</div>}
      </div>
      <div className="tasks-detail-center-cells">{task.classification}</div>
      <div className="tasks-detail-center-cells">{task.estimatedHours.toFixed(2)}</div>
      <div>{task.startedDatetime}</div>
      <div>{task.dueDatetime}</div>
    </div>
  ));

  return (
    <div>
      <div className="tasks-detail-total">Total: {tasksList.length}</div>
      <div className="tasks-detail-table-row tasks-detail-table-head">
        <div></div>
        <div>#</div>
        <div>Task</div>
        <div>Priority</div>
        <div>Status</div>
        <div className="tasks-detail-center-cells">Resources</div>
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
