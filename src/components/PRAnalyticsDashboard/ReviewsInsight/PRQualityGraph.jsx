import React from 'react';
import { Pie } from 'react-chartjs-2';
import './ReviewsInsight.css';

function PRQualityGraph({ duration, selectedTeams }) {
  const data = {
    labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'], 
    datasets: [
      {
        label: 'PR Quality Distribution',
        data: [5, 10, 15, 20], 
        backgroundColor: ['#DC3545', '#FFC107', '#28A745', '#007BFF'], 
        hoverOffset: 4, 
      },
    ],
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
        },
      },
      tooltip: {
        enabled: true, 
      },
      datalabels: {
        color: '#fff',
        font: {
          size: 14,
        },
        formatter: (value) => `${value}`, 
      },
    },
  };

  return (
    <div className="graph">
      <h2>PR: Quality Distribution</h2>
      {selectedTeams.length === 1 ? (
        <p className="team-name">Team: {selectedTeams[0]}</p>
      ) : selectedTeams.length > 1 ? (
        <p className="team-name">Teams: {selectedTeams.join(', ')}</p>
      ) : (
        <p className="team-name">No Team Selected</p>
      )}
      <Pie data={data} options={options} />
    </div>
  );
}

export default PRQualityGraph;