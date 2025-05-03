import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

function LongestOpenIssuesChart() {
  const processedData = [
    {
      IssueId: '662d6479aa9fee05811b7d2e',
      title: ['testing', 'testing'],
      daysOpen: 701,
    },
    {
      IssueId: '662d69367813950e4f454d44',
      title: ['testing', 'testing'],
      daysOpen: 701,
    },
    {
      IssueId: '67b7c723432ea2100f636011',
      title: ['safty', 'minor injury'],
      daysOpen: 73,
    },
    {
      IssueId: '67b7c774432ea2100f63601a',
      title: ['worker safty ', 'minor injury'],
      daysOpen: 73,
    },
    {
      IssueId: '67b7c832432ea2100f63601d',
      title: ['safty', 'minor injury'],
      daysOpen: 73,
    },
  ];
  const data = {
    labels: processedData.map(issue => issue.title || issue.id),
    datasets: [
      {
        label: 'Days Open',
        data: processedData.map(issue => issue.daysOpen),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y', // horizontal bar chart
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Top 5 Longest Open Issues',
        font: { size: 12 },
      },
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'right',
        formatter: value => `${value} days`,
        color: '#000',
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Days Open' },
      },
      y: {
        title: { display: true, text: 'Issue Title or ID' },
      },
    },
  };

  return <Bar data={data} options={options} plugins={[ChartDataLabels]} />;
}

export default LongestOpenIssuesChart;
