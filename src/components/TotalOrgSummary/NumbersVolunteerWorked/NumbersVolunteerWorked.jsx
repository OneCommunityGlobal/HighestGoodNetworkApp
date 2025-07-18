import '../TotalOrgSummary.css';

export default function NumbersVolunteerWorked({ isLoading, data, darkMode }) {
  return (
    <div>
      <p
        className={`${
          darkMode ? 'text-light' : 'text-dark'
        } component-border component-pie-chart-label p-2`}
      >
        {isLoading ? '...' : data.count}
        Volunteers worked 1+ hours over assigned time
      </p>
    </div>
  );
}
