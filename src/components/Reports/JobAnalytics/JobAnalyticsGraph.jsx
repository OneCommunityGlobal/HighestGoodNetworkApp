import React, { useMemo } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function JobAnalyticsGraph({ data, darkMode }) {
  const normalizedData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((d) => ({
        role: d.role,
        applications:
          typeof d.applications === "number"
            ? d.applications
            : typeof d.count === "number"
            ? d.count
            : 0,
      }))
      .filter((d) => d.role && d.applications > 0);
  }, [data]);

  if (normalizedData.length === 0) {
    return <p>No data available</p>;
  }

  const chartData = {
    labels: normalizedData.map((d) => d.role),
    datasets: [
      {
        label: "Applications",
        data: normalizedData.map((d) => d.applications),
        backgroundColor: darkMode
          ? "#3A506B"
          : "rgba(54, 162, 235, 0.7)",
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
        anchor: "end",
        align: "left",
        offset: -5,
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
        },
        grid: { color: darkMode ? "#333" : "#ddd" },
      },
    },
  };

  return (
    <div className={styles.graphContainer}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

JobAnalyticsGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      role: PropTypes.string,
      applications: PropTypes.number,
      count: PropTypes.number,
    })
  ),
  darkMode: PropTypes.bool,
};

JobAnalyticsGraph.defaultProps = {
  data: [],
  darkMode: false,
};
