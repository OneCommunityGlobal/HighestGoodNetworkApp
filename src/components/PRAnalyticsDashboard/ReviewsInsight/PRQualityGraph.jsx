import React from 'react';
import { Pie } from 'react-chartjs-2';
import './ReviewsInsight.css';

function PRQualityGraph({ duration, selectedTeams, qualityData }) {
  const isAllTeams = selectedTeams.includes('All');

  // Aggregate data for "All Teams" or use specific team data
  const dataValues = isAllTeams
    ? Object.values(qualityData).reduce(
        (acc, team) => acc.map((value, index) => value + team[index]),
        [0, 0, 0, 0]
      )
    : qualityData[selectedTeams[0]];

  const data = {
    labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'],
    datasets: [
      {
        label: 'PR Quality Distribution',
        data: dataValues,
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
    },
  };

  return (
    <div className="graph">
      <h2>PR: Quality Distribution</h2>
      <Pie data={data} options={options} />
    </div>
  );
}

export default PRQualityGraph;