/*********************************************************************************
 * Component: MEMBER 
 * Author: Henry Ng - 02/03/20
 * Display member of the members list 
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import { assignProject } from './../../../../actions/projectMembers'

const WBSItem = (props) => {

  return (
    <React.Fragment>
      <tr className="members__tr">
        <th scope="row"><div>{props.index}</div></th>
        <td className='members__name'>
          <a href={`/wbs/tasks/${props.wbsId}`}>
            {props.name}
          </a>
        </td>

        <td className='members__assign'>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={(e) => props.assignProject(props.projectId, props.uid, "unAssign", props.firstName, props.lastName)}>
            <i className="fa fa-minus" aria-hidden="true"></i>
          </button>
        </td>

      </tr>
    </React.Fragment>
  )
}

export default connect(null, { assignProject })(WBSItem)

