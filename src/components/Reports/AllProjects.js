import React, { useState } from 'react'


const AllProjects = props => {
  const [originName] = useState(props.name)
  const [name, setName] = useState(props.name)
  const [active, setActive] = useState(props.active)



  return (
    <tr className="projects__tr" id={"tr_" + props.projectId}>
      <th className='projects__order--input' scope="row"><div>{props.index + 1}</div></th>
      <td className='projects__name--input'>
        <input type="text" className="form-control" value={name}
               onChange={e => setName(e.target.value)}
               />
      </td>
      <td className='projects__active--input' >
        {props.active ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>

    </tr>
  )
}
export default AllProjects
