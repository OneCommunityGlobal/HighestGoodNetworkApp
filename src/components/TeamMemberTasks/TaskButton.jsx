import React from 'react';
import { getAllUserProfile } from 'actions/userManagement';
import { deleteSelectedTask } from './reducer';
import { fetchAllTasks, updateTask } from 'actions/task';

import './style.css';
import { useDispatch } from 'react-redux';

const TaskButton = ({ task }) => {
  const dispatch = useDispatch();
  const markAsDone = async task => {
    task.status = 'Complete';
    const updatedTask = {
      taskName: task.taskName,
      priority: task.priority,
      resources: task.resources,
      isAssigned: task.isAssigned,
      status: task.status,
      hoursBest: parseFloat(task.hoursBest),
      hoursWorst: parseFloat(task.hoursWorst),
      hoursMost: parseFloat(task.hoursMost),
      estimatedHours: parseFloat(task.hoursEstimate),
      startedDatetime: task.startedDate,
      dueDatetime: task.dueDate,
      links: task.links,
      whyInfo: task.whyInfo,
      intentInfo: task.intentInfo,
      endstateInfo: task.endstateInfo,
      classification: task.classification,
    };
    await updateTask(String(task._id), updatedTask);
    await deleteSelectedTask(task._id, task.mother);
    await dispatch(getAllUserProfile());
    await fetchAllTasks();
  };

  return (
    <>
      {task.status !== 'Complete' ? (
        <h3
          onClick={() => markAsDone(task)}
          style={{ color: 'red' }}
          data-toggle="tooltip"
          data-placement="top"
          title="MARK AS DONE. MARKING THIS AS DONE WOULD REMOVE THE TASK PERMANENTLY."
          className="markAsDoneButton"
        >
          X
        </h3>
      ) : (
        <></>
      )}
    </>
  );
};

export default TaskButton;
