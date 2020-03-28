/*********************************************************************************
 * Component: TAK
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'

const Task = (props) => {


  return (
    <React.Fragment>
      <tr>
        <th scope="row">{props.index}</th>
        <td>
          <div>
            {props.level === 1 ? <div className='level-space-1'></div> : null}
            {props.level === 2 ? <div className='level-space-2'></div> : null}
            {props.level === 3 ? <div className='level-space-3'></div> : null}
            {props.name}
          </div>
        </td>
        <td>{props.priority}</td>
        <td>{props.resources}</td>
        <td>{props.isAssigned ? "Yes" : "No"}</td>
        <td>{props.status}</td>
        <td>{props.hoursBest}</td>
        <td>{props.hoursWorst}</td>
        <td>{props.hoursMost}</td>
        <td>{props.estimatedHours}</td>
        <td>{typeof props.startedDateTime}</td>
        <td>{props.dueDateTime}</td>
        <td>{props.links}</td>
      </tr>
    </React.Fragment>
  )
}

export default connect(null)(Task)

