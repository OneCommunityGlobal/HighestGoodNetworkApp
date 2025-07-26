import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOptStatusBreakdown } from 'redux/actions/optStatusBreakdownActions';
import { roleOptions } from './filters';
import 'chart.js/auto';
import './OptStatusPieChart.css';

const COLORS = {
  'OPT started': '#4caf50',
  'CPT (Not Eligible)': '#f44336',
  'OPT not yet started': '#ff9800',
  'Just want to volunteer': '#2196f3',
  'Citizen': '#9c27b0',
  'N/A': '#bdbdbd'
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

  const labels = optStatusBreakdown.map(d => d.status);
  const dataCounts = optStatusBreakdown.map(d => d.count);
  const total = dataCounts.reduce((sum, value) => sum + value, 0);
  const backgroundColors = labels.map(label => COLORS[label]);

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
    plugins: {
      legend: {
        display: false
      },
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

      <Pie data={chartData} options={options} />
    </div>
  );
};

export default OptStatusPieChart;
