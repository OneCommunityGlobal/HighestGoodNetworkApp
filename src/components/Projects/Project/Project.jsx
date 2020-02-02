import React, { useState } from 'react'
import { DELETE } from './../../../languages/en/ui'
import './../projects.css'
import { Route, Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import Members from './../Members'
const Project = (props) => {

  const [name, setName] = useState(props.name);
  const [active, setActive] = useState(props.active);

  const updateActive = () => {
    //setActive(!active);
    props.onClickActive(props.projectId, props.name, active)
  }

  return (
    <tr className="projects__tr" id={"tr_" + props.projectId}>
      <th className='projects__order--input' scope="row"><div>{props.index + 1}</div></th>
      <td className='projects__name--input'><input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} /></td>
      <td className='projects__active--input' onClick={updateActive}>
        {props.active ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>
      <td>


        <NavItem tag={Link} to={`/project/members/`}>
          <button type="button" className="btn btn-outline-info"> <i className="fa fa-users" aria-hidden="true"></i></button>
        </NavItem>
      </td>
      <td><button type="button" className="btn btn-outline-info"><i className="fa fa-tasks" aria-hidden="true"></i></button></td>
      <td><button type="button" className="btn btn-outline-danger"
        onClick={(e) => props.onClickDelete(
          props.projectId,
          props.active,
          props.name)}>{DELETE}</button></td>
    </tr>
  )
}
export default Project;