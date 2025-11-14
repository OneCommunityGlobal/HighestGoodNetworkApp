import { Pie } from 'react-chartjs-2';
import './ReviewsInsight.css';
import { useSelector } from 'react-redux';

function PRQualityGraph({ selectedTeams, qualityData }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div> </div>;
  }

  if (!qualityData || Object.keys(qualityData).length === 0) {
    return <div className="no-data-ri">No data available for Quality Graph.</div>;
  }

  const isAllTeams = selectedTeams.some(team => team.value === 'All');
  const teamsToDisplay = isAllTeams
    ? Object.keys(qualityData)
    : selectedTeams.map(team => team.value);

  const generateChartData = team => {
    const teamQualityData = qualityData[team] || {};
    return {
      labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'],
      datasets: [
        {
          label: `PR Quality Distribution for ${team}`,
          data: [
            teamQualityData.NotApproved || 0,
            teamQualityData.LowQuality || 0,
            teamQualityData.Sufficient || 0,
            teamQualityData.Exceptional || 0,
          ],
          backgroundColor: ['#DC3545', '#FFC107', '#28A745', '#5940CB'],
          hoverOffset: 4,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
          },
          color: !darkMode ? '#333' : '#fff',
        },
      },
      // tooltip: {
      //   enabled: true,
      // },
      tooltip: {
        displayColors: false, // optional, keeps it clean
        callbacks: {
          // Top line: "<slice>: <value>"
          title: items =>
            items && items[0] ? `${items[0].label}: ${items[0].formattedValue}` : '',
          // Second line: dataset label (series title)
          label: ctx => ctx?.dataset?.label || '',
        },
      },
    },
  };

  return (
    <div className="ri-quality-graph">
      <h2>PR Quality Distribution</h2>
      <div className="ri-charts">
        {teamsToDisplay.map(team => (
          <div key={team} className="ri-chart">
            <h3>{team}</h3>
            <Pie data={generateChartData(team)} options={options} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PRQualityGraph;
