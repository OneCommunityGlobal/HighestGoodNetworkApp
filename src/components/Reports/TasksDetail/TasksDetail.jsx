/* eslint-disable import/prefer-default-export */
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import Collapse from 'react-bootstrap/Collapse';
import EditTaskModal from '../../Projects/WBS/WBSDetail/EditTask/EditTaskModal';
import 'react-table/react-table.css';
import './TasksDetail.css';



function ShowCollapse(props) {
  const [open, setOpen] = useState(false);


  return (
    <>
      <div>
        {props.resources[0].name}
        {props.resources.length > 1 && ','}
      </div>
      {}
      {open && (
        <>
          {props.resources.slice(1).map((resource, index) => (
            <Collapse in={open} key={resource._id}>
              <div>
                {resource.name}
                {index < props.resources.length - 2 && ','}
              </div>
            </Collapse>
          ))}
        </>
      )}
      {}
      <Button onClick={() => setOpen(!open)} aria-expanded={open} size="sm">
        {open ? 'Show less' : `Show more (${props.resources.length})`} ➤
      </Button>
    </>
  );
}

const formatDate = (datetime) => {
  if(datetime){
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(datetime).toLocaleDateString(undefined, options);
  }
  return 'N/A'
};

const truncate = (str, n) => {
  return str.length > n ? `${str.substring(0, n - 1)  }...` : str;
};

export function TasksDetail(props) {
  const [filteredTasks, setFilteredTasks] = useState(props.tasks_filter);
  const {darkMode} = props;

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
      <td className="collapse-column">{task.priority}</td>
      <td>{task.status}</td>
      <td className="tasks-detail-center-cells">
        {task.resources.length <= 2 ? (
          task.resources.map((resource) => <div key={resource._id}>{resource.name}</div>)
        ) : (
          <ShowCollapse resources={task.resources} />
        )}
      </td>
      <td className="tasks-detail-center-cells">
  {task.resources.length <= 2 ? (
    task.resources.map((resource, innerIndex) => (
      <span key={resource._id}>
        {resource.name}
        {innerIndex < task.resources.length - 1 && ', '}
      </span>
    ))
  ) : (
    <ShowCollapse resources={task.resources} />
  )}
</td>

      <td className="tasks-detail-center-cells collapse-column">
        {task.isAssigned ? <div>Assign</div> : <div>Not Assign</div>}
      </td>
      <td className="tasks-detail-center-cells collapse-column">{task.classification}</td>
      <td className="tasks-detail-center-cells">{task.estimatedHours.toFixed(2)}</td>
      <td className="collapse-column">{formatDate(task.startedDatetime)}</td>
      <td className="collapse-column">{formatDate(task.dueDatetime)}</td>
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
            <th className="collapse-column">Priority</th>
            <th>Status</th>
            <th className="tasks-detail-center-cells">Resources</th>
            <th className="tasks-detail-center-cells">Active</th>
            <th className="tasks-detail-center-cells collapse-column">Assign</th>
            <th className="tasks-detail-center-cells collapse-column">Class</th>
            <th className="tasks-detail-center-cells">Estimated Hours</th>
            <th className="collapse-column">Start Date</th>
            <th className="collapse-column">End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-mode' : ''}>{tasksList}</tbody>
      </table>
    </div>
  );
}