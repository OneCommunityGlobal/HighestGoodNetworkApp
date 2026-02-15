import { Bar } from 'react-chartjs-2';
import styles from './ReviewsInsight.module.css';
import { useSelector } from 'react-redux';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function ActionDoneGraph({ selectedTeams, teamData }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div></div>;
  }

  if (!teamData || Object.keys(teamData).length === 0) {
    return <div className={styles.noData}>No data available for Action Graph.</div>;
  }

  const isAllTeams = selectedTeams.some(team => team.value === 'All');
  const teamsToDisplay = isAllTeams ? Object.keys(teamData) : selectedTeams.map(team => team.value);

  const data = {
    labels: teamsToDisplay.map(teamKey => `${teamKey} (${teamData[teamKey]?.memberCount ?? 0})`),
    datasets: [
      {
        label: 'Approved',
        data: teamsToDisplay.map(team => teamData[team]?.actionSummary?.Approved || 0),
        backgroundColor: '#28A745',
      },
      {
        label: 'Changes Requested',
        data: teamsToDisplay.map(team => teamData[team]?.actionSummary?.['Changes Requested'] || 0),
        backgroundColor: '#DC3545',
      },
      {
        label: 'Commented',
        data: teamsToDisplay.map(team => teamData[team]?.actionSummary?.Commented || 0),
        backgroundColor: '#6C757D',
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 12,
          },
          color: darkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        color: darkMode ? '#fff' : '#000',
        font: { weight: 'bold', size: 11 },
        formatter: value => {
          if (!value) return 0;
          return value;
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Count of PRs',
          color: darkMode ? '#fff' : '#000',
        },
        ticks: {
          color: darkMode ? '#fff' : '#000',
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: 'Teams',
          color: darkMode ? '#fff' : '#000',
        },
        ticks: {
          color: darkMode ? '#fff' : '#000',
        },
      },
    },
  };

  return (
    <div className={styles.riActionDoneGraph}>
      <h2 className={`${styles.heading} ${darkMode ? styles.darkModeForeground : ''}`}>
        PR: Action Done
      </h2>
      <div className={`${styles.riGraph} ${darkMode ? styles.riGraphDarkMode : ''}`}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default ActionDoneGraph;
