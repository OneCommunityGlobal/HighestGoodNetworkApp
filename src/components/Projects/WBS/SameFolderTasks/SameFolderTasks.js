import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

const SameFolderTasks = (props) => {
  console.log("SameFolderTasks props: ", props)
  const taskId = props.match.params.taskId;
  console.log("taskId is: ", taskId)
  const [task, setTask] = useState({});

  useEffect(() => {
    axios
      .get(ENDPOINTS.GET_TASK(taskId))
      .then((res) => {
        setTask(res?.data || {})
      })
      .catch(err => console.log(err));
  }, []);
  console.log("current task is: ", task)

  let wbsId = task.wbsId;
  console.log("wbsId is: ", wbsId)

  if (task.mother === null || task.mother === taskId) {
    function handleClick() {
      props.history.push('/index')
    }
    return (<p onClick={handleClick}>index page</p>)
  } else {
    return (
      <p>the same folder tasks </p>
    )
  }

}

export default SameFolderTasks;