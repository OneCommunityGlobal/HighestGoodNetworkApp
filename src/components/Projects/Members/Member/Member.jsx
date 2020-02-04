/*********************************************************************************
 * Component: MEMBER 
 * Author: Henry Ng - 02/03/20
 * Display member of the members list 
 ********************************************************************************/
import React from 'react'

const Member = (props) => {
  return (
    <React.Fragment>

      <tr className="members__tr">
        <th scope="row"><div>{props.index + 1}</div></th>
        <td className='members__name'>
          {props.fullName}
        </td>
        <td >

        </td>
      </tr>
    </React.Fragment>
  )
}

export default Member

