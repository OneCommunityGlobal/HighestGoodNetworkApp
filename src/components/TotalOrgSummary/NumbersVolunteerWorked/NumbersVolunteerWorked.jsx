import '../TotalOrgSummary.css';

export default function NumbersVolunteerWorked({ usersTimeEntries, darkMode }) {
  return (
    <div>
      <p
        className={`${
          darkMode ? 'text-light' : 'text-dark'
        } component-border component-pie-chart-label p-2`}
      >
        {usersTimeEntries.length} Volunteers worked over assigned time
      </p>
    </div>
  );
}
