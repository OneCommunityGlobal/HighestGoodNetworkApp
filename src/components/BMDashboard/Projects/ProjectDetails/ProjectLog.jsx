import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Card, Table, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import styles from './ProjectDetails.module.css';

function ProjectLog({ projectId, darkMode }) {
  const projectData = useSelector(state => state.bmProjectMembers);
  const allTeams = useSelector(state => state.allTeamsData?.allTeams || []);

  const membersArray = useMemo(() => {
    if (!projectData) return [];
    if (Array.isArray(projectData)) return projectData;
    if (projectData.members && Array.isArray(projectData.members)) return projectData.members;
    if (projectData.members?.members && Array.isArray(projectData.members.members))
      return projectData.members.members;
    return [];
  }, [projectData]);

  const [idSearchText, setIdSearchText] = useState('');
  const [firstNameSearchText, setFirstNameSearchText] = useState('');
  const [lastNameSearchText, setLastNameSearchText] = useState('');
  const [roleSearchText, setRoleSearchText] = useState('');
  const [teamSearchText, setTeamSearchText] = useState('');
  const [currentTaskSearchText, setCurrentTaskSearchText] = useState('');
  const [totalHrsSearchText, setTotalHrsSearchText] = useState('');
  const [todaysHrsSearchText, setTodaysHrsSearchText] = useState('');

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const findTeamNameForUser = targetUserId => {
    if (!allTeams || allTeams.length === 0) return 'Loading...';
    const foundTeam = allTeams.find(team =>
      team.members.some(member => {
        let rawId = member.userId || member._id || member.user;
        if (rawId && typeof rawId === 'object') {
          rawId = rawId._id || rawId.$oid || rawId;
        }
        return String(rawId) === String(targetUserId);
      }),
    );
    return foundTeam ? foundTeam.teamName : 'No Team';
  };

  const handleClearFilters = () => {
    setIdSearchText('');
    setFirstNameSearchText('');
    setLastNameSearchText('');
    setRoleSearchText('');
    setTeamSearchText('');
    setCurrentTaskSearchText('');
    setTotalHrsSearchText('');
    setTodaysHrsSearchText('');
    setSortColumn(null);
    setSortDirection('asc');
  };

  const handleSort = column => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = columnName => {
    if (sortColumn === columnName) {
      return sortDirection === 'asc' ? faSortUp : faSortDown;
    }
    return faSort;
  };

  const processedData = useMemo(() => {
    return membersArray
      .filter(member => member && member.user && typeof member.user !== 'string')
      .map(member => {
        const user = member.user;
        return {
          id: user._id ? String(user._id).substring(user._id.length - 4) : 'N/A',
          rawId: user._id,
          firstName: user.firstName || 'Unknown',
          lastName: user.lastName || 'User',
          role: user.role || 'N/A',
          team: findTeamNameForUser(user._id),
          currentTask: member.currentTask || '--',
          totalHrs: member.hours ? Math.round(member.hours) : 0,
          todaysHrs: member.todaysHrs || '--',
        };
      });
  }, [membersArray, allTeams]);

  const filteredAndSortedData = useMemo(() => {
    let result = processedData.filter(person => {
      const matchesId =
        !idSearchText || person.id.toLowerCase().includes(idSearchText.toLowerCase());
      const matchesFirstName =
        !firstNameSearchText ||
        person.firstName.toLowerCase().includes(firstNameSearchText.toLowerCase());
      const matchesLastName =
        !lastNameSearchText ||
        person.lastName.toLowerCase().includes(lastNameSearchText.toLowerCase());
      const matchesRole =
        !roleSearchText || person.role.toLowerCase().includes(roleSearchText.toLowerCase());
      const matchesTeam =
        !teamSearchText || person.team.toLowerCase().includes(teamSearchText.toLowerCase());
      const matchesCurrentTask =
        !currentTaskSearchText ||
        person.currentTask.toLowerCase().includes(currentTaskSearchText.toLowerCase());
      const matchesTotalHrs =
        !totalHrsSearchText || String(person.totalHrs).includes(totalHrsSearchText);
      const matchesTodaysHrs =
        !todaysHrsSearchText ||
        String(person.todaysHrs)
          .toLowerCase()
          .includes(todaysHrsSearchText.toLowerCase());

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

    if (sortColumn) {
      result = result.sort((a, b) => {
        let firstValue = a[sortColumn];
        let secondValue = b[sortColumn];

        if (sortColumn === 'totalHrs' || sortColumn === 'todaysHrs') {
          firstValue = Number(firstValue) || 0;
          secondValue = Number(secondValue) || 0;
        } else {
          firstValue = String(firstValue).toLowerCase();
          secondValue = String(secondValue).toLowerCase();
        }

        if (firstValue < secondValue) return sortDirection === 'asc' ? -1 : 1;
        if (firstValue > secondValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    processedData,
    idSearchText,
    firstNameSearchText,
    lastNameSearchText,
    roleSearchText,
    teamSearchText,
    currentTaskSearchText,
    totalHrsSearchText,
    todaysHrsSearchText,
    sortColumn,
    sortDirection,
  ]);

  const hasActiveFilters =
    idSearchText ||
    firstNameSearchText ||
    lastNameSearchText ||
    roleSearchText ||
    teamSearchText ||
    currentTaskSearchText ||
    totalHrsSearchText ||
    todaysHrsSearchText;

  const inputStyle = {
    width: '100%',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#f1f5f9' : '#000',
    border: darkMode ? '1px solid #334155' : '1px solid #ccc',
    borderRadius: '4px',
    padding: '4px 8px',
  };

  return (
    <Card className={styles['project-log'] || 'project-log'}>
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
          <Button color="secondary" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      <div className="table-responsive">
        <Table hover striped responsive>
          <thead>
            <tr>
              <th
                onClick={() => handleSort('id')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ID <FontAwesomeIcon icon={getSortIcon('id')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('firstName')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                First Name <FontAwesomeIcon icon={getSortIcon('firstName')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('lastName')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Last Name <FontAwesomeIcon icon={getSortIcon('lastName')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('role')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Role <FontAwesomeIcon icon={getSortIcon('role')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('team')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Team <FontAwesomeIcon icon={getSortIcon('team')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('currentTask')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Current Task <FontAwesomeIcon icon={getSortIcon('currentTask')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('totalHrs')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Total Hrs <FontAwesomeIcon icon={getSortIcon('totalHrs')} className="ml-1" />
              </th>
              <th
                onClick={() => handleSort('todaysHrs')}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Today's Hrs <FontAwesomeIcon icon={getSortIcon('todaysHrs')} className="ml-1" />
              </th>
            </tr>
            <tr>
              <td>
                <input
                  type="text"
                  placeholder="Search ID"
                  value={idSearchText}
                  onChange={e => setIdSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search First Name"
                  value={firstNameSearchText}
                  onChange={e => setFirstNameSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Last Name"
                  value={lastNameSearchText}
                  onChange={e => setLastNameSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Role"
                  value={roleSearchText}
                  onChange={e => setRoleSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Team"
                  value={teamSearchText}
                  onChange={e => setTeamSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Current Task"
                  value={currentTaskSearchText}
                  onChange={e => setCurrentTaskSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Total Hrs"
                  value={totalHrsSearchText}
                  onChange={e => setTotalHrsSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Search Today's Hrs"
                  value={todaysHrsSearchText}
                  onChange={e => setTodaysHrsSearchText(e.target.value)}
                  style={inputStyle}
                />
              </td>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((person, index) => (
                <tr key={person.rawId || index}>
                  <th scope="row">{person.id}</th>
                  <td>{person.firstName}</td>
                  <td>{person.lastName}</td>
                  <td>{person.role}</td>
                  <td>{person.team}</td>
                  <td>{person.currentTask}</td>
                  <td>{person.totalHrs}</td>
                  <td>{person.todaysHrs}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ margin: 0, color: '#6c757d' }}>
                    {membersArray.length === 0
                      ? 'Loading or no active members...'
                      : 'No members match the current filters.'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
}

export default ProjectLog;
