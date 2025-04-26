import '../Teams/Team.css';
import { Link } from 'react-router-dom';
import './reports.css';
import moment from 'moment';
import { boxStyle, boxStyleDark } from 'styles';

function PeopleTable({ userProfiles, darkMode }) {
  let PeopleList = [];
  
  if (userProfiles.length > 0) {
    PeopleList = userProfiles
      .sort((a, b) => a.firstName.localeCompare(b.firstName))
      .map((person, index) => (
        <tr className="teams__tr" id={`tr_${person._id}`} key={person._id}>
          <th className={`teams__order--input ${darkMode ? 'text-light' : ''}`} scope="row">
            <div>{index + 1}</div>
          </th>
          <td>
            <Link to={`/peoplereport/${person._id}`} className={darkMode ? 'text-light' : ''}>
              {person.firstName}{' '}
              {person.lastName.length > 15 ? `${person.lastName.slice(0, 15)}...` : person.lastName}
            </Link>
          </td>
          <td>
              {person.isActive ? (
                <div className="isActive">
                  <i className="fa fa-circle" aria-label="Active" /> {/* Removed aria-hidden */}
                </div>
              ) : (
                <div className="isNotActive">
                  <i className="fa fa-circle-o" aria-label="Inactive" /> {/* Removed aria-hidden */}
                </div>
              )}
          </td>
          <td className={`${darkMode ? 'text-light' : ''}`} style={{ width: '110px' }}>
            {moment.utc(person.startDate).format('MM-DD-YY')}
          </td>
          <td className={`${darkMode ? 'text-light' : ''}`} style={{ width: '110px' }}>
            {person.endDate ? moment.utc(person.endDate).format('MM-DD-YY') : 'N/A'}
          </td>
        </tr>
      ));
  }

  return (
    <div className="custom-scrollbar">
      <table className={`table ${darkMode ? 'bg-yinmn-blue' : 'table-bordered'}`} style={darkMode ? boxStyleDark : boxStyle}>
        <thead>
          <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
            <th scope="col" id="projects__order">
              #
            </th>
            <th scope="col">Person Name</th>
            <th scope="col" id="projects__active">
              Active
            </th>
            <th scope="col">
              Start Date
            </th>
            <th scope="col">
              End Date
            </th>
          </tr>
        </thead>
        <tbody className={darkMode ? 'dark-mode' : ''}>{PeopleList}</tbody>
      </table>
    </div>
  );
}

export default PeopleTable;
