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

function ToolsHorizontalBarChart({ darkMode, isFullPage = false }) {
  const [data, setData] = useState(dummyData);
  const history = useHistory();

  useEffect(() => {
    const fetchToolsData = async () => {
      try {
        // Example API call - replace with actual endpoint
        // const response = await fetch('/api/tools/availability');
        // const data = await response.json();
        // setData(data);

        // Using dummy data for now
        setData(dummyData);
      } catch (error) {
        console.error('Error fetching tools data:', error);
      }
    };

    fetchToolsData();
  }, []);

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
      <h3 className="tools-chart-title">Tools by Availability</h3>

      <ResponsiveContainer width="100%" height={isFullPage ? 500 : 300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: darkMode ? '#e0e0e0' : '#333' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
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
    </div>
  );
}

export default ToolsHorizontalBarChart;
