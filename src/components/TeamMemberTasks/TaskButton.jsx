import React from 'react';
import { getAllUserProfile } from '~/actions/userManagement';
import { deleteSelectedTask } from './reducer';
import { fetchAllTasks, updateTask } from '~/actions/task';
import { useDispatch } from 'react-redux';
import styles from './style.module.css';

function TaskButton({ task }) {
  const dispatch = useDispatch();

  const markAsDone = async taskDone => {
    const updatedTask = {
      status: 'Complete',
      taskName: taskDone.taskName,
      priority: taskDone.priority,
      resources: taskDone.resources,
      isAssigned: taskDone.isAssigned,
      hoursBest: parseFloat(taskDone.hoursBest),
      hoursWorst: parseFloat(taskDone.hoursWorst),
      hoursMost: parseFloat(taskDone.hoursMost),
      estimatedHours: parseFloat(taskDone.hoursEstimate),
      startedDatetime: taskDone.startedDate,
      dueDatetime: taskDone.dueDate,
      links: taskDone.links,
      whyInfo: taskDone.whyInfo,
      intentInfo: taskDone.intentInfo,
      endstateInfo: taskDone.endstateInfo,
      classification: taskDone.classification,
    };
    await updateTask(String(taskDone._id), updatedTask);
    await deleteSelectedTask(taskDone._id, taskDone.mother);
    await dispatch(getAllUserProfile());
    await fetchAllTasks();
  };

  return (
    task.status !== 'Complete' && (
      <button
        type="button"
        onClick={() => markAsDone(task)}
        style={{ color: 'red' }}
        data-toggle="tooltip"
        data-placement="top"
        title="MARK AS DONE. MARKING THIS AS DONE WOULD REMOVE THE TASK PERMANENTLY."
        className={styles.markAsDoneButton}
      >
        X
      </button>
    )
  );
}

export default TaskButton;
