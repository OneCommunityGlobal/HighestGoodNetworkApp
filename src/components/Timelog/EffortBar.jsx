import { useSelector } from 'react-redux';

function EffortBar({ activeTab, projectsSelected }) {
  const data = useSelector(state =>
    activeTab === 4 ? state.timeEntries.period : state.timeEntries.weeks[activeTab - 1],
  );

  const calculateTotalTime = (d, isTangible) => {
    const filteredData = d.filter(
      entry =>
        entry.isTangible === isTangible &&
        (projectsSelected.includes('all') || projectsSelected.includes(entry.projectId)),
    );

    const reducer = (total, entry) => total + Number(entry.hours) + Number(entry.minutes) / 60;
    const total = filteredData.reduce(reducer, 0);
    return Number(total.toFixed(2));
  };

  const tangibleTime = calculateTotalTime(data, true);
  const intangibleTime = calculateTotalTime(data, false);
  const totalTime = tangibleTime + intangibleTime;

  return (
    <div className="m-auto row text-white text-center align-self-center">
      <span className="bg-primary col-md-4 p-1 ">
        Tangible Effort: {tangibleTime.toFixed(2)} hrs
      </span>
      <span className="bg-secondary col-md-4 p-1">
        Intangible Effort: {intangibleTime.toFixed(2)} hrs
      </span>
      <span className="bg-success col-md-4 p-1">Total Effort: {totalTime.toFixed(2)} hrs</span>
    </div>
  );
}

export default EffortBar;
