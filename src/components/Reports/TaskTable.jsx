import React from 'react'
import './reports.css'
import { Link } from 'react-router-dom'

const  TaskTable = (props) => {
  // Display project lists
  let TasksList = [];
  // if (props.tasks.taskItems.length > 0) {
  //   TasksList = props.tasks.taskItems.map((task, index) =>
  //     <tr id={"tr_" + task._id}>
  //       <th scope="row"><div>{index + 1}</div></th>
  //       <td>
  //         <Link to={`/tasksreport/${task._id}`} taskId={task._id}>
  //           {task.taskName}
  //         </Link>
  //       </td>
  //       <td>
  //         {task.isActive ?
  //           <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
  //           <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
  //       </td>
  //     </tr>
  //   );
  // }

  return (
    <table class="center">
      <div>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Date</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Priority Level</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Status</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Manager</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
        <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Ready for Review</button>
      </div>
      <table className="table table-bordered table-responsive-sm">
        <thead>
        <tr>
          <th scope="col" id="projects__order">#</th>
          <th scope="col">TASK_NAME</th>
          <th scope="col" id="projects__active">ACTIVE</th>
        </tr>
        </thead>
        <tbody>
        {/*{TasksList}*/}
        </tbody>
      </table>
    </table>
  )

}

export default TaskTable;

