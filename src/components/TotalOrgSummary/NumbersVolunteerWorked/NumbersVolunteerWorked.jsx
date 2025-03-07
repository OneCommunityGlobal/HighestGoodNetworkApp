import '../TotalOrgSummary.css';

export default function NumbersVolunteerWorked({ isLoading, usersTimeEntries, darkMode }) {
  return (
    <div>
      <p
        className={`${
          darkMode ? 'text-light' : 'text-dark'
        } component-border component-pie-chart-label p-2`}
      >
        {isLoading ? '...' : usersTimeEntries.length} Volunteers worked 1+ hours over assigned time
      </p>
    </div>
  );
}
