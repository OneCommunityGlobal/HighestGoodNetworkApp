import { getAllUserProfile } from 'actions/userManagement';
import { fetchAllTasks, updateTask } from 'actions/task';

import './style.css';
import { useDispatch } from 'react-redux';
import { deleteSelectedTask } from './reducer';

function TaskButton({ task }) {
  const dispatch = useDispatch();

  const markAsDone = async t => {
    // eslint-disable-next-line no-param-reassign
    t.status = 'Complete';
    const updatedTask = {
      taskName: t.taskName,
      priority: t.priority,
      resources: t.resources,
      isAssigned: t.isAssigned,
      status: t.status,
      hoursBest: parseFloat(t.hoursBest),
      hoursWorst: parseFloat(t.hoursWorst),
      hoursMost: parseFloat(t.hoursMost),
      estimatedHours: parseFloat(t.hoursEstimate),
      startedDatetime: t.startedDate,
      dueDatetime: t.dueDate,
      links: t.links,
      whyInfo: t.whyInfo,
      intentInfo: t.intentInfo,
      endstateInfo: t.endstateInfo,
      classification: t.classification,
    };
    await updateTask(String(task._id), updatedTask);
    await deleteSelectedTask(task._id, task.mother);
    await dispatch(getAllUserProfile());
    await fetchAllTasks();
  };

  return task.status !== 'Complete' ? (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
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
  ) : null;
}

export default TaskButton;
