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
    axios
      .get(ENDPOINTS.GET_TASK(taskId))
      .then((res) => {
        setTask(res?.data || {});
        setWBSId(res?.data.wbsId || "");
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get(ENDPOINTS.GET_WBS(wbsId))
      .then((res) => {
        setWBS(res?.data || {})
      })
      .catch(err => console.log(err));
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