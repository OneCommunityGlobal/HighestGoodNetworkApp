import React from 'react';
import './reports.css';
import TasksTable from './TasksTable';

const WbsTable = (props) => {
  let WbsList = [];
  let WbsTasksID = [];
  let tasksTable = [];
  if (props.wbs.fetched) {
    if (props.wbs.WBSItems.length > 0) {
      for (var i = 0; i < props.wbs.WBSItems.length; i++) {
        WbsTasksID.push(props.wbs.WBSItems[i]._id);
      }
      WbsList = props.wbs.WBSItems.map((item, index) => (
        <tr id={'tr_' + item._id} key={item._id}>
          <th scope="row">
            <div>{index + 1}</div>
          </th>
          <td>{item.wbsName}</td>
          <td className="projects__active--input">
            {item.isActive ? (
              <tasks className="isActive">
                <i className="fa fa-circle" aria-hidden="true"></i>
              </tasks>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true"></i>
              </div>
            )}
          </td>
          <td>{item._id}</td>
        </tr>
      ));
      tasksTable = (
        <table>
          <TasksTable WbsTasksID={WbsTasksID} />
        </table>
      );
    }
  }

  return (
    <div>
      <table class="center">
        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
              <th scope="col" id="projects__order">
                #
              </th>
              <th scope="col">WBS_NAME</th>
              <th scope="col" id="projects__active">
                ACTIVE
              </th>
              <th scope="col" id="projects__active">
                wbs ID
              </th>
            </tr>
          </thead>
          <tbody>{WbsList}</tbody>
        </table>
      </table>
      {tasksTable}
    </div>
  );
};

export default WbsTable;
