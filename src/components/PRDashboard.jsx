import hasPermission from '~/utils/permissions';

function PRDashboard({ authUser }) {
  if (!hasPermission('accessPRTeamDashboard', authUser?.permissions)) {
    return <p>You do not have access to this dashboard.</p>;
  }

  return (
    <div>
      <h1>PR Team Dashboard</h1>
      {/* actual dashboard content */}
    </div>
  );
}
export default PRDashboard;
