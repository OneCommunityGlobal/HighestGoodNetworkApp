import './reports.css'
import React, { useState } from "react";
import { Button, Dropdown, DropdownButton } from 'react-bootstrap'
import EditTaskModal from "./../Projects/WBS/WBSDetail/EditTask/EditTaskModal";


import Collapse from 'react-bootstrap/Collapse'
const ShowCollapse = props => {
  const [open, setOpen] = useState(false);
return(
  <div>
  <Button
    onClick={() => setOpen(!open)}
    aria-controls="example-collapse-text"
    aria-expanded={open}>
    View
  </Button>

    {props.resources.map(resource => (
    <Collapse in={open}>
          <div id="example-collapse-text" className="new-line" key={resource._id}>
            <li>{resource.name}</li>
          </div>
        </Collapse>
      ))}
   </div>

)
}

const  TasksDetail = (props) => {

  // console.log('here4')
  // console.log(props)
  let tasksList=[]
  let tasks=[]
  tasks=props.tasks_filter
  // tasks = props.tasks_filter.filter(item =>  item.isActive ===props.isActive
  //   && item.isAssigned ===props.isAssigned);
  // if (!(props.priority === "")){
  //   tasks=tasks.filter(item=>item.priority ==props.priority)
  // }
  //
  // if (!(props.status === "")){
  //   tasks=tasks.filter(item=>item.status ==props.status)
  // }

console.log('tasks 9999999')
  console.log(tasks)
  tasksList = tasks.map((task, index) =>
    <tr id={"tr_" + task._id}>
      <th scope="row">
        {/*<Button>*/}
        {/*  Edit*/}
        {/*</Button>   */}
        {/*<td>*/}
          <EditTaskModal
            key={`editTask_${task._id}`}
            parentNum={task.num}
            taskId={task._id}
            // projectId={task.projectId}
            wbsId={task.wbsId}
            parentId1={task.parentId1}
            parentId2={task.parentId2}
            parentId3={task.parentId3}
            mother={task.mother}
            level={task.level}
          />
        {/*</td>*/}
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
        {task.startedDatetime}
      </td>
      <td>
        {task.dueDatetime}
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


        {task.resources.length<=2 ?
          task.resources.map(resource => (
            <div className="new-line" key={resource._id}>
              <li>{resource.name}</li>
            </div>
          ))
          :
          <ShowCollapse resources={task.resources}/>
          // <showCollapse resources={ }/>

        }
      </td>

      <td className='projects__active--input'>
        {task.estimatedHours.toFixed(2)}
      </td>
    </tr>
  )

  return (
    <table class="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
        <tr>
          <th scope="col" id="projects__order">Action</th>

          <th scope="col" id="projects__order">#</th>
          <th scope="col">Task Name</th>
          <th scope="col" id="projects__active">Priority</th>
          <th scope="col" id="projects__active">Status</th>
          <th scope="col" id="projects__active">startedDate</th>
          <th scope="col" id="projects__active">dueDate</th>
          <th scope="col" id="projects__active">isActive</th>
          <th scope="col" id="projects__active">isAssigned</th>
          <th scope="col" id="projects__active">classification</th>
          <th scope="col" id="projects__active">resources</th>
          <th scope="col" id="projects__active">Estimated Hours</th>
        </tr>
        </thead>
        <tbody>
        {tasksList}
        </tbody>
      </table>
    </table>
  )

}

export default TasksDetail;
