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
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsHorizontalBarChart.css';

// Empty state data (only used if API fails)
const emptyData = [];

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

function ToolsHorizontalBarChart({ darkMode, isFullPage = false, projectId, startDate, endDate }) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const history = useHistory();

  // Fetch all projects for potential aggregate view
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isFullPage || (isFullPage && !projectId)) {
        try {
          const response = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
          setAllProjects(response.data);
        } catch (err) {
          console.error('Error fetching projects:', err);
        }
      }
    };

    fetchProjects();
  }, [isFullPage, projectId]);

  // Fetch tools data for a specific project or for all projects
  useEffect(() => {
    const fetchToolsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In full page mode with no project selected, don't fetch anything
        if (isFullPage && !projectId) {
          setData(emptyData);
          setLoading(false);
          return;
        }

        // If we have a specific project ID, fetch data for that project
        if (projectId) {
          const url = ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId, startDate, endDate);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity
            const sortedData = [...responseData].sort((a, b) => {
              const totalA = a.inUse + a.needsReplacement + a.yetToReceive;
              const totalB = b.inUse + b.needsReplacement + b.yetToReceive;
              return totalB - totalA;
            });
            setData(sortedData);
          } else {
            setData(emptyData);
            if (isFullPage) {
              setError('No tool availability data found for this project.');
            }
          }
        }
        // For widget view or when no specific project is selected, fetch first project as sample
        else if (!isFullPage && allProjects.length > 0) {
          // Use first project for the widget view
          const firstProject = allProjects[0];
          const url = ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(firstProject.projectId, null, null);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity
            const sortedData = [...responseData].sort((a, b) => {
              const totalA = a.inUse + a.needsReplacement + a.yetToReceive;
              const totalB = b.inUse + b.needsReplacement + b.yetToReceive;
              return totalB - totalA;
            });
            setData(sortedData);
          } else {
            setData(emptyData);
          }
        } else {
          setData(emptyData);
        }
      } catch (err) {
        console.error('Error fetching tools data:', err);
        setData(emptyData);
        if (isFullPage) {
          setError('Failed to load tools availability data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [projectId, startDate, endDate, isFullPage, allProjects]);

  const handleCardClick = () => {
    if (!isFullPage) {
      history.push('/bmdashboard/tools-availability');
    }
  };

  return (
    <div
      className={`tools-horizontal-chart-container ${darkMode ? 'dark-mode' : ''} ${
        isFullPage ? 'full-page' : ''
      }`}
      onClick={handleCardClick}
      style={{ cursor: isFullPage ? 'default' : 'pointer' }}
    >
      <h3 className="tools-chart-title">
        {isFullPage && projectId
          ? `Tools by Availability - Project ${projectId}`
          : 'Tools by Availability'}
      </h3>

      {error && <div className="tools-chart-error">{error}</div>}

      {loading ? (
        <div className="tools-chart-loading">Loading tool availability data...</div>
      ) : data.length > 0 ? (
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
      ) : (
        !error &&
        !loading && (
          <div className="tools-chart-empty">
            <p>No data available for the selected filters.</p>
          </div>
        )
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
