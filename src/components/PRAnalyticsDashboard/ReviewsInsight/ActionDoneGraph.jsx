import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ReviewsInsight.css';

function ActionDoneGraph({ duration, selectedTeams, teamData }) {
  if (!teamData || Object.keys(teamData).length === 0) {
    return <div>No data available for Action Done Graph.</div>;
  }

  const isAllTeams = selectedTeams.includes('All');

  // Prepare data for the graph
  const data = {
    labels: isAllTeams ? Object.keys(teamData) : selectedTeams, // Y-axis labels
    datasets: [
      {
        label: 'Approved',
        data: isAllTeams
          ? Object.keys(teamData).map(team => teamData[team]?.actionSummary?.Approved || 0)
          : selectedTeams.map(team => teamData[team]?.actionSummary?.Approved || 0),
        backgroundColor: '#28A745',
      },
      {
        label: 'Changes Requested',
        data: isAllTeams
          ? Object.keys(teamData).map(
              team => teamData[team]?.actionSummary?.['Changes Requested'] || 0,
            )
          : selectedTeams.map(team => teamData[team]?.actionSummary?.['Changes Requested'] || 0),
        backgroundColor: '#DC3545',
      },
      {
        label: 'Commented',
        data: isAllTeams
          ? Object.keys(teamData).map(team => teamData[team]?.actionSummary?.Commented || 0)
          : selectedTeams.map(team => teamData[team]?.actionSummary?.Commented || 0),
        backgroundColor: '#6C757D',
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Horizontal bar graph
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Count of PRs',
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: 'Teams',
        },
      },
    },
  };

  return (
    <div className="graph">
      <h2>PR: Action Done</h2>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ActionDoneGraph;
