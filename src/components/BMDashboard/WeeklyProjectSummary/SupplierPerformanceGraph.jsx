/* eslint-disable no-console */
/* eslint-disable no-shadow */
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { fetchAllProjects } from '../../../actions/projects';
import { fetchSupplierPerformance } from '../../../actions/summaryDashboard';

const SupplierPerformanceDashboard = function(props) {
  const { onDataLoaded, className, height = 400, showTitle = true, enableFilters = true } = props;
  const darkMode = props.state?.theme?.darkMode;

  const [supplierData, setSupplierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await props.fetchAllProjects();
      } catch (error) {
        console.error('Failed to fetch projects:', error.message);
      }
    };
    fetchProjects();
  }, [props.fetchAllProjects]);

  // Fetch supplier data when filters change
  useEffect(() => {
    if (!selectedProject) return;

    const fetchSupplierData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await props.fetchSupplierPerformance({
          projectId: selectedProject,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });

        setSupplierData(data);

        if (onDataLoaded && typeof onDataLoaded === 'function') {
          onDataLoaded(data);
        }
      } catch (err) {
        console.error('Failed to load supplier data:', err.message);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [selectedProject, dateRange, onDataLoaded, props.fetchSupplierPerformance]);

  // Event handlers
  const handleProjectChange = e => {
    setSelectedProject(e.target.value);
  };

  const handleDateChange = e => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Inline styles
  const styles = {
    container: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      ...(className && { className }),
    },
    dashboardContent: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: darkMode ? '#2d3748' : '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      padding: '20px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: darkMode ? '#e2e8f0' : '#333',
      marginBottom: '16px',
    },
    filterControls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px',
      alignItems: 'center',
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px 15px',
      borderRadius: '4px',
      marginBottom: '15px',
      fontSize: '14px',
    },
    chartContainer: {
      backgroundColor: darkMode ? '#1a202c' : '#f9f9f9',
      borderRadius: '6px',
      padding: '15px',
      minHeight: '300px',
    },
    messageText: {
      color: darkMode ? '#a0aec0' : '#6c757d',
      fontSize: '14px',
      padding: '20px',
      textAlign: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.dashboardContent}>
        {showTitle && <h3 style={styles.title}>Supplier Performance by On-Time Delivery %</h3>}

        {enableFilters && (
          <div style={styles.filterControls}>
            {/* Project Selector */}
            <Input
              type="select"
              value={selectedProject}
              onChange={handleProjectChange}
              aria-label="Project Filter"
              style={{ minWidth: '140px', maxWidth: '220px' }}
            >
              <option value="" disabled>
                Select a Project
              </option>
              <option value="all">All Projects</option>
              {props.state.allProjects.projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </Input>

            {/* Start Date Input */}
            <Input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              aria-label="Start Date"
              style={{ minWidth: '140px', maxWidth: '220px' }}
            />

            {/* End Date Input */}
            <Input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              aria-label="End Date"
              style={{ minWidth: '140px', maxWidth: '220px' }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && <div style={styles.errorMessage}>{error}</div>}

        {/* Chart Rendering */}
        <div style={styles.chartContainer}>
          {loading && <div style={styles.messageText}>Loading...</div>}
          {supplierData.length > 0 ? (
            <ResponsiveContainer width="100%" height={height}>
              <BarChart data={supplierData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="supplierName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onTimeDeliveryPercentage" fill="#4CAF50">
                  <LabelList dataKey="onTimeDeliveryPercentage" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.messageText}>
              No data available for the selected project and date range.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  state,
});

export default connect(mapStateToProps, {
  fetchAllProjects,
  fetchSupplierPerformance,
})(SupplierPerformanceDashboard);
