
// const  TeamTable = () => {
//
//   return (
//     <tr>
//       <th scope="col" id="teams__order">#</th>
//       <th scope="col">TEAM_NAME</th>
//       <th scope="col" id="teams__active">ACTIVE</th>
//     </tr>
//   )
//
// }

// export default TeamTable;



import React from 'react';
import '../Teams/Team.css';

const TeamTable = props => (


  <tr className="teams__tr" id={`tr_${props.teamId}`}>
    <th className="teams__order--input" scope="row"><div>{props.index + 1}</div></th>
    <td>
      {props.name}
    </td>
    <td className="teams__active--input" onClick={(e) => { props.onStatusClick(props.name, props.teamId, props.active); }}>
      {props.active
        ? <div className="isActive"><i className="fa fa-circle" aria-hidden="true" /></div>
        : <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true" /></div>}
    </td>


  </tr>
);
export default TeamTable;
