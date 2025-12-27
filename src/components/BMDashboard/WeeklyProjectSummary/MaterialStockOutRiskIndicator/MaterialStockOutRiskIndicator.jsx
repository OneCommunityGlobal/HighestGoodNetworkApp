import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './MaterialStockOutRiskIndicator.module.css';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>
        Days until stock-out: <strong>{data.daysUntilStockOut}</strong>
      </p>
      <p className={styles.tooltipProject}>Project: {data.projectName}</p>
    </div>
  );
}

// Function to get color based on days until stock-out
// Red-Orange for critically low (0-10 days), transitioning to green for safe (30+ days)
const getColorByDays = days => {
  if (days <= 5) return '#FF0000'; // Red - Critical
  if (days <= 10) return '#FF6B35'; // Orange-Red
  if (days <= 15) return '#FFA500'; // Orange
  if (days <= 20) return '#FFD700'; // Yellow-Orange
  if (days <= 25) return '#ADFF2F'; // Yellow-Green
  return '#32CD32'; // Green - Safe
};

// Mock data generator - Replace with real API call
const generateMockData = (projects, selectedProjectIds) => {
  const materials = ['Steel', 'Concrete', 'Bricks', 'Lumber', 'Copper', 'Cement', 'Sand', 'Gravel'];
  const data = [];

  // Filter projects based on selection
  const filteredProjects =
    selectedProjectIds.length === 0 || selectedProjectIds.includes('All')
      ? projects
      : projects.filter(p => selectedProjectIds.includes(p._id));

  filteredProjects.forEach(project => {
    materials.forEach((material, index) => {
      // Generate realistic days until stock-out (5-30 days)
      const daysUntilStockOut = 5 + Math.floor(Math.random() * 25);
      data.push({
        materialName: material,
        projectId: project._id,
        projectName: project.name || `Project ${project._id}`,
        daysUntilStockOut,
        riskIndicator: daysUntilStockOut, // Risk indicator is the same as days
      });
    });
  });

  // Sort by days until stock-out (lowest first - most critical)
  return data.sort((a, b) => a.daysUntilStockOut - b.daysUntilStockOut);
};

function MaterialStockOutRiskIndicator() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([{ label: 'All', value: 'All' }]);
  const [chartData, setChartData] = useState([]);

  // Fetch projects on mount
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Fetch or generate data when projects or selection changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint when available
        // const selectedProjectIds = selectedProjects
        //   .map(p => p.value)
        //   .filter(id => id !== 'All');
        // const response = await axios.get(ENDPOINTS.BM_MATERIAL_STOCK_OUT_RISK, {
        //   params: {
        //     projectIds: selectedProjectIds.length > 0 ? selectedProjectIds.join(',') : 'all',
        //   },
        // });
        // setChartData(response.data);

        // For now, use mock data
        const selectedProjectIds = selectedProjects.map(p => p.value).filter(id => id !== 'All');
        const mockData = generateMockData(projects, selectedProjectIds);
        setChartData(mockData);
      } catch (err) {
        console.error('Error fetching material stock-out risk data:', err);
        setError('Failed to load material stock-out risk data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (projects.length > 0) {
      fetchData();
    }
  }, [projects, selectedProjects]);

  // Prepare chart data with labels combining material and project
  const formattedChartData = useMemo(() => {
    return chartData.map(item => ({
      ...item,
      label: `${item.materialName} - ${item.projectName}`,
      color: getColorByDays(item.daysUntilStockOut),
    }));
  }, [chartData]);

  // Project options for multi-select
  const projectOptions = useMemo(() => {
    const options = [{ label: 'All', value: 'All' }];
    projects.forEach(project => {
      options.push({
        label: project.name || `Project ${project._id}`,
        value: project._id,
      });
    });
    return options;
  }, [projects]);

  const handleProjectChange = selectedOptions => {
    setSelectedProjects(selectedOptions || [{ label: 'All', value: 'All' }]);
  };

  // Custom select styles for dark mode
  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#2c3344' : '#fff',
        borderColor: darkMode ? '#364156' : '#ccc',
        minHeight: '32px',
        fontSize: '12px',
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#2c3344' : '#fff',
        fontSize: '12px',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused
          ? darkMode
            ? '#364156'
            : '#f0f0f0'
          : darkMode
          ? '#2c3344'
          : '#fff',
        color: darkMode ? '#e0e0e0' : '#333',
        fontSize: '12px',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#364156' : '#e6e6e6',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#e0e0e0' : '#333',
        fontSize: '12px',
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#aaaaaa' : '#999',
        fontSize: '12px',
      }),
    }),
    [darkMode],
  );

  if (loading) {
    return (
      <div
        className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}
        style={{ minHeight: '400px' }}
      >
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        <div className={styles.loading}>Loading chart data...</div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <div
        className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}
        style={{ minHeight: '400px' }}
      >
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>Material Stock-Out Risk Indicator</h4>
        {selectedProjects.length > 0 && selectedProjects[0].value === 'All' && (
          <span className={styles.projectLabel}>Project ALL</span>
        )}
      </div>

      {/* Projects Multi-Select Filter */}
      <div className={styles.filterGroup}>
        <label htmlFor="projects-select" className={styles.filterLabel}>
          Projects
        </label>
        <Select
          id="projects-select"
          className={styles.select}
          classNamePrefix="select"
          value={selectedProjects}
          onChange={handleProjectChange}
          options={projectOptions}
          placeholder="Select projects"
          isMulti
          isClearable={false}
          closeMenuOnSelect={false}
          styles={selectStyles}
        />
      </div>

      {formattedChartData.length > 0 ? (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={Math.max(400, formattedChartData.length * 50)}>
            <BarChart
              layout="vertical"
              data={formattedChartData}
              margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                label={{
                  value: 'Days until Stock-Out',
                  position: 'insideBottom',
                  offset: -5,
                  style: { textAnchor: 'middle', fill: darkMode ? '#e0e0e0' : '#333' },
                }}
                tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 11 }}
                width={140}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="daysUntilStockOut" name="Days until Stock-Out" radius={[0, 4, 4, 0]}>
                {formattedChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="daysUntilStockOut"
                  position="right"
                  style={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className={styles.legend}>
            <div className={styles.legendTitle}>Risk Level:</div>
            <div className={styles.legendItems}>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FF0000' }} />
                <span>Critical (0-5 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FF6B35' }} />
                <span>High (6-10 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FFA500' }} />
                <span>Medium (11-15 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#FFD700' }} />
                <span>Low (16-20 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#ADFF2F' }} />
                <span>Safe (21-25 days)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendColor} style={{ backgroundColor: '#32CD32' }} />
                <span>Very Safe (26+ days)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>No material stock-out risk data available</p>
        </div>
      )}
    </div>
  );
}

export default MaterialStockOutRiskIndicator;
