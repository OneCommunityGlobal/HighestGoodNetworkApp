/*********************************************************************************
 * Component: TAKS 
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchAllTasks } from './../../../../actions/task'
import Task from './Task/'
import './wbs.css';

const WBSTasks = (props) => {

  const wbsId = props.match.params.wbsId;

  useEffect(() => {
    props.fetchAllTasks(wbsId);
  }, [wbsId]);

  return (
    <React.Fragment>

      <div className='container' >

        <table className="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Task</th>
              <th scope="col">Priority</th>
              <th scope="col">Resources</th>
              <th scope="col" data-toggle="tooltip" data-placement="top" title="Tooltip on top" ><i className="fa fa-user-circle-o" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-tasks" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-hourglass-start" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-hourglass" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-hourglass-half" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-clock-o" aria-hidden="true"></i></th>
              <th scope="col"><i className="fa fa-calendar-check-o" aria-hidden="true"></i> Start</th>
              <th scope="col"><i className="fa fa-calendar-times-o" aria-hidden="true"></i> End</th>
              <th scope="col"><i className="fa fa-link" aria-hidden="true"></i></th>


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

