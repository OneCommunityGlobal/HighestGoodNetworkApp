import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './ProjectsGlobalDistribution.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getProjectGlobalDistribution } from '../../actions/bmdashboard/projectActions';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

const ProjectsGlobalDistribution = () => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = date => {
    if (endDate && date && new Date(date) > new Date(endDate)) {
      alert('Start date cannot be later than end date.');
      return;
    }
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    if (startDate && date && new Date(startDate) > new Date(date)) {
      alert('Start date cannot be later than end date.');
      return;
    }
    setEndDate(date);
  };
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const darkMode = useSelector(state => state.theme.darkMode);

  const COLORS = {
    Asia: '#10b981',
    'North America': '#f59e0b',
    Europe: '#3b82f6',
    'South America': '#f97316',
    Africa: '#1e40af',
    'Middle East': '#eab308',
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await getProjectGlobalDistribution();
      setChartData(response);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [statusFilter, startDate, endDate]);

  const filterData = async () => {
    const isStatusOnly = statusFilter !== 'All' && !startDate && !endDate;
    const isBothDatesSet = startDate && endDate;

    if (!isStatusOnly && !isBothDatesSet) {
      if ((startDate && !endDate) || (!startDate && endDate)) {
        return;
      }
      return;
    }
    if (isBothDatesSet && new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be later than end date.');
      return;
    }
    const payload = {
      statusFilter: statusFilter && statusFilter !== 'All' ? statusFilter : null,
      startDate: isBothDatesSet ? startDate : null,
      endDate: isBothDatesSet ? endDate : null,
    };
    const response = await getProjectGlobalDistribution(payload);
    setChartData(response);
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className={'min-h-screen p-8 bg-gradient-to-br from-slate-50 to-slate-100'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">
            Global Distribution of Projects
          </h1>
        </div>

        {/* Filters */}
        <div className="rounded-lg p-6 mb-6">
          <div className={`${styles.filter} grid grid-cols-1 md:grid-cols-3 gap-4`}>
            {/* Status Filter */}
            <div>
              <label
                htmlFor="statusFilter"
                className={`${darkMode && styles.filterDark} ${
                  styles.filterLabel
                } block text-sm font-medium text-slate-700 mb-2`}
              >
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`${darkMode &&
                  styles.filterDark} w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer`}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label
                htmlFor="startDate"
                className={`${styles.filterLabel} block text-sm font-medium text-slate-700 mb-2`}
              >
                From Date
              </label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={handleStartDateChange}
                placeholderText="mm/dd/yyyy"
                className={`${darkMode &&
                  styles.filterDark} w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer`}
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label
                htmlFor="endDate"
                className={`${styles.filterLabel} block text-sm font-medium text-slate-700 mb-2`}
              >
                To Date
              </label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={handleEndDateChange}
                placeholderText="mm/dd/yyyy"
                className={`${darkMode &&
                  styles.filterDark} w-40 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer`}
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 text-lg justify-center"></p>
          </div>
        ) : (
          <div
            className={`${styles.chartContainer} ${
              darkMode ? styles.darkmode : 'bg-white'
            } rounded-lg p-6`}
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={chartData.map(d => ({ ...d, percentage: parseFloat(d.percentage) }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="region"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.region]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => `${value.toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: darkMode ? '#222e3c' : 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={value => <span className="text-slate-700 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-slate-500 text-lg justify-center">
                  No projects match the selected filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsGlobalDistribution;
