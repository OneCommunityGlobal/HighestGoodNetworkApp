import { useSelector } from 'react-redux';
import { Card, Table } from 'reactstrap';

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

function ProjectLog() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const tableRows = DummyData.map(person => (
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
    <Card className={`project-log ${darkMode ? 'bg-yinmn-blue' : ''}`}>
      <h2>Members working on site today</h2>
      <Table responsive striped className={darkMode ? 'text-light' : ''}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Team</th>
            <th>Current Task</th>
            <th>Total Hrs</th>
            <th>Today&apos;s Hrs</th>
          </tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </Table>
    </Card>
  );
}

export default ProjectLog;
