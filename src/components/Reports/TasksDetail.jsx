import React from 'react'
import './reports.css'

const  TasksDetail = (props) => {
  let tasksList=[]
  tasksList = props.tasks_filter[0].map((item, index) =>
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
        {(item.status)}
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
