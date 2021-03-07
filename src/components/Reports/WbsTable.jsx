import React from 'react'
import './reports.css'
import TasksTable from './TasksTable'

const  WbsTable = (props) => {
  let WbsList = [];
  if (props.wbs.fetched) {
    if (props.wbs.WBSItems.length > 0) {
      let WbsTasksID = []
      for (var i = 0; i < props.wbs.WBSItems.length; i++) {
        WbsTasksID.push(props.wbs.WBSItems[i]._id);
      }
      WbsList = props.wbs.WBSItems.map((item, index) =>
        <tr id={"tr_" + item._id}>
          <th scope="row">
            <div>{index + 1}</div>
          </th>
          <td>
             {item.wbsName}
          </td>
          <td>
            {String(item.isActive)}
          </td>
          <td>

            <TasksTable WbsTasksID={WbsTasksID}/>
          </td>
        </tr>
      );
    }
  }
  return (
    <table class="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
        <tr>
          <th scope="col" id="projects__order">#</th>
          <th scope="col">WBS_NAME</th>
          <th scope="col" id="projects__active">ACTIVE</th>
          <th scope="col" id="projects__active">Tasks</th>
        </tr>
        </thead>
        <tbody>
        {WbsList}
        </tbody>
      </table>
    </table>
  )

}

export default WbsTable;
