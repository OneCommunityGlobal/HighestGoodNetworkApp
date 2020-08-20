import React from 'react';
import './Team.css';
import { DELETE } from '../../languages/en/ui';

<<<<<<< HEAD
const Team = (props) => {

  // const [active, setActive] = useState(props.active)

  // const updateActive = () => {
  //   props.onClickActive(props.teamId, props.name, active)
  //   setActive(!active);
  // }

  return (
    <tr className="teams__tr" id={"tr_" + props.teamId}>
      <th className='teams__order--input' scope="row"><div>{props.index + 1}</div></th>
      <td >
        {props.name}
      </td>
      <td className='teams__active--input' onClick={(e) => { props.onStatusClick(props.name, props.teamId, props.active) }} >
        {props.active ?
          <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
          <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
      </td>
      <td><button type="button" className="btn btn-outline-info" onClick={(e) => { props.onMembersClick() }}>
        <i className="fa fa-users" aria-hidden="true"></i></button></td>

      <td><button type="button" className="btn btn-outline-danger" onClick={(e) => { props.onDeleteClick(props.name, props.teamId) }}>{DELETE}</button></td>



    </tr>
  )
}
export default Team
=======
const Team = (props) => (
  <tr className="teams__tr" id={`tr_${props.teamId}`}>
    <th className="teams__order--input" scope="row"><div>{props.index + 1}</div></th>
    <td>
      {props.name}
    </td>
    <td className="teams__active--input">
      {props.active
        ? <div className="isActive"><i className="fa fa-circle" aria-hidden="true" /></div>
        : <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true" /></div>}
    </td>
    <td>
      <button type="button" className="btn btn-outline-info" onClick={(e) => { props.onMembersClick(); }}>
        <i className="fa fa-users" aria-hidden="true" />
      </button>
    </td>

    <td><button type="button" className="btn btn-outline-danger" onClick={(e) => { props.onDeleteClick(props.name); }}>{DELETE}</button></td>
  </tr>
);
export default Team;
>>>>>>> ac8edac0c5eaf4194d50ff3e08e2b680afc4490d
