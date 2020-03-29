/*********************************************************************************
 * Component: TAK
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'

const Task = (props) => {
  const startedDate = new Date(props.startedDatetime);
  const dueDate = new Date(props.dueDatetime);

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
        <td>
          {(startedDate.getMonth() + 1)}/{startedDate.getDate()}/{startedDate.getFullYear()}
          <br />
        </td>
        <td>
          {(dueDate.getMonth() + 1)}/{dueDate.getDate()}/{dueDate.getFullYear()}
        </td>
        <td>{props.links}</td>
      </tr>
    </React.Fragment>
  )
}

export default connect(null)(Task)

