import React, { useState } from 'react'
import './Team.css'
import { DELETE } from '../../languages/en/ui'


const Team = props => {
  // const [originName] = useState(props.name)
  // const [name, setName] = useState(props.name)
  // const [active, setActive] = useState(props.active)

  // const updateActive = () => {
  // 	props.onClickActive(props.projectId, name, active)
  // 	setActive(!active);
  // }


  // const updateProjectName = () => {
  // 	if (name.length < 3) {
  // 		setName(originName);
  // 	} else if (originName !== name) {
  // 		props.onUpdateProjectName(props.projectId, name, active);
  // 	}
  // }


  return (
    <tr className="projects__tr" id={"tr_" + props.teamId}>
      <th className='projects__order--input' scope="row"><div>{props.index + 1}</div></th>
      <td >
        {props.name}
      </td>
      <td className='projects__active--input' >
        {props.active ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>
      <td><button type="button" className="btn btn-outline-info"><i className="fa fa-users" aria-hidden="true"></i></button></td>

      <td><button type="button" className="btn btn-outline-danger">{DELETE}</button></td>



    </tr>
  )
}
export default Team
