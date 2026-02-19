import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import sharedStyles from './ReviewsInsight.module.css';

Chart.register(ChartDataLabels);
function ActionDoneGraph({ selectedTeams, teamData }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div></div>;
  }

  if (!teamData || Object.keys(teamData).length === 0) {
    return <div className={sharedStyles.noData}>No data available for Action Graph.</div>;
  }

  const isAllTeams = selectedTeams.some(team => team.value === 'All');
  const teamsToDisplay = isAllTeams ? Object.keys(teamData) : selectedTeams.map(team => team.value);

  const data = {
    labels: teamsToDisplay,
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
          font: { size: 12 },
          color: darkMode ? '#fff' : '#000',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = Math.round(context.raw);
            return `${label}: ${value} PRs reviewed`;
          },
        },
      },
      datalabels: {
        color: darkMode ? '#fff' : '#000',
        font: { weight: 'bold', size: 11 },
        formatter: value => (value ? value : ''),
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of PRs Reviewed',
          color: darkMode ? '#fff' : '#000',
        },
        ticks: {
          color: darkMode ? '#fff' : '#000',
          stepSize: 1,
          callback: function(value) {
            return Math.floor(value);
          },
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
          callback: function(value, index) {
            const teamName = this.getLabelForValue(value);
            const team = teamsToDisplay[index];
            const memberCount = teamData[team]?.memberCount || 0;

            // Unicode circled numbers (0-20)
            const circles = [
              '⓪',
              '①',
              '②',
              '③',
              '④',
              '⑤',
              '⑥',
              '⑦',
              '⑧',
              '⑨',
              '⑩',
              '⑪',
              '⑫',
              '⑬',
              '⑭',
              '⑮',
              '⑯',
              '⑰',
              '⑱',
              '⑲',
              '⑳',
            ];
            const circle = memberCount <= 20 ? circles[memberCount] : `(${memberCount})`;

            return `${teamName} ${circle}`;
          },
        },
      },
    },
  };
  return (
    <div className={sharedStyles.riActionDoneGraph}>
      <h2>PR: Action Done</h2>
      <div className={sharedStyles.riGraph}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default ActionDoneGraph;
