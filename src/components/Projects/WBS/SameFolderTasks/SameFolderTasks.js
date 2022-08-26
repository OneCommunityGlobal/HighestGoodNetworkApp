import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

const SameFolderTasks = (props) => {
  const taskId = props.match.params.taskId;
  const [task, setTask] = useState({});
  const [wbsId, setWBSId] = useState("");
  const [WBS, setWBS] = useState({});

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const res = await axios.get(ENDPOINTS.GET_TASK(taskId));
        setTask(res?.data || {});
        setWBSId(res?.data.wbsId || "");
      } catch (error) {
        console.log(error);
      }
    }
    fetchTaskData();
  }, []);

  useEffect(() => {
    const fetchWBSData = async () => {
      try {
        const res = axios.get(ENDPOINTS.GET_WBS(wbsId));
        setWBS(res?.data || {})
      } catch (error) {
        console.log(error);
      }
    }
    fetchWBSData();
  }, [])

  let projectId = WBS.projectId;
  let wbsName = WBS.wbsName;

  if (task.mother === null || task.mother === taskId) {
    return (
      <div className="App">
        <p>This task doesn't have tasks in the same folder as itself</p>
        <a href={`/wbs/tasks/${wbsId}/${projectId}/${wbsName}`}>Click here linking to the WBS contains this task {wbsName}</a>
      </div>
    );
  } else {
    return (
      <p>the same folder tasks </p>
    );
  }

}

export default SameFolderTasks;