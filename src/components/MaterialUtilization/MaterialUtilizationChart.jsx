'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  LabelList,
} from 'recharts';
import { format, sub, parseISO } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import Select from 'react-select';

import styles from './MaterialUtilizationChart.module.css';
// Make sure this relative path is correct for your project
import { ENDPOINTS } from '../../utils/URL';

// 1. Custom Tooltip (as required by spec)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalUnits = data.used + data.unused;
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipItem}>
          Used: {data.usedPct.toFixed(1)}% ({data.used} units)
        </p>
        <p className={styles.tooltipItem}>
          Unused: {data.unusedPct.toFixed(1)}% ({data.unused} units)
        </p>
        <p className={styles.tooltipItem}>Total: {totalUnits} units</p>
      </div>
    );
  }
  return null;
};

// 2. Custom Label for inside the bar (hides if < 8%)
const formatPercentLabel = value => {
  if (value < 8) return '';
  return `${value.toFixed(1)}%`;
};

export default function MaterialUtilizationChart() {
  // State for chart
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const eightWeeksAgo = sub(today, { weeks: 8 });
    return { from: eightWeeksAgo, to: today };
  });

  // Fetch projects and materials on load
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch Projects
        const projectsRes = await axios.get(ENDPOINTS.DISTINCT_PROJECTS());
        if (Array.isArray(projectsRes.data)) {
          setAvailableProjects(projectsRes.data);
        }

        // Fetch Materials
        const materialsRes = await axios.get(ENDPOINTS.DISTINCT_MATERIALS());
        if (Array.isArray(materialsRes.data)) {
          setAvailableMaterials(materialsRes.data);
        }
      } catch (err) {
        toast.error('Failed to load filters.');
      }
    };

    fetchFilterData();
  }, []); // Runs once on component mount

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const url = ENDPOINTS.MATERIAL_UTILIZATION();

    const params = {
      start: dateRange.from.toISOString(),
      end: dateRange.to.toISOString(),
    };

    if (selectedProjects.length > 0) {
      params.projects = selectedProjects;
    }

    if (selectedMaterials.length > 0) {
      params.materials = selectedMaterials;
    }

    try {
      const response = await axios.get(url, { params });

      if (Array.isArray(response.data)) {
        setChartData(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setChartData(response.data.data);
      } else {
        // We leave error logging for actual errors, not for debugging
        // console.error('API did not return an array:', response.data);
        setChartData([]);
      }
    } catch (err) {
      let errorMessage = 'Failed to load material data.';
      if (err.response) {
        if (err.response.status === 404) {
          setChartData([]);
          errorMessage = null;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = 'Network Error: Could not connect to server.';
      } else {
        errorMessage = err.message;
      }
      if (errorMessage) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedProjects, selectedMaterials]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event Handlers
  const handleDateChange = (e, field) => {
    const dateValue = e.target.value;
    if (!dateValue) return;
    const newDate = parseISO(dateValue);
    setDateRange(prev => {
      const newRange = { ...prev, [field]: newDate };
      if (field === 'from' && newRange.from > newRange.to) {
        newRange.to = newRange.from;
      }
      if (field === 'to' && newRange.from > newRange.to) {
        newRange.from = newRange.to;
      }
      return newRange;
    });
  };

  const handleProjectSelectChange = selectedOptions => {
    setSelectedProjects(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  const handleMaterialSelectChange = selectedOptions => {
    setSelectedMaterials(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

  // --- Transform data for react-select ---
  const projectOptions = useMemo(
    () =>
      availableProjects.map(project => ({
        value: project._id,
        label: project.projectName,
      })),
    [availableProjects],
  );

  const materialOptions = useMemo(
    () =>
      availableMaterials.map(material => ({
        value: material._id,
        label: material.materialName,
      })),
    [availableMaterials],
  );

  // Fixes 0-value gray bar
  const chartDisplayData = useMemo(() => {
    if (!Array.isArray(chartData)) return [];
    return chartData.map(item => {
      if (item.used + item.unused === 0) {
        return { ...item, unused: 1 };
      }
      return item;
    });
  }, [chartData]);

  const renderChart = () => {
    if (loading) {
      return <div className={styles.infoMessage}>Loading...</div>;
    }
    if (error) {
      return <div className={styles.infoMessage}>{error}</div>;
    }
    if (!chartDisplayData || chartDisplayData.length === 0) {
      return <div className={styles.infoMessage}>No material records for selected range.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartDisplayData}
          stackOffset="expand"
          margin={{ top: 20, right: 90, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <ReferenceLine
            y={0.85}
            stroke="#16a34a"
            strokeDasharray="4 4"
            strokeWidth={2}
            isFront={true}
          >
            <Label
              value="Goal: 85%"
              position="right"
              fill="#16a34a"
              fontSize={12}
              fontWeight="bold"
              offset={10}
            />
          </ReferenceLine>
          <XAxis
            dataKey="project"
            label={{
              value: 'Projects',
              position: 'insideBottom',
              dy: 15,
              fill: '#374151',
              fontSize: 14,
              fontWeight: 'bold',
            }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={tick => `${tick * 100}%`}
            label={{
              value: '% of Total Material',
              angle: -90,
              position: 'insideLeft',
              dx: -5,
              fill: '#374151',
              fontSize: 14,
              fontWeight: 'bold',
            }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar name="Used" dataKey="used" stackId="a" fill="#3b82f6">
            <LabelList
              dataKey="usedPct"
              position="center"
              fill="#ffffff"
              formatter={formatPercentLabel}
            />
          </Bar>
          <Bar name="Unused" dataKey="unused" stackId="a" fill="#ef4444">
            <LabelList
              dataKey="unusedPct"
              position="center"
              fill="#ffffff"
              formatter={formatPercentLabel}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Material Utilization Ratio</h2>
      <p className={styles.subtitle}>
        Showing data from {format(dateRange.from, 'MMM dd, yyyy')} to{' '}
        {format(dateRange.to, 'MMM dd, yyyy')}
      </p>

      <div className={styles.filtersContainer}>
        {/* Date Filters */}
        <div className={styles.filterGroup}>
          <label htmlFor="startDate" className={styles.filterLabel}>
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            className={styles.dateInput}
            value={format(dateRange.from, 'yyyy-MM-dd')}
            onChange={e => handleDateChange(e, 'from')}
          />
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="endDate" className={styles.filterLabel}>
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            className={styles.dateInput}
            value={format(dateRange.to, 'yyyy-MM-dd')}
            onChange={e => handleDateChange(e, 'to')}
          />
        </div>

        {/* Project Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="projectFilter" className={styles.filterLabel}>
            Projects
          </label>
          <Select
            id="projectFilter"
            isMulti
            options={projectOptions}
            // This handles clearing the filter
            onChange={handleProjectSelectChange}
            placeholder="Select projects (All)"
            closeMenuOnSelect={false}
          />
        </div>

        {/* Material Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="materialFilter" className={styles.filterLabel}>
            Materials
          </label>
          <Select
            id="materialFilter"
            isMulti
            options={materialOptions}
            // This handles clearing the filter
            onChange={handleMaterialSelectChange}
            placeholder="Select materials (All)"
            closeMenuOnSelect={false}
          />
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>{renderChart()}</div>
    </div>
  );
}
