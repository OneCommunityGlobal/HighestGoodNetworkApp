import React from 'react';
import { Bar } from 'react-chartjs-2';
import './ReviewsInsight.css';

function ActionDoneGraph({ duration, selectedTeams }) {
  // Sample data for the bar graph
  const data = {
    labels: ['Approved', 'Changes Requested', 'Commented'], // X-Axis labels
    datasets: [
      {
        label: 'PR Actions',
        data: [12, 8, 15], // Example data for each action
        backgroundColor: ['#28A745', '#DC3545', '#6C757D'], // Colors for bars
      },
    ],
  };

  const options = {
    indexAxis: 'y', // Sets the index axis to horizontal
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hides the legend
      },
      tooltip: {
        enabled: true, // Enables tooltips
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Action Types', // X-Axis label
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count of PRs', // Y-Axis label
        },
        beginAtZero: true, // Ensures the Y-axis starts at 0
      },
    },
  };

  return (
    <div className="graph">
      <h2>PR: Action Done</h2>
      {selectedTeams.length === 1 ? (
        <p className="team-name">Team: {selectedTeams[0]}</p>
      ) : selectedTeams.length > 1 ? (
        <p className="team-name">Teams: {selectedTeams.join(', ')}</p>
      ) : (
        <p className="team-name">No Team Selected</p>
      )}
      <Bar data={data} options={options} />
    </div>
  );
}

export default ActionDoneGraph;