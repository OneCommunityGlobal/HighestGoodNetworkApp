import React from 'react';
import { Link } from 'react-router-dom';
import './reports.css';

const TeamTable = (props) => {
  // Display project lists
  let TeamsList = [];
  if (props.allTeams.length > 0) {
    TeamsList = props.allTeams.map((team, index) => (
      <tr id={'tr_' + team._id}>
        <th scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/teamreport/${team._id}`} teamId={team._id} value={team.teamName}>
            {team.teamName}
          </Link>
        </td>
        <td className="projects__active--input">
          {team.isActive ? (
            <div className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i>
            </div>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true"></i>
            </div>
          )}
        </td>
      </tr>
    ));
  }

  return (
    <table className="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr>
            <th scope="col" id="projects__order">
              #
            </th>
            <th scope="col">TEAM_NAME</th>
            <th scope="col" id="projects__active">
              ACTIVE
            </th>
          </tr>
        </thead>
        <tbody>{TeamsList}</tbody>
      </table>
    </table>
  );
};

export default TeamTable;
