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
        <th scope="row">{props.num}</th>
        <td>
          {props.level === 1 ? <div className='level-space-1' data-tip="Level 1">{props.name}</div> : null}
          {props.level === 2 ? <div className='level-space-2' data-tip="Level 2">{props.name}</div> : null}
          {props.level === 3 ? <div className='level-space-3' data-tip="Level 3">{props.name}</div> : null}
          {props.level === 4 ? <div className='level-space-4' data-tip="Level 4">{props.name}</div> : null}

        </td>
        <td>
          {props.priority === "Primary" ? <i data-tip="Primary" class="fa fa-star" aria-hidden="true"></i> : null}
          {props.priority === "Secondary" ? <i data-tip="Secondary" class="fa fa-star-half-o" aria-hidden="true"></i> : null}
          {props.priority === "Tertiary" ? <i data-tip="Tertiary" class="fa fa-star-o" aria-hidden="true"></i> : null}

        </td>
        <td><a data-tip={props.resources[0].name} href={`/userprofile/${props.resources[0].userID}`}><span class="dot">{props.resources[0].name.substring(0, 2)}</span></a></td>
        <td>{props.isAssigned ? <i data-tip="Assigned" class="fa fa-check-square" aria-hidden="true"></i> : <i data-tip="Not Assigned" class="fa fa-square-o" aria-hidden="true"></i>}</td>
        <td>{props.status === "Started" ? <button><i data-tip="Started" class="fa fa-pause" aria-hidden="true"></i></button> : <button><i data-tip="Not Started" class="fa fa-play" aria-hidden="true"></i></button>}</td>
        <td data-tip="Hours-Best" >{props.hoursBest}</td>
        <td data-tip="Hours-Worst" >{props.hoursWorst}</td>
        <td data-tip="Hours-Most" >{props.hoursMost}</td>
        <td data-tip="Estimated Hours" >{props.estimatedHours}</td>
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

