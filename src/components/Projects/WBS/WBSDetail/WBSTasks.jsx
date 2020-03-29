/*********************************************************************************
 * Component: TAKS 
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchAllTasks } from './../../../../actions/task'
import Task from './Task/'
import './wbs.css';
import ReactTooltip from 'react-tooltip'

const WBSTasks = (props) => {

  const wbsId = props.match.params.wbsId;

  useEffect(() => {
    props.fetchAllTasks(wbsId);
  }, [wbsId]);

  return (
    <React.Fragment>
      <ReactTooltip />

      <div className='container' >

        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col" data-tip="WBS ID">#</th>
              <th scope="col" data-tip="Task Name">Task</th>
              <th scope="col" data-tip="Priority">Priority</th>
              <th scope="col" data-tip="Resources">Resources</th>
              <th scope="col" data-tip="Assigned" ><i className="fa fa-user-circle-o" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Status" ><i className="fa fa-tasks" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Best"><i className="fa fa-hourglass-start" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Worst"><i className="fa fa-hourglass" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Hours-Most"><i className="fa fa-hourglass-half" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Estimated Hours"><i className="fa fa-clock-o" aria-hidden="true"></i></th>
              <th scope="col" data-tip="Start Date" ><i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start</th>
              <th scope="col" data-tip="Due Date"><i className="fa fa-calendar-times-o" aria-hidden="true"></i> End</th>
              <th scope="col" data-tip="Links" ><i className="fa fa-link" aria-hidden="true"></i></th>


            </tr>
          </thead>
          <tbody>



            {props.state.tasks.taskItems.map((task, i) =>
              <Task
                key={i + 1}
                index={i + 1}
                name={task.taskName}
                priority={task.priority}
                resources={task.resources[0].name}
                isAssigned={task.isAssigned}
                status={task.status}
                hoursBest={task.hoursBest}
                hoursMost={task.hoursMost}
                hoursWorst={task.hoursWorst}
                estimatedHours={task.estimatedHours}
                startedDatetime={task.startedDatetime}
                dueDatetime={task.dueDatetime}
                links={task.links[0]}

              />)}



          </tbody>
        </table>

      </div>


    </React.Fragment>
  )
}
const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllTasks })(WBSTasks)

