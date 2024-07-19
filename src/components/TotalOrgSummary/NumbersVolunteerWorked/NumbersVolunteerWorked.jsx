import '../TotalOrgSummary.css';

export default function NumbersVolunteerWorked({ usersTimeEntries }) {
  return (
    <div>
      <p className="component-border component-pie-chart-label p-2">
        {usersTimeEntries.length} Volunteers worked over assigned time
      </p>
    </div>
  );
}
