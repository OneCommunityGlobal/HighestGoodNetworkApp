import { Pie } from 'react-chartjs-2';
import styles from './ReviewsInsight.module.css';
import { useSelector } from 'react-redux';

function PRQualityGraph({ selectedTeams, qualityData }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div> </div>;
  }

  if (!qualityData || Object.keys(qualityData).length === 0) {
    return <div className={styles['no-data-ri']}>No data available for Quality Graph.</div>;
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
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className={styles['ri-quality-graph']}>
      <h2>PR Quality Distribution</h2>
      <div className={styles['ri-charts']}>
        {teamsToDisplay.map(team => (
          <div key={team} className={styles['ri-chart']}>
            <div className={styles['ri-chart-header']}>
              <h3>{team}</h3>
              <span className={styles['ri-team-member-count']}>
                {qualityData[team].memberCount}
              </span>
            </div>
            <Pie data={generateChartData(team)} options={options} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PRQualityGraph;
