import { useState } from 'react';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';
import EditTaskModal from '../../Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import 'react-table/react-table.css';
import './TasksDetail.css';

function ShowCollapse({ resources }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(!open)} aria-expanded={open}>
        {resources.length} ➤
      </Button>

      <div>{resources[0].name}</div>

      {resources.slice(1).map(resource => (
        <Collapse in={open} key={resource._id}>
          <div className="new-line">{resource.name}</div>
        </Collapse>
      ))}
    </div>
  );
}

export default function TasksDetail(props) {
  const { tasks_filter: tasksFilter, users } = props;

  let tasksList = [];
  let tasks = tasksFilter;

  if (tasksFilter.length > 0) {
    tasks = ['priority', 'status', 'classification', 'isActive', 'isAssigned'].reduce(
      (filteredTask, filter) => {
        return filter ? filteredTask.filter(item => item[filter] === filter) : filteredTask;
      },
      tasks,
    );

    if (users) {
      const test = [];
      for (let i = 0; i < tasks.length; i += 1) {
        for (let j = 0; j < tasks[i].resources.length; j += 1) {
          if (tasks[i].resources[j].name === users) {
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
            <i className="fa fa-circle" aria-hidden="true" />
          </tasks>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true" />
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
}
