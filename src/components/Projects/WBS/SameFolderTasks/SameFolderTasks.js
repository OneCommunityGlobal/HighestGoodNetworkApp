import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

function SameFolderTasks(props) {
  const { taskId } = props.match.params;
  const [task, setTask] = useState({});
  const [wbsId, setWBSId] = useState('');
  const [WBS, setWBS] = useState({});

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(taskId));
        setTask(res?.data || {});
        setWBSId(res?.data.wbsId || '');
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskData();
  }, []);

  useEffect(() => {
    const fetchWBSData = async () => {
      try {
        const res = axios.get(ENDPOINTS.GET_WBS(wbsId));
        setWBS(res?.data || {});
      } catch (error) {
        console.log(error);
      }
    };
    fetchWBSData();
  }, []);

  const { projectId } = WBS;
  const { wbsName } = WBS;

  if (task.mother === null || task.mother === taskId) {
    return (
      <div className="App">
        <p>There are no other tasks in this task's folder.</p>
        <a href={`/wbs/tasks/${wbsId}/${projectId}/${wbsName}`}>
          Click here to visit the source WBS that contains this task
          {wbsName}
        </a>
      </div>
    );
  }
  return (
    <p>the same folder tasks </p>
  );
}

export default SameFolderTasks;
