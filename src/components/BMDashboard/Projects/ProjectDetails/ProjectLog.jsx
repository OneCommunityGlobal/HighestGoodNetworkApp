import { Card, Table, Button } from 'reactstrap';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import styles from './ProjectDetails.module.css';

const DummyData = [
  {
    id: '12',
    firstName: 'Dora',
    lastName: 'Kimberly',
    role: 'Carpenter',
    team: 'XYZ',
    currentTask: 'Stud wall construction',
    totalHrs: 169,
    todaysHrs: 5.5,
  },
  {
    id: '35',
    firstName: 'Cailin',
    lastName: 'Colby',
    role: 'Volunteer',
    team: 'Team A',
    currentTask: 'Foundation concreting',
    totalHrs: 15,
    todaysHrs: 2.18,
  },
  {
    id: '36',
    firstName: 'Member A',
    lastName: 'Member A',
    role: 'Role A',
    team: 'Team A',
    currentTask: 'Task 1',
    totalHrs: 169,
    todaysHrs: 5.5,
  },
];

class ProjectLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      idSearchText: '',
      firstNameSearchText: '',
      lastNameSearchText: '',
      roleSearchText: '',
      teamSearchText: '',
      currentTaskSearchText: '',
      totalHrsSearchText: '',
      todaysHrsSearchText: '',

      sortColumn: null,
      sortDirection: 'asc',
    };
  }

  handleIdSearchChange = e => {
    this.setState({ idSearchText: e.target.value });
  };
  handleFirstNameSearchText = e => {
    this.setState({ firstNameSearchText: e.target.value });
  };
  handleLastNameSearchText = e => {
    this.setState({ lastNameSearchText: e.target.value });
  };
  handleRoleSearchText = e => {
    this.setState({ roleSearchText: e.target.value });
  };
  handleTeamSearchText = e => {
    this.setState({ teamSearchText: e.target.value });
  };
  handleCurrentTaskSearchText = e => {
    this.setState({ currentTaskSearchText: e.target.value });
  };
  handleTotalHrsSearchText = e => {
    this.setState({ totalHrsSearchText: e.target.value });
  };
  handleTodaysHrsSearchText = e => {
    this.setState({ todaysHrsSearchText: e.target.value });
  };

  handleClearFilters = () => {
    this.setState({
      idSearchText: '',
      firstNameSearchText: '',
      lastNameSearchText: '',
      roleSearchText: '',
      teamSearchText: '',
      currentTaskSearchText: '',
      totalHrsSearchText: '',
      todaysHrsSearchText: '',
      sortColumn: null,
      sortDirection: 'asc',
    });
  };

  handleSort = column => {
    this.setState(prevState => {
      if (prevState.sortColumn === column) {
        return {
          sortDirection: prevState.sortDirection === 'asc' ? 'desc' : 'asc',
        };
      } else {
        return {
          sortColumn: column,
          sortDirection: 'asc',
        };
      }
    });
  };

  getSortIcon = columnName => {
    if (this.state.sortColumn === columnName) {
      return this.state.sortDirection === 'asc' ? faSortUp : faSortDown;
    }
    return null;
  };

  filteredData = () => {
    const filtered = DummyData.filter(person => {
      const idSearch = this.state.idSearchText.trim().toLowerCase();
      const FirstNameSearch = this.state.firstNameSearchText.trim().toLowerCase();
      const LastNameSearch = this.state.lastNameSearchText.trim().toLowerCase();
      const RoleSearch = this.state.roleSearchText.trim().toLowerCase();
      const TeamSearch = this.state.teamSearchText.trim().toLowerCase();
      const CurrentTaskSearch = this.state.currentTaskSearchText.trim().toLowerCase();
      const TotalHrsSearch = this.state.totalHrsSearchText.trim().toLowerCase();
      const TodaysHrsSearch = this.state.todaysHrsSearchText.trim().toLowerCase();

      const personId = String(person.id).toLowerCase();
      const personFirstName = person.firstName.toLowerCase();
      const personLastName = person.lastName.toLowerCase();
      const personRole = person.role.toLowerCase();
      const personTeam = person.team.toLowerCase();
      const personCurrentTask = person.currentTask.toLowerCase();
      const personTotalHrs = String(person.totalHrs).toLowerCase();
      const personTodaysHrs = String(person.todaysHrs).toLowerCase();

      const matchesId = !idSearch || personId.includes(idSearch);
      const matchesFirstName = !FirstNameSearch || personFirstName.includes(FirstNameSearch);
      const matchesLastName = !LastNameSearch || personLastName.includes(LastNameSearch);
      const matchesRole = !RoleSearch || personRole.includes(RoleSearch);
      const matchesTeam = !TeamSearch || personTeam.includes(TeamSearch);
      const matchesCurrentTask =
        !CurrentTaskSearch || personCurrentTask.includes(CurrentTaskSearch);
      const matchesTotalHrs = !TotalHrsSearch || personTotalHrs.includes(TotalHrsSearch);
      const matchesTodaysHrs = !TodaysHrsSearch || personTodaysHrs.includes(TodaysHrsSearch);

      return (
        matchesId &&
        matchesFirstName &&
        matchesLastName &&
        matchesRole &&
        matchesTeam &&
        matchesCurrentTask &&
        matchesTotalHrs &&
        matchesTodaysHrs
      );
    });

    if (this.state.sortColumn) {
      return filtered.sort((a, b) => {
        let firstValue, secondValue;

        switch (this.state.sortColumn) {
          case 'id':
            firstValue = Number(a.id);
            secondValue = Number(b.id);
            break;
          case 'firstName':
            firstValue = a.firstName.toLowerCase();
            secondValue = b.firstName.toLowerCase();
            break;
          case 'lastName':
            firstValue = a.lastName.toLowerCase();
            secondValue = b.lastName.toLowerCase();
            break;
          case 'role':
            firstValue = a.role.toLowerCase();
            secondValue = b.role.toLowerCase();
            break;
          case 'team':
            firstValue = a.team.toLowerCase();
            secondValue = b.team.toLowerCase();
            break;
          case 'currentTask':
            firstValue = a.currentTask.toLowerCase();
            secondValue = b.currentTask.toLowerCase();
            break;
          case 'totalHrs':
            firstValue = Number(a.totalHrs);
            secondValue = Number(b.totalHrs);
            break;
          case 'todaysHrs':
            firstValue = Number(a.todaysHrs);
            secondValue = Number(b.todaysHrs);
            break;
          default:
            return 0;
        }
        let compare = 0;
        if (firstValue < secondValue) {
          compare = -1;
        } else if (firstValue > secondValue) {
          compare = 1;
        }
        return this.state.sortDirection === 'asc' ? compare : -compare;
      });
    }
    return filtered;
  };
  render() {
    const filteredData = this.filteredData();
    const hasActiveFilters =
      this.state.idSearchText ||
      this.state.firstNameSearchText ||
      this.state.lastNameSearchText ||
      this.state.roleSearchText ||
      this.state.teamSearchText ||
      this.state.currentTaskSearchText ||
      this.state.totalHrsSearchText ||
      this.state.todaysHrsSearchText;

    const tableRows = filteredData.map(person => (
      <tr key={person.id}>
        <th scope="row">{person.id}</th>
        <td>{person.firstName}</td>
        <td>{person.lastName}</td>
        <td>{person.role}</td>
        <td>{person.team}</td>
        <td>{person.currentTask}</td>
        <td>{person.totalHrs}</td>
        <td>{person.todaysHrs}</td>
      </tr>
    ));

    return (
      <Card className={styles['project-log']}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Members working on site today</h2>
          {hasActiveFilters && (
            <Button color="secondary" size="sm" onClick={this.handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
        <Table hover responsive striped>
          <thead>
            <tr>
              <th onClick={() => this.handleSort('id')} style={{ cursor: 'pointer' }}>
                ID
                {(() => {
                  const icon = this.getSortIcon('id');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('firstName')} style={{ cursor: 'pointer' }}>
                First Name
                {(() => {
                  const icon = this.getSortIcon('firstName');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('lastName')} style={{ cursor: 'pointer' }}>
                Last Name
                {(() => {
                  const icon = this.getSortIcon('lastName');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('role')} style={{ cursor: 'pointer' }}>
                Role
                {(() => {
                  const icon = this.getSortIcon('role');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('team')} style={{ cursor: 'pointer' }}>
                Team
                {(() => {
                  const icon = this.getSortIcon('team');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('currentTask')} style={{ cursor: 'pointer' }}>
                Current Task
                {(() => {
                  const icon = this.getSortIcon('currentTask');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('totalHrs')} style={{ cursor: 'pointer' }}>
                Total Hrs
                {(() => {
                  const icon = this.getSortIcon('totalHrs');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
              <th onClick={() => this.handleSort('todaysHrs')} style={{ cursor: 'pointer' }}>
                Today&apos;s Hrs
                {(() => {
                  const icon = this.getSortIcon('todaysHrs');
                  return icon && <FontAwesomeIcon icon={icon} />;
                })()}
              </th>
            </tr>
            <tr>
              <td>
                <input
                  type="text"
                  placeholder="Search ID"
                  value={this.state.idSearchText}
                  onChange={this.handleIdSearchChange}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search First Name"
                  value={this.state.firstNameSearchText}
                  onChange={this.handleFirstNameSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Last Name"
                  value={this.state.lastNameSearchText}
                  onChange={this.handleLastNameSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Role"
                  value={this.state.roleSearchText}
                  onChange={this.handleRoleSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Team"
                  value={this.state.teamSearchText}
                  onChange={this.handleTeamSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Current Task"
                  value={this.state.currentTaskSearchText}
                  onChange={this.handleCurrentTaskSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Total Hrs"
                  value={this.state.totalHrsSearchText}
                  onChange={this.handleTotalHrsSearchText}
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Today's Hrs"
                  value={this.state.todaysHrsSearchText}
                  onChange={this.handleTodaysHrsSearchText}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {tableRows.length > 0 ? (
              tableRows
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    No members match the current filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    );
  }
}

export default ProjectLog;
