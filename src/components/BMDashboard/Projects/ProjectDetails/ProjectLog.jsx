import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Table } from 'reactstrap';

function ProjectLog({ projectId }) {
  // 1. Get Project Members
  const projectData = useSelector(state => state.bmProjectMembers);
  const rawMembers = projectData?.members;
  const membersArray = rawMembers && Array.isArray(rawMembers.members) ? rawMembers.members : [];

  // 2. Get All Teams
  const allTeams = useSelector(state => state.allTeamsData?.allTeams || []);

  // 3. Helper: Look up the team manually
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

  const tableRows = membersArray.map((member, index) => {
    if (!member || !member.user || typeof member.user === 'string') return null;

    const user = member.user;
    const teamName = findTeamNameForUser(user._id);

    return (
      <tr key={user._id || index}>
        <th scope="row">{user._id ? String(user._id).substring(user._id.length - 4) : 'N/A'}</th>
        <td>{user.firstName || 'Unknown'}</td>
        <td>{user.lastName || 'User'}</td>
        <td>{user.role || 'N/A'}</td>
        <td>{teamName}</td>
        <td>{member.hours ? Math.round(member.hours) : '--'}</td>
      </tr>
    );
  });

  const validRows = tableRows.filter(row => row !== null);

  return (
    <Card className="project-log">
      <h2>Members working on site today</h2>
      <div className="table-responsive">
        <Table hover striped>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Team</th>
              <th>Total Hrs</th>
            </tr>
          </thead>
          <tbody>
            {validRows.length > 0 ? (
              validRows
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  {membersArray.length === 0 ? 'Loading...' : 'No active members found.'}
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
