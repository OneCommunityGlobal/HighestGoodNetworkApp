import './reports.css'
import React, { useState } from "react";
import { Button, Dropdown, DropdownButton } from 'react-bootstrap'
import EditTaskModal from "./../Projects/WBS/WBSDetail/EditTask/EditTaskModal";
import "react-table/react-table.css";
import Collapse from 'react-bootstrap/Collapse'

const ShowCollapse = props => {
  const [open, setOpen] = useState(false);
return(
  <div>
  <Button
    onClick={() => setOpen(!open)}
    aria-expanded={open}>

  </Button>
    <div>
      {props.resources[0].name}
      </div>

    {props.resources.slice(1).map(resource => (
    <Collapse in={open}>
          <div key={resource._id} white-space="pre-line" white-space="nowrap" className="new-line">
          {resource.name}
          </div>
        </Collapse>
      ))}
   </div>

)
}
const  TasksDetail = (props) => {
  let tasksList=[]
  let tasks=[]
  tasks=props.tasks_filter
  if (props.tasks_filter.length > 0) {
    if (!(props.isActive === "" )) {
      tasks = tasks.filter(item => item.isActive === props.isActive
        );
    }
    if (!(props.isAssigned ==="")) {
      tasks = tasks.filter(item => item.isAssigned === props.isAssigned);
    }

    if (!(props.priority === "")) {
      tasks=tasks.filter(item => item.priority == props.priority)
    }
    if(props.priority ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }
    if(props.status ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }
    if(props.classification ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }
    if(props.users ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }
    if(props.isAssigned ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }
    if(props.users ==="No filter"){
      tasks=props.tasks_filter.filter(item => item.isActive === props.isActive)
    }

    if (!(props.status === "")) {
      tasks = tasks.filter(item => item.status == props.status)
    }
    if  (!(props.classification === "")) {
      tasks=tasks.filter(item => item.classification === props.classification)
    }

    if  (!(props.users === "")) {
      let test=[]
      for(var i = 0; i < tasks.length; i++) {
        for (var j=0;j< tasks[i].resources.length;j++){
          if (tasks[i].resources[j].name===props.users){
            test.push(tasks[i])
          }
        }
      }
      tasks=test
    }

  }

  tasksList = tasks.map((task, index) =>
    <tr id={"tr_" + task._id}>
      <th scope="row">
          <EditTaskModal
            key={`editTask_${task._id}`}
            parentNum={task.num}
            taskId={task._id}
            wbsId={task.wbsId}
            parentId1={task.parentId1}
            parentId2={task.parentId2}
            parentId3={task.parentId3}
            mother={task.mother}
            level={task.level}
          />
      </th>
      <th scope="row">
        <div>{index + 1}</div>
      </th>
      <td>
        {task.taskName}
      </td>
      <td>
        {task.priority}
      </td>
      <td>
        {task.status}
      </td>
      <td>
        {task.resources.length<=2 ?
          task.resources.map(resource => (
              <div key={resource._id}>{resource.name}</div>
          ))
          :
          <ShowCollapse resources={task.resources}/>
        }
      </td>


      <td className='projects__active--input'>
        {task.isActive ?
          <tasks className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></tasks> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>

      <td className='projects__active--input'>
        {task.isAssigned ?
          <div className="isActive">Assign</div> :
          <div className="isNotActive">Not Assign</div>}
      </td>
      <td className='projects__active--input'>
        {task.classification}
      </td>
      <td className='projects__active--input'>
        {task.estimatedHours.toFixed(2)}
      </td>
      <td>
        {task.startedDatetime}
      </td>
      <td>
        {task.dueDatetime}
      </td>
    </tr>
  )

  return (
    <div>
      <h2>Total: {tasksList.length}</h2>
      <div className="table-responsive-sm">
      <table className="table table-bordered table-responsive-sm">
        <thead>
        <tr>
          <th scope="col" id="projects__order">Action</th>
          <th scope="col" id="projects__order">#</th>
          <th scope="col" id="projects__active">Task</th>
          <th scope="col" id="projects__active">Priority</th>
          <th scope="col" id="projects__active">Status</th>
          <th scope="col" >Resources</th>
          <th scope="col" id="projects__active">Active</th>
          <th scope="col" id="projects__active">Assign</th>
          <th scope="col" id="projects__active">Class</th>
          <th scope="col" id="projects__active">Estimated Hours</th>
          <th scope="col" id="projects__active">Start Date</th>
          <th scope="col" id="projects__active">End Date</th>
        </tr>
        </thead>
        <tbody>
        {tasksList}
        </tbody>
      </table>
     </div>
      </div>
  )

}

export default TasksDetail;
