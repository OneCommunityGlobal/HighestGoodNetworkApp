import React from 'react';
import { Link } from 'react-router-dom';
import './TeamTable.css';

function TeamTable(props) {
  // Display project lists
  let TeamsList = [];
  if (props.allTeams.length > 0) {
    TeamsList = props.allTeams.map((team, index) => (
      <tr id={`tr_${team._id}`}>
        <th scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/teamreport/${team._id}`} teamId={team._id} teamName={team.teamName}>
            {team.teamName}
          </Link>
        </td>
        <td className="projects__active--input">
          {team.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true" />
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true" />
            </div>
          )}
        </td>
      </tr>
    ));
  }
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th scope="col" id="projects__order">
            #
          </th>
          <th scope="col">Team Name</th>
          <th scope="col" id="projects__active">
            Active
          </th>
        </tr>
      </thead>
      <tbody>{TeamsList}</tbody>
    </table>
  );
}

export default TeamTable;
