import React, { useState } from 'react'
import { DELETE } from './../../../languages/en/ui'
import './../projects.css'
import { Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import { UserRole } from './../../../utils/enums'
import { connect } from 'react-redux';


const Project = props => {
  console.log(props.auth.user.role);

  const [originName] = useState(props.name)
  const [originCategory] = useState(props.category)
  const [name, setName] = useState(props.name)
  const [category, setCategory] = useState(props.category)
  const [active, setActive] = useState(props.active)

  const updateActive = () => {

    props.onClickActive(props.projectId, name, active)
    setActive(!active);
  }


  const updateProject = () => {
    if (name.length < 3) {
      setName(originName);
    } else if (originName !== name || category != originCategory) {
      props.onUpdateProjectName(props.projectId, name, category, active);
    }
  }


  return (
    <tr className="projects__tr" id={"tr_" + props.projectId}>
      <th className='projects__order--input' scope="row"><div>{props.index + 1}</div></th>
      <td className='projects__name--input'>
        <input type="text" className="form-control" value={name}
          onChange={e => setName(e.target.value)}
          onBlur={updateProject} />
      </td>
      <td className='projects__category--input'>
        {(props.auth.user.role === UserRole.Administrator) ? (
                  <select value={category} onChange={(e) => {
                    setCategory(e.target.value)
                    updateProject();
                  }}>
                  <option default value="Unspecified">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Energy">Energy</option>
                  <option value="Housing">Housing</option>
                  <option value="Education">Education</option>
                  <option value="Society">Society</option>
                  <option value="Economics">Economics</option>
                  <option value="Stewardship">Stewardship</option>
                  <option value="Other">Other</option>
                </select>
          ) :
          category
          }

      </td>
      <td className='projects__active--input' onClick={updateActive}>
        {props.active ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>
      <td>


      <NavItem tag={Link} to={`/inventory/${props.projectId}`}>
        <button type="button" className="btn btn-outline-info"> <i className="fa fa-archive" aria-hidden="true"></i></button>
      </NavItem>

      </td>
      <td>


        <NavItem tag={Link} to={`/project/members/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info"> <i className="fa fa-users" aria-hidden="true"></i></button>
        </NavItem>

      </td>

      <td>

        <NavItem tag={Link} to={`/project/wbs/${props.projectId}`}>
          <button type="button" className="btn btn-outline-info"><i className="fa fa-tasks" aria-hidden="true"></i></button>
        </NavItem>
      </td>

      {(props.auth.user.role === UserRole.Administrator) ? (
        <td>
          <button type="button" className="btn btn-outline-danger"
            onClick={(e) => props.onClickDelete(
              props.projectId,
              props.active,
              props.name)}>{DELETE}</button>
        </td>
      ) : null}

    </tr>
  )
}
const mapStateToProps = state => state;
export default connect(mapStateToProps)(Project)
