/*********************************************************************************
 * Component: FOUND USER 
 * Author: Henry Ng - 02/08/20
 * Display users which were found
 ********************************************************************************/
import React from 'react'

const Member = (props) => {


  const assignNewUser = () => {

  }

  return (
    <React.Fragment>

      <tr className="members__tr">
        <th scope="row"><div>{props.index + 1}</div></th>
        <td className='foundUsers__order'>
          <a href={`/userprofile/${props.uid}`}>
            {props.fullName}
          </a>
        </td>
        <td className='foundUsers__email'>
          {props.email}
        </td>
        <td className='foundUsers__assign'>
          <button className="btn btn-outline-primary btn-sm" type="button" onClick={(e) => props.assignNewUser(props.uid)}>
            <i className="fa fa-plus" aria-hidden="true"></i>
          </button>
        </td>
      </tr>
    </React.Fragment>
  )
}

export default Member

