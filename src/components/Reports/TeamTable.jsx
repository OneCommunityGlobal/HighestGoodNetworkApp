
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


//
// import React from 'react';
// import '../Teams/Team.css';
//
// const TeamTable = props => (
//
//
//   <tr className="teams__tr" id={`tr_${props.teamId}`}>
//     <th className="teams__order--input" scope="row"><div>{props.index + 1}</div></th>
//     <td>
//       {props.name}
//     </td>
//     <td className="teams__active--input" onClick={(e) => { props.onStatusClick(props.name, props.teamId, props.active); }}>
//       {props.active
//         ? <div className="isActive"><i className="fa fa-circle" aria-hidden="true" /></div>
//         : <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true" /></div>}
//     </td>
//
//
//   </tr>
// );
// export default TeamTable;


import React from 'react'
import { Link } from 'react-router-dom'

import AllProjects from './AllProjects'

const  TeamTable = (props) => {
  // Display project lists
  let TeamsList = [];
  if (props.allTeams.length > 0) {
    TeamsList = props.allTeams.map((team, index) =>

      <tr className="projects__tr" id={"tr_" + team._id}>
        <th className='projects__order--input' scope="row"><div>{index + 1}</div></th>
        <td className='projects__name--input'>
          {/*<input type="text" className="form-control" value={team.teamName}*/}
          {/*       teams            />*/}

          <Link to={`/teamreport/${team._id}`} teamId={team._id} value={team.teamName}>
            {team.teamName}
          </Link>

        </td>
        <td className='projects__active--input' >
          {team.isActive ?
            <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div> :
            <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
        </td>
      </tr>
    );
  }

  return (
    <table>
    <div>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Date</button>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Priority Level</button>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Status</button>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Manager</button>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Estimated Hours</button>
      <button style={{margin:'3px'}} exact className="btn btn-secondary btn-bg mt-3">Ready for Review</button>
    </div>

    <table className="table table-bordered table-responsive-sm">

      <thead>
      <tr>
        <th scope="col" id="projects__order">#</th>
        <th scope="col">TEAM_NAME</th>
        <th scope="col" id="projects__active">ACTIVE</th>
      </tr>
      </thead>
      <tbody>
      {TeamsList}
      </tbody>
    </table>
    </table>
  )

}

export default TeamTable;
