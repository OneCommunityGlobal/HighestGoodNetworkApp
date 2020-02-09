/*********************************************************************************
 * Component: MEMBER 
 * Author: Henry Ng - 02/03/20
 * Display member of the members list 
 ********************************************************************************/
import React from 'react'
const Member = (props) => {

  const unAssignMember = () => {

  }
  return (
    <React.Fragment>

      <tr className="members__tr">
        <th scope="row"><div>{props.index + 1}</div></th>
        <td className='members__name'>
          <a href={`/userprofile/${props.uid}`}>
            {props.fullName}
          </a>
        </td>

        <td className='members__assign'>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={(e) => props.unAssignMember(props.uid)}>
            <i className="fa fa-minus" aria-hidden="true"></i>
          </button>
        </td>

      </tr>
    </React.Fragment>
  )
}

export default Member

