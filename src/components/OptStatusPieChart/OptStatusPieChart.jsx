/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prettier/prettier */
/* eslint-disable react/function-component-definition */
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOptStatusBreakdown } from '../../actions/optStatusBreakdownAction';
import { roleOptions } from './filter';
import 'chart.js/auto';
import './OptStatusPieChart.css';

const COLORS = {
  'OPT started': '#f44336',
  'CPT (Not Eligible)': '#f4e34cfc',
  'OPT not yet started': '#2196f3',
  'Just want to volunteer': '#e91e63',
  'Citizen': '#4caf50', 
  'N/A': '#ff9800'
};

const OptStatusPieChart = () => {
  const dispatch = useDispatch();
  const { optStatusBreakdown } = useSelector(state => state.optStatus);
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
    labels: labels.map((label, index) =>
      `${label}\n${((dataCounts[index] / total) * 100).toFixed(1)}% (${dataCounts[index]})`
    ),
    datasets: [
      {
        data: dataCounts,
        backgroundColor: backgroundColors
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const count = context.raw;
            const percent = ((count / total) * 100).toFixed(1);
            return `${context.label} → ${percent}% (${count})`;
          }
        }
      }
    }
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">Breakdown of Candidates by OPT Status</h2>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      <div className="pie-chart-wrapper h-96">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default OptStatusPieChart;
