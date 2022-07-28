import React from "react";
import { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import axios from 'axios';
import { NavItem, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { ENDPOINTS } from 'utils/URL';

const SingleTask = (props) => {
  console.log("single task props is: ", props)
  const taskId = props.match.params.taskId;
  console.log("task id is: ", taskId)

  const [task, setTask] = useState({});

  useEffect(() => {
    axios
      .get(ENDPOINTS.GET_TASK(taskId))
      .then((res) => {
        setTask(res?.data || {})
      })
      .catch(err => console.log(err));
  }, []);

  console.log("get task is: ", task)

  return ( 
    <React.Fragment>
      <ReactTooltip />
      <div className="container-single-task">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/project/wbs/{task.wbsId}`}>
              <Button type="button" className="btn btn-secondary">
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </Button>
            </NavItem>
            <div id="single_task_name">{task.taskName}</div>
          </ol>
        </nav>

        <table className="table table-bordered tasks-table">
        <thead>
          <tr>
            <th scope="col" data-tip="task-num" colSpan="1">
              #
            </th>
            <th scope="col" data-tip="Task Name" className="task-name">
              Task Name
            </th>
            <th scope="col" data-tip="Priority">
              <i className="fa fa-star" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Resources">
              <i className="fa fa-users" aria-hidden="true"></i>
            </th>
            <th scope="col" data-tip="Assigned">
              <i className="fa fa-user-circle-o" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Status">
              <i className="fa fa-tasks" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Hours-Best">
              <i className="fa fa-hourglass-start" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Hours-Worst">
              <i className="fa fa-hourglass" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Hours-Most">
              <i className="fa fa-hourglass-half" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Estimated Hours">
              <i className="fa fa-clock-o" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Hours-Logged">
            <i className="fa fa-clock-o" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Start Date">
              <i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start
            </th>
            <th className="desktop-view" scope="col" data-tip="Due Date">
              <i className="fa fa-calendar-times-o" aria-hidden="true"></i> End
            </th>
            <th className="desktop-view" scope="col" data-tip="Links">
              <i className="fa fa-link" aria-hidden="true"></i>
            </th>
            <th className="desktop-view" scope="col" data-tip="Details">
              <i className="fa fa-question" aria-hidden="true"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{task.num}</th>
            <td>{task.taskName}</td>
            <td>{task.priority}</td>
            <td>need more work</td>
            <td>{task.isAssigned}</td>
            <td>{task.isActive}</td>
            <td>{task.hoursBest}</td>
            <td>{task.hoursWorst}</td>
            <td>{task.hoursMost}</td>
            <td>{task.estimatedHours}</td>
            <td>{task.hoursLogged}</td>
            <td>{task.startedDatetime}</td>
            <td>{task.dueDatetime}</td>
            <td>{task.links}</td>
            <td>need more work</td>
          </tr>
        </tbody>

        </table>

      </div>
      
    </React.Fragment>
  );

}

export default SingleTask;