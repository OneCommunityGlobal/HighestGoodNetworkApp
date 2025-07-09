import React from 'react';
import { Pie } from 'react-chartjs-2';
import './ReviewsInsight.css';

function PRQualityGraph({ duration, selectedTeams, qualityData }) {
  const isAllTeams = selectedTeams.includes('All');
  const teamsToDisplay = isAllTeams ? Object.keys(qualityData) : selectedTeams;

  const generateChartData = (team) => ({
    labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'],
    datasets: [
      {
        label: `PR Quality Distribution for ${team}`,
        data: qualityData[team],
        backgroundColor: ['#DC3545', '#FFC107', '#28A745', '#007BFF'],
        hoverOffset: 4,
      },
    ],
  });

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
    <div className="charts">
      {teamsToDisplay.map((team) => (
        <div key={team} className="chart">
          <h2>PR Quality: {team}</h2>
          <Pie data={generateChartData(team)} options={options} />
        </div>
      ))}
    </div>
  );
}

export default PRQualityGraph;