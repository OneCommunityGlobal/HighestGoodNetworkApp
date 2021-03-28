import React from 'react'
import './reports.css'


const  TasksDetail = (props) => {
  let tasksList=[]
  let tasks=[]
  tasks = props.tasks_filter[0].filter(item =>  item.isActive ===props.isActive
    && item.isAssigned ===props.isAssigned);
  if (!(props.priority === "")){
    tasks=tasks.filter(item=>item.priority ==props.priority)
  }

  if (!(props.status === "")){
    tasks=tasks.filter(item=>item.status ==props.status)
  }


  tasksList = tasks.map((item, index) =>
    <tr id={"tr_" + item._id}>
      <th scope="row">
        <div>{index + 1}</div>
      </th>
      <td>
        {item.taskName}
      </td>
      <td>
        {item.priority}
      </td>
      <td>
        {item.status}
      </td>
      <td>
        {item.startedDatetime}
      </td>
      <td>
        {item.dueDatetime}
      </td>

      <td className='projects__active--input' >
        {item.isActive ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>

      <td className='projects__active--input' >
        {item.isAssigned ?
          <div className="isActive">Assign</div> :
          <div className="isNotActive">Not Assign</div>}
      </td>
    </tr>
  )
  return (
    <table class="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
        <tr>
          <th scope="col" id="projects__order">#</th>
          <th scope="col">Task Name</th>
          <th scope="col" id="projects__active">Priority</th>
          <th scope="col" id="projects__active">Status</th>
          <th scope="col" id="projects__active">startedDate</th>
          <th scope="col" id="projects__active">dueDate</th>
          <th scope="col" id="projects__active">isActive</th>
          <th scope="col" id="projects__active">isAssigned</th>
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
