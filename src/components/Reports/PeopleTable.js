import React from 'react';
import '../Teams/Team.css';
import { Link } from 'react-router-dom';
import './reports.css';

const PeopleTable = (props) => {
  let PeopleList = [];
  if (props.userProfiles.length > 0) {
    PeopleList = props.userProfiles.map((person, index) => (
      <tr className="teams__tr" id={`tr_${person._id}`} key={person._id}>
        <th className="teams__order--input" scope="row">
          <div>{index + 1}</div>
        </th>
        <td>
          <Link to={`/peoplereport/${person._id}`} personId={person._id}>
            {person.firstName} {person.lastName}
          </Link>
        </td>
        <td
          className="teams__active--input"
          onClick={(e) => {
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
            <th scope="col">PERSON_NAME</th>
            <th scope="col" id="projects__active">
              ACTIVE
            </th>
          </tr>
        </thead>
        <tbody>{PeopleList}</tbody>
      </table>
    </table>
  );
};
export default PeopleTable;
