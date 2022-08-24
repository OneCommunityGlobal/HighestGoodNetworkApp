import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

const SameFolderTasks = (props) => {
  console.log("SameFolderTasks props: ", props)
  const taskId = props.match.params.taskId;
  console.log("taskId is: ", taskId)
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
  console.log("current task is: ", task)

  useEffect(() => {
    axios
      .get(ENDPOINTS.GET_WBS(wbsId))
      .then((res) => {
        setWBS(res?.data || {})
      })
      .catch(err => console.log(err));
  }, [])

  console.log("wbs is: ", WBS)
  let projectId = WBS.projectId;
  let wbsName = WBS.wbsName;

  if (task.mother === null || task.mother === taskId) {
    function handleClick() {
      props.history.push(`/wbs/tasks/${wbsId}/${projectId}/${wbsName}`)
    }
    return (<p onClick={handleClick}>No such folder, click here leading to the WBS contains "{task.taskName}"</p>)
  } else {
    return (
      <p>the same folder tasks </p>
    )
  }

}

export default SameFolderTasks;