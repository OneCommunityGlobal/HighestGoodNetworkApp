/* eslint-disable no-console */
/* eslint-disable no-shadow */
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Label,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'reactstrap';
import { fetchSupplierProjects, fetchSupplierPerformance } from '../../../actions/summaryDashboard';

const getDateRangeOptions = () => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  return [
    { label: 'ALL', value: 'all', start: '1970-01-01', end: today.toISOString().split('T')[0] },
    {
      label: 'Last 30 Days',
      value: 'last30',
      start: lastMonth.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
    {
      label: 'Last 3 Months',
      value: 'last90',
      start: lastQuarter.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
    {
      label: 'Last Year',
      value: 'lastYear',
      start: lastYear.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    },
  ];
};

const SupplierPerformanceDashboard = function({ className, height = 420, onDataLoaded }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [supplierData, setSupplierData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  // Load projects with supplier data on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await dispatch(fetchSupplierProjects());
        console.log('Loaded projects with supplier data:', projectsData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects');
      }
    };
    loadProjects();
  }, [dispatch]);

  // Fetch supplier performance data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateRangeOptions = getDateRangeOptions();
        const selectedDateObj = dateRangeOptions.find(opt => opt.value === selectedDateRange);

        console.log('Fetching supplier performance data with filters:', {
          projectId: selectedProject,
          dateRange: selectedDateRange,
          startDate: selectedDateObj?.start,
          endDate: selectedDateObj?.end,
        });

        const data = await dispatch(
          fetchSupplierPerformance({
            projectId: selectedProject,
            startDate: selectedDateObj?.start || '1970-01-01',
            endDate: selectedDateObj?.end || new Date().toISOString().split('T')[0],
          }),
        );

        console.log('Received supplier data:', data);
        setSupplierData(Array.isArray(data) ? data : []);
        if (onDataLoaded && typeof onDataLoaded === 'function') {
          onDataLoaded(data);
        }
      } catch (err) {
        console.error('Failed to load supplier performance:', err);
        setError('Failed to load supplier performance');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, selectedDateRange, selectedProject, onDataLoaded]);

  const styles = useMemo(
    () => ({
      container: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        ...(className && { className }),
      },
      headerRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
      },
      title: {
        fontSize: 24,
        fontWeight: 700,
        color: darkMode ? '#f7fafc' : '#2D3748',
        margin: 0,
      },
      rightControls: {
        display: 'flex',
        gap: 24,
        alignItems: 'center',
      },
      control: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
      controlLabel: {
        fontSize: 14,
        fontWeight: 600,
        color: darkMode ? '#e2e8f0' : '#4A5568',
        marginBottom: 2,
      },
      controlValue: {
        fontSize: 14,
        color: darkMode ? '#cbd5e0' : '#718096',
        fontWeight: 500,
      },
      select: {
        minWidth: 140,
        fontSize: 14,
        backgroundColor: darkMode ? '#2b3344' : '#FFFFFF',
        borderColor: darkMode ? '#3a506b' : '#ced4da',
        color: darkMode ? '#ffffff' : '#212529',
      },
      card: {
        border: darkMode ? '1px solid #3a506b' : '1px solid #E2E8F0',
        borderRadius: 8,
        padding: 20,
        background: darkMode ? '#253342' : '#FFFFFF',
        boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      message: {
        textAlign: 'center',
        padding: 32,
        color: darkMode ? '#cbd5e0' : '#718096',
        fontSize: 16,
      },
      chartContainer: {
        marginTop: 8,
      },
    }),
    [className, darkMode],
  );

  // Y-axis domain to match the image (50-100)
  const yDomain = [50, 100];

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: darkMode ? '#2d3748' : 'white',
            padding: '8px 12px',
            border: darkMode ? '1px solid #4a5568' : '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold', color: darkMode ? '#f7fafc' : '#1a202c' }}>
            {`${label}`}
          </p>
          <p style={{ margin: 0, color: '#34A853' }}>{`On-Time Delivery: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.card}
        className={darkMode ? 'supplier-performance-card-dark' : 'supplier-performance-card'}
      >
        <div style={styles.headerRow}>
          <h3 style={styles.title}>Supplier Performance by On-Time Delivery %</h3>
          <div style={styles.rightControls}>
            <div style={styles.control}>
              <span style={styles.controlLabel}>Dates</span>
              <Input
                type="select"
                value={selectedDateRange}
                onChange={e => setSelectedDateRange(e.target.value)}
                style={styles.select}
                className="supplier-performance-select"
                aria-label="Date Range"
              >
                {getDateRangeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Input>
            </div>
            <div style={styles.control}>
              <span style={styles.controlLabel}>Project</span>
              <Input
                type="select"
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
                style={styles.select}
                className="supplier-performance-select"
                aria-label="Project"
              >
                <option value="all">ALL</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project._id}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>

        <div style={styles.chartContainer}>
          {loading && <div style={styles.message}>Loading...</div>}
          {error && <div style={styles.message}>{error}</div>}

          {!loading &&
            !error &&
            (supplierData && supplierData.length > 0 ? (
              <ResponsiveContainer width="100%" height={height}>
                <BarChart data={supplierData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4a5568' : '#E2E8F0'} />
                  <XAxis
                    dataKey="supplierName"
                    interval={0}
                    tickMargin={10}
                    angle={0}
                    textAnchor="middle"
                    height={60}
                    tick={{ fontSize: 12, fill: darkMode ? '#e2e8f0' : '#4A5568' }}
                    axisLine={{ stroke: darkMode ? '#4a5568' : '#E2E8F0' }}
                    tickLine={{ stroke: darkMode ? '#4a5568' : '#E2E8F0' }}
                  >
                    <Label
                      value="Supplier Name"
                      offset={-10}
                      position="insideBottom"
                      style={{
                        textAnchor: 'middle',
                        fontSize: '14px',
                        fill: darkMode ? '#e2e8f0' : '#4A5568',
                      }}
                    />
                  </XAxis>
                  <YAxis
                    domain={yDomain}
                    tickCount={6}
                    tick={{ fontSize: 12, fill: darkMode ? '#e2e8f0' : '#4A5568' }}
                    axisLine={{ stroke: darkMode ? '#4a5568' : '#E2E8F0' }}
                    tickLine={{ stroke: darkMode ? '#4a5568' : '#E2E8F0' }}
                  >
                    <Label
                      value="On time performance"
                      angle={-90}
                      position="insideLeft"
                      style={{
                        textAnchor: 'middle',
                        fontSize: '14px',
                        fill: darkMode ? '#e2e8f0' : '#4A5568',
                      }}
                    />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="onTimeDeliveryPercentage"
                    fill="#4CAF50"
                    maxBarSize={80}
                    radius={[2, 2, 0, 0]}
                  >
                    <LabelList
                      dataKey="onTimeDeliveryPercentage"
                      position="top"
                      style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        fill: darkMode ? '#f7fafc' : '#2D3748',
                      }}
                      formatter={value => `${value}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.message}>No supplier performance data available.</div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SupplierPerformanceDashboard;
