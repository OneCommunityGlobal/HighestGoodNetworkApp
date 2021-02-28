import React from 'react'
import './reports.css'
import { Link } from 'react-router-dom'

const  WbsTable = (props) => {
  let WbsList = [];
  if (props.wbs.fetched) {
    if (props.wbs.WBSItems.length > 0) {
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
