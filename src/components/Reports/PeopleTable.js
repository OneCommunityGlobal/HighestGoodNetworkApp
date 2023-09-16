import React from 'react';
import '../Teams/Team.css';
import { Link } from 'react-router-dom';
import './reports.css';
import moment from 'moment';

function PeopleTable(props) {
  let PeopleList = [];
  if (props.userProfiles.length > 0) {
    PeopleList = props.userProfiles
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
      .map((person, index) => (
        <tr className="teams__tr" id={`tr_${person._id}`} key={person._id}>
          <th className="teams__order--input" scope="row">
            <div>{index + 1}</div>
          </th>
          <td>
            <Link to={`/peoplereport/${person._id}`}>
              {person.firstName}{' '}
              {person.lastName.length > 15 ? person.lastName.slice(0, 15) + '...' : person.lastName}
            </Link>
          </td>
          <td
            className="teams__active--input"
            onClick={e => {
              person.onStatusClick(person.firstName, person._id, person.isActive);
            }}
          >
            {person.isActive ? (
              <div className="isActive">
                <i className="fa fa-circle" aria-hidden="true" />
              </div>
            ) : (
              <div className="isNotActive">
                <i className="fa fa-circle-o" aria-hidden="true" />
              </div>
            )}
          </td>
          <td className="hide-mobile-start-end" style={{width: '110px'}}>{moment(person.createdDate).format('MM-DD-YY')}</td>
          <td className="hide-mobile-start-end" style={{width: '110px'}}>{moment(person.endDate).format('MM-DD-YY') || 'N/A'}</td>
          {/* <td>
          {person.blueSquares||"N/A"}
        </td> */}
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
          <th scope="col">Person Name</th>
          <th scope="col" id="projects__active">
            Active
          </th>
          <th className="hide-mobile-start-end" scope="col">
            Start Date
          </th>
          <th className="hide-mobile-start-end" scope="col">
            End Date
          </th>
          {/* <th scope="col">Blue Squares</th> */}
        </tr>
      </thead>
      <tbody>{PeopleList}</tbody>
    </table>
  );
}
export default PeopleTable;
