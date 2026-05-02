/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prettier/prettier */
/* eslint-disable react/function-component-definition */

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';
import { fetchOptStatusBreakdown } from '../../actions/optStatusBreakdownAction';
import { roleOptions } from './filter';
import 'chart.js/auto';
import styles from './OptStatusPieChart.module.css';

ChartJS.register(ChartDataLabels);

const COLORS = {
  'OPT started': '#f44336',
  'CPT not eligible': '#f4e34cfc',
  'OPT not yet started': '#2196f3',
  Citizen: '#4caf50',
  'N/A': '#ff9800',
};

const LABEL_OFFSET = 36;

const leaderLinesPlugin = {
  id: 'leaderLines',
  afterDatasetDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach(arc => {
      const { startAngle, endAngle, outerRadius, x, y } = arc;

      const angle = (startAngle + endAngle) / 2;

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      const startX = x + outerRadius * dx;
      const startY = y + outerRadius * dy;

      const lineLength = LABEL_OFFSET;
      const endX = startX + dx * lineLength;
      const endY = startY + dy * lineLength;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round'; // smoother line
      ctx.stroke();
      ctx.restore();
    });
  },
};

ChartJS.register(leaderLinesPlugin);

const OptStatusPieChart = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.theme);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [role, setRole] = useState('');

  const [localBreakdown, setLocalBreakdown] = useState([]);
  const [localError, setLocalError] = useState('');

  const fetchData = async () => {
    const response = await dispatch(fetchOptStatusBreakdown(startDate, endDate, role));

    if (response.message) {
      setLocalError(response.message);
      setLocalBreakdown([]);
    } else if (response.breakDown) {
      setLocalBreakdown(response.breakDown);
      setLocalError('');
    } else {
      setLocalBreakdown([]);
      setLocalError('Unexpected response from server');
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, role, dispatch]);

  const labels = localBreakdown.map(d => d.optStatus);
  const dataCounts = localBreakdown.map(d => d.count);
  const total = dataCounts.reduce((sum, value) => sum + value, 0);
  const backgroundColors = labels.map(label => COLORS[label] || '#ccc');

  const chartData = {
    labels,
    datasets: [
      {
        data: dataCounts,
        backgroundColor: backgroundColors,
        borderWidth: 2,
        borderColor: darkMode ? '#2a3b55' : '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 70,
        bottom: 70,
        left: 130,
        right: 130,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'end',
        offset: LABEL_OFFSET,
        clamp: false,
        clip: false,
        color: darkMode ? '#cccccc' : '#555555',
        font: {
          size: 12,
          weight: 'normal',
        },
        formatter: (value, context) => {
          const label = context.chart.data.labels[context.dataIndex];
          const percent = ((value / total) * 100).toFixed(1);
          return `${label}\n${percent}%`;
        },
        textAlign: 'center',
      },
      tooltip: {
        callbacks: {
          title: () => '',
          label: context => {
            const count = context.raw;
            const percent = ((count / total) * 100).toFixed(1);
            return `${percent}% (${count})`;
          },
        },
      },
    },
  };

  return (
    <div
      className={darkMode ? styles.optStatusContainerDarkMode : styles.optStatusContainerLightMode}
    >
      <div className={styles.optStatusContainer}>
        <h2 className={styles.optStatusTitle}>Breakdown by OPT Status</h2>

        <div className={styles.chartFilterLayout}>
          <div className={styles.pieChartWrapper}>
            {localError ? (
              <div className={styles.errorMessage}>{localError}</div>
            ) : (
              <Pie data={chartData} options={options} />
            )}
          </div>

          <div className={styles.filters}>
            <label>
              <strong>Dates</strong>
              <div className={styles.dateInputs}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Reset
                </button>
              </div>
            </label>

            <label>
              <strong>Role</strong>
              <select value={role} onChange={e => setRole(e.target.value)}>
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptStatusPieChart;
