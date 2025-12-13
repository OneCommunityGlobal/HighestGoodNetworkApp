import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import styles from "./JobAnalyticsPage.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function JobAnalyticsGraph({ data, darkMode }) {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  const chartData = {
    labels: data.map((d) => d.role),
    datasets: [
      {
        label: "Applications",
        data: data.map((d) => d.applications || d.count || 0),
        backgroundColor: darkMode ? "#3A506B" : "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Most Competitive Roles",
        color: darkMode ? "#E0E0E0" : "#111111",
        font: { size: 18, weight: "bold" },
      },
      datalabels: {
        color: darkMode ? "#E0E0E0" : "#111111",
        borderRadius: 4,
        padding: 4,
        clamp: true,
        anchor: "end",
        align: "left",
        offset: -5,
        clip: true,
        formatter: (value) => value.toLocaleString(),
        font: { weight: "bold" },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Number of Applications",
          color: darkMode ? "#E0E0E0" : "#111111",
          font: { weight: "bold", size: 14 },
        },
        ticks: {
          color: darkMode ? "#E0E0E0" : "#111111",
          font: { size: 12, weight: "bold" },
        },
        grid: { color: darkMode ? "#333" : "#ddd" },
      },
      y: {
        title: {
          display: true,
          text: "Role",
          color: darkMode ? "#E0E0E0" : "#111111",
          font: { weight: "bold", size: 14 },
        },
        ticks: {
          color: darkMode ? "#E0E0E0" : "#111111",
          font: { size: 12, weight: "bold" },
        },
        grid: { color: darkMode ? "#333" : "#ddd" },
      },
    },
  };

  return (
    <div className={styles.graphContainer}>
      <Bar data={chartData} options={chartOptions} plugins={[ChartDataLabels]} />
    </div>
  );
}

JobAnalyticsGraph.propTypes = {
  data: PropTypes.array.isRequired,
  darkMode: PropTypes.bool.isRequired,
};
