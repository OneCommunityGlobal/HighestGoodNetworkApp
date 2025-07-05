import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ReviewsInsight.css';

function ActionDoneGraph({ duration, selectedTeams, teamData }) {
  const isAllTeams = selectedTeams.includes('All');

  // Prepare data for the graph
  const data = {
    labels: isAllTeams ? Object.keys(teamData) : selectedTeams, // Y-axis labels
    datasets: [
      {
        label: 'Approved',
        data: isAllTeams
          ? Object.values(teamData).map((team) => team[0])
          : selectedTeams.map((team) => teamData[team][0]),
        backgroundColor: '#28A745',
      },
      {
        label: 'Changes Requested',
        data: isAllTeams
          ? Object.values(teamData).map((team) => team[1])
          : selectedTeams.map((team) => teamData[team][1]),
        backgroundColor: '#DC3545',
      },
      {
        label: 'Commented',
        data: isAllTeams
          ? Object.values(teamData).map((team) => team[2])
          : selectedTeams.map((team) => teamData[team][2]),
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
        stacked: false, // Disable stacking to show bars side by side
      },
      y: {
        title: {
          display: true,
          text: 'Teams',
        },
        stacked: false, // Disable stacking to show bars side by side
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