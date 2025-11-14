import { Pie } from 'react-chartjs-2';
import styles from './ReviewsInsight.module.css';
import { useSelector } from 'react-redux';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

function PRQualityGraph({ selectedTeams, qualityData, isDataViewActive }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div> </div>;
  }

  if (!qualityData || Object.keys(qualityData).length === 0) {
    return <div className={styles.noData}>No data available for Quality Graph.</div>;
  }

  const isAllTeams = selectedTeams.some(team => team.value === 'All');
  const teamsToDisplay = isAllTeams
    ? Object.keys(qualityData)
    : selectedTeams.map(team => team.value);

  const generateChartData = team => {
    const teamQualityData = qualityData[team] || {};

    const counts = [
      teamQualityData.NotApproved || 0,
      teamQualityData.LowQuality || 0,
      teamQualityData.Sufficient || 0,
      teamQualityData.Exceptional || 0,
    ];

    const total = counts.reduce((sum, v) => sum + v, 0);
    const values = isDataViewActive ? counts.map(v => (total ? (v / total) * 100 : 0)) : counts;

    return {
      labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'],
      datasets: [
        {
          label: `PR Quality Distribution for ${team}`,
          data: values,
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
          font: { size: 12 },
          color: darkMode ? '#fff' : '#333',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => (isDataViewActive ? `${ctx.raw.toFixed(1)}%` : ctx.raw),
        },
      },
      datalabels: {
        color: darkMode ? '#fff' : '#000',
        font: { weight: 'bold', size: 11 },
        formatter: value => {
          if (!value) return '';
          return isDataViewActive ? `${value}%` : value;
        },
      },
    },
  };

  return (
    <div className={styles.riQualityGraph}>
      <h2 className={`${styles.heading} ${darkMode ? styles.darkModeForeground : ''}`}>
        PR Quality Distribution
      </h2>

      <div className={`${styles.riCharts}`}>
        {teamsToDisplay.map(team => (
          <div key={team} className={`${styles.riChart} ${darkMode ? styles.riChartDarkMode : ''}`}>
            <h3 className={`${styles.heading} ${darkMode ? styles.darkModeForeground : ''}`}>
              {team}
            </h3>
            <Pie data={generateChartData(team)} options={options} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PRQualityGraph;
