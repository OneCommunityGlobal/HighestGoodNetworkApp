import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useHistory } from 'react-router-dom';
import './ToolsHorizontalBarChart.css';

// Sample data - replace with API data
const dummyData = [
  {
    name: 'Pipe Wrench',
    inUse: 80,
    needsReplacement: 90,
    yetToReceive: 30,
  },
  {
    name: 'Hammer',
    inUse: 150,
    needsReplacement: 10,
    yetToReceive: 15,
  },
  {
    name: 'Wedge',
    inUse: 100,
    needsReplacement: 20,
    yetToReceive: 25,
  },
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tools-chart-tooltip">
        <p className="tool-name">{payload[0].payload.name}</p>
        {payload.map(entry => (
          <p key={entry.dataKey} className="tool-usage" style={{ color: entry.color }}>
            {entry.dataKey === 'inUse'
              ? 'In Use'
              : entry.dataKey === 'needsReplacement'
              ? 'Needs to be replaced'
              : 'Yet to receive'}
            : {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLabel = props => {
  const { x, y, width, value } = props;
  if (value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y + 15}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
    >
      {value}
    </text>
  );
};

function ToolsHorizontalBarChart({
  darkMode,
  isFullPage = false,
  projectId = 'all',
  startDate = null,
  endDate = null,
}) {
  const [data, setData] = useState(dummyData);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would send these parameters to the API
        // Example API call with filters
        // const queryParams = new URLSearchParams();
        // if (projectId !== 'all') queryParams.append('projectId', projectId);
        // if (startDate) queryParams.append('startDate', startDate.toISOString());
        // if (endDate) queryParams.append('endDate', endDate.toISOString());
        // const response = await fetch(`/api/tools/availability?${queryParams}`);
        // const data = await response.json();
        // setData(data);

        // For now, simulate filtering with dummy data
        setTimeout(() => {
          // This is a placeholder for actual API integration
          // In reality, the server would filter the data based on the parameters

          // Simple client-side filtering for demonstration:
          let filteredData = [...dummyData];

          // If we had real project-specific data, we'd filter like this:
          // if (projectId !== 'all') {
          //   filteredData = filteredData.filter(item => item.projectId === projectId);
          // }

          // Mock different data based on projectId to demonstrate the effect
          if (projectId !== 'all') {
            filteredData = filteredData.map(item => ({
              ...item,
              inUse: Math.floor(item.inUse * 0.7),
              needsReplacement: Math.floor(item.needsReplacement * 0.5),
              yetToReceive: Math.floor(item.yetToReceive * 0.8),
            }));
          }

          setData(filteredData);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching tools data:', error);
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [projectId, startDate, endDate]);

  const handleCardClick = () => {
    if (!isFullPage) {
      history.push('/bmdashboard/tools-availability');
    }
  };

  return (
    <div
      className={`tools-horizontal-chart-container ${darkMode ? 'dark-mode' : ''} ${
        isFullPage ? 'full-page' : ''
      } ${loading ? 'loading' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: isFullPage ? 'default' : 'pointer' }}
    >
      <h3 className="tools-chart-title">
        Tools by Availability
        {isFullPage && (
          <div className="tools-chart-filter-info">
            {projectId !== 'all' && <span className="filter-tag">Filtered by Project</span>}
            {startDate && (
              <span className="filter-tag">From: {startDate.toLocaleDateString()}</span>
            )}
            {endDate && <span className="filter-tag">To: {endDate.toLocaleDateString()}</span>}
          </div>
        )}
      </h3>

      {loading ? (
        <div className="tools-chart-loading">Loading...</div>
      ) : (
        <ResponsiveContainer width="100%" height={isFullPage ? 500 : 300}>
          <BarChart
            layout="vertical"
            data={data}
            margin={
              isFullPage
                ? { top: 20, right: 30, left: 100, bottom: 5 }
                : { top: 20, right: 20, left: 60, bottom: 5 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 'dataMax + 20']} tickCount={6} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: darkMode ? '#e0e0e0' : '#333' }}
              width={isFullPage ? 90 : 60}
              tickMargin={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign={isFullPage ? 'bottom' : 'top'} height={36} />
            <Bar dataKey="inUse" stackId="a" fill="#4589FF" name="In Use">
              <LabelList content={<CustomLabel />} />
            </Bar>
            <Bar dataKey="needsReplacement" stackId="a" fill="#FF0000" name="Needs to be replaced">
              <LabelList content={<CustomLabel />} />
            </Bar>
            <Bar dataKey="yetToReceive" stackId="a" fill="#FFB800" name="Yet to receive">
              <LabelList content={<CustomLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
