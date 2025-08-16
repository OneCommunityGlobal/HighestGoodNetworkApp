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
import './OptStatusPieChart.css';

ChartJS.register(ChartDataLabels);

const COLORS = {
  'OPT started': '#f44336',
  'CPT not eligible': '#f4e34cfc',
  'OPT not yet started': '#2196f3',
  Citizen: '#4caf50',
  'N/A': '#ff9800',
};

const OptStatusPieChart = () => {
  const dispatch = useDispatch();
  const { optStatusBreakdown } = useSelector(state => state.optStatusBreakdown);
  // const { optStatusBreakdown = [] } = useSelector(state => state.optStatus);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    dispatch(fetchOptStatusBreakdown(startDate, endDate, role));
  }, [startDate, endDate, role, dispatch]);

  const labels = optStatusBreakdown.map(d => d.optStatus);
  const dataCounts = optStatusBreakdown.map(d => d.count);
  const total = dataCounts.reduce((sum, value) => sum + value, 0);
  const backgroundColors = labels.map(label => COLORS[label] || '#ccc');

  const chartData = {
    labels,
    datasets: [
      {
        data: dataCounts,
        backgroundColor: backgroundColors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#000',
        font: { weight: 'bold' },
        // eslint-disable-next-line no-unused-vars
        formatter: (value, context) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%\n(${value})`;
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const count = context.raw;
            const percent = ((count / total) * 100).toFixed(1);
            const { label } = context;
            return `${label}: ${percent}% (${count})`;
          },
        },
      },
    },
  };

  return (
    <div className="opt-status-container">
      <h2 className="opt-status-title">Breakdown by OPT Status</h2>

      <div className="chart-filter-layout">
        <div className="pie-chart-wrapper">
          <Pie data={chartData} options={options} />
        </div>

        <div className="filters">
          <label>
            <span>
              <strong>Dates</strong>
            </span>
            <div className="date-inputs">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              <button
                type="button"
                className="reset-btn"
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
            <span>
              <strong>Role</strong>
            </span>
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
  );
};

export default OptStatusPieChart;
