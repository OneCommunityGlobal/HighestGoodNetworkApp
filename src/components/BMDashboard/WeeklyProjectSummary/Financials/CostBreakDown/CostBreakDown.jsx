import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement } from 'chart.js';
import {
  getAllProjectsCostBreakdown,
  getProjectCostBreakdown,
  getCostBreakdownByDateRange,
} from '../../../../../actions/bmdashboard/costBreakdownActions';
import { fetchBMProjects } from '../../../../../actions/bmdashboard/projectActions';
import './CostBreakdownChart.css';

Chart.register(ArcElement);

function CostBreakdownChart({ data, darkMode }) {
  if (!data || !data.breakdown || data.breakdown.length === 0) {
    return <div>No breakdown data available</div>;
  }

  const { projectName, totalCost, breakdown } = data;

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  const chartData = {
    labels: breakdown.map(item => item.category),
    datasets: [
      {
        data: breakdown.map(item => item.amount),
        backgroundColor: colors.slice(0, breakdown.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 10,
          weight: 'bold',
        },
        formatter: value => {
          return `$${(value / 1000).toFixed(0)}k`;
        },
        align: 'center',
        anchor: 'center',
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
    cutout: '60%',
  };

  return (
    <section className="cost-breakdown-container" aria-label="Cost Breakdown Overview">
      <div className="cost-breakdown-chart" role="img" aria-label="Cost Breakdown Donut Chart">
        <Doughnut data={chartData} options={options} plugins={[ChartDataLabels]} />
        <div className="cost-breakdown-center">
          <h3 className="cost-breakdown-project" style={{ color: darkMode ? '#fff' : '#000' }}>
            {projectName}
          </h3>
          <p className="cost-breakdown-total" style={{ color: darkMode ? '#fff' : '#000' }}>
            ${(totalCost / 1000).toFixed(0)}k
          </p>
          <p className="cost-breakdown-label" style={{ color: darkMode ? '#fff' : '#000' }}>
            TOTAL COST
          </p>
        </div>
      </div>
      <div className="cost-breakdown-labels">
        {breakdown.map((item, index) => (
          <div key={item.category} className="cost-breakdown-label-item">
            <span
              className="cost-breakdown-color"
              style={{ backgroundColor: colors[index] }}
              aria-hidden="true"
            />
            <span className="cost-breakdown-text" style={{ color: darkMode ? '#fff' : '#000' }}>
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CostDonutChartComponent() {
  const dispatch = useDispatch();

  const costBreakdownState = useSelector(state => state.costBreakdown || {});
  const { data: costBreakdownData, fetching, error } = costBreakdownState;

  const bmProjects = useSelector(state => state.bmProjects || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [dateRange, setDateRange] = useState('ALL');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    dispatch(getAllProjectsCostBreakdown());
    dispatch(fetchBMProjects());
  }, [dispatch]);

  const chartData = useMemo(() => {
    if (!costBreakdownData) return null;

    return {
      projectName: costBreakdownData.project || 'Cost Breakdown',
      totalCost: costBreakdownData.totalCost || 0,
      percentageChange: costBreakdownData.percentageChange || '',
      breakdown: costBreakdownData.breakdown || [],
    };
  }, [costBreakdownData]);

  const handleProjectChange = event => {
    const projectId = event.target.value;
    setSelectedProjectId(projectId);

    const isCustomDateRangeSelected =
      dateRange === 'CUSTOM' && customDateRange.startDate && customDateRange.endDate;

    if (isCustomDateRangeSelected) {
      dispatch(
        getCostBreakdownByDateRange(
          customDateRange.startDate,
          customDateRange.endDate,
          projectId === 'all' ? null : projectId,
        ),
      );
    } else if (projectId === 'all') {
      dispatch(getAllProjectsCostBreakdown());
    } else {
      dispatch(getProjectCostBreakdown(projectId));
    }
  };

  const handleDateChange = event => {
    const range = event.target.value;
    setDateRange(range);

    let startDate;
    let endDate;

    switch (range) {
      case '30_DAYS':
        [endDate] = new Date().toISOString().split('T');
        [startDate] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T');
        dispatch(
          getCostBreakdownByDateRange(
            startDate,
            endDate,
            selectedProjectId === 'all' ? null : selectedProjectId,
          ),
        );
        break;

      case '90_DAYS':
        [endDate] = new Date().toISOString().split('T');
        [startDate] = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T');
        dispatch(
          getCostBreakdownByDateRange(
            startDate,
            endDate,
            selectedProjectId === 'all' ? null : selectedProjectId,
          ),
        );
        break;

      case '1_YEAR':
        [endDate] = new Date().toISOString().split('T');
        [startDate] = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T');
        dispatch(
          getCostBreakdownByDateRange(
            startDate,
            endDate,
            selectedProjectId === 'all' ? null : selectedProjectId,
          ),
        );
        break;

      case 'ALL':
      default:
        if (selectedProjectId === 'all') {
          dispatch(getAllProjectsCostBreakdown());
        } else {
          dispatch(getProjectCostBreakdown(selectedProjectId));
        }
        break;
    }
  };

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      dispatch(
        getCostBreakdownByDateRange(
          customDateRange.startDate,
          customDateRange.endDate,
          selectedProjectId === 'all' ? null : selectedProjectId,
        ),
      );
    }
  };

  const renderChart = () => {
    if (fetching) {
      return (
        <div
          style={{
            width: '400px',
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Loading chart data...
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            width: '400px',
            height: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          No data available to display
        </div>
      );
    }

    return <CostBreakdownChart data={chartData} darkMode={darkMode} />;
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        minWidth: '300px',
        height: 'auto',
        minHeight: '350px',
        padding: '12px',
        backgroundColor: darkMode ? '#2B3E5A' : '#fff',
        borderRadius: '6px',
        boxSizing: 'border-box',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: darkMode ? '#fff' : '#333',
          margin: '0 0 12px 0',
        }}
      >
        Cost Breakdown by Category
      </h2>

      <div
        className="cost-breakdown-controls"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
          paddingBottom: '6px',
        }}
      >
        <div>
          <label
            htmlFor="project-filter"
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Project:
          </label>
          <select
            id="project-filter"
            value={selectedProjectId}
            onChange={handleProjectChange}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '110px',
              backgroundColor: 'white',
              marginTop: '4px',
            }}
          >
            <option value="all">All Projects</option>
            {bmProjects &&
              bmProjects.length > 0 &&
              bmProjects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.projectName || project.name || project.title || 'Unnamed Project'}
                </option>
              ))}
          </select>
        </div>

        <div style={{ textAlign: 'right' }}>
          <label
            htmlFor="date-filter"
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Dates:
          </label>
          <select
            id="date-filter"
            value={dateRange}
            onChange={handleDateChange}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '11px',
              width: '85px',
              backgroundColor: 'white',
              marginTop: '4px',
            }}
          >
            <option value="ALL">All Time</option>
            <option value="30_DAYS">Last 30 Days</option>
            <option value="90_DAYS">Last 3 Months</option>
            <option value="1_YEAR">Last Year</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      {dateRange === 'CUSTOM' && (
        <div style={{ marginBottom: '12px', fontSize: '11px' }}>
          {' '}
          {}
          <input
            type="date"
            value={customDateRange.startDate}
            onChange={({ target: { value } }) =>
              setCustomDateRange(prev => ({ ...prev, startDate: value }))
            }
            style={{ marginRight: '6px', padding: '3px' }}
          />
          <input
            type="date"
            value={customDateRange.endDate}
            onChange={({ target: { value } }) =>
              setCustomDateRange(prev => ({ ...prev, endDate: value }))
            }
            style={{ marginRight: '6px', padding: '3px' }}
          />
          <button
            type="button"
            onClick={handleCustomDateSubmit}
            style={{ padding: '3px 6px', fontSize: '10px' }}
          >
            Apply
          </button>
        </div>
      )}

      {renderChart()}
    </div>
  );
}

CostBreakdownChart.propTypes = {
  data: PropTypes.shape({
    projectName: PropTypes.string.isRequired,
    totalCost: PropTypes.number.isRequired,
    breakdown: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        amount: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }),
  darkMode: PropTypes.bool,
};

CostBreakdownChart.defaultProps = {
  data: null,
  darkMode: false,
};

export default CostDonutChartComponent;
