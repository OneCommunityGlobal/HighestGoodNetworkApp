import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ToolsStoppageHorizontalBarChart.css';

const projects = [
  { id: 'p1', name: 'Project Alpha' },
  { id: 'p2', name: 'Project Beta' },
  { id: 'p3', name: 'Project Gamma' },
];

const sampleData = [
  {
    toolName: 'Hammer',
    usedForLifetime: 50,
    damaged: 30,
    lost: 20,
    projectId: 'p1',
    date: new Date('2025-06-01'),
  },
  {
    toolName: 'Drill',
    usedForLifetime: 60,
    damaged: 25,
    lost: 15,
    projectId: 'p2',
    date: new Date('2025-06-02'),
  },
  {
    toolName: 'Wrench',
    usedForLifetime: 70,
    damaged: 20,
    lost: 10,
    projectId: 'p1',
    date: new Date('2025-06-03'),
  },
  {
    toolName: 'Screwdriver',
    usedForLifetime: 40,
    damaged: 35,
    lost: 25,
    projectId: 'p3',
    date: new Date('2025-06-04'),
  },
  {
    toolName: 'Cutter',
    usedForLifetime: 55,
    damaged: 30,
    lost: 15,
    projectId: 'p2',
    date: new Date('2025-06-05'),
  },
  {
    toolName: 'Pliers',
    usedForLifetime: 65,
    damaged: 20,
    lost: 15,
    projectId: 'p3',
    date: new Date('2025-06-06'),
  },
];

function StackedBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [filteredData, setFilteredData] = useState(sampleData);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    let filtered = sampleData;

    if (selectedProject) {
      filtered = filtered.filter(item => item.projectId === selectedProject);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(
        item => new Date(item.date) >= startDate && new Date(item.date) <= endDate,
      );
    }

    setFilteredData(filtered);
  }, [selectedProject, startDate, endDate]);

  return (
    <div className={`chart-container ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      <h2>Reason of Stoppage of Tools</h2>

      <div className="filters">
        <div>
          <label className="label">Project:</label>
          <br />
          <select
            className="select"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Date Range:</label>
          <br />
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={update => setDateRange(update)}
            isClearable
            className="select"
          />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={filteredData}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
          <XAxis type="number" domain={[0, 100]} unit="%" stroke={darkMode ? '#ddd' : '#000'} />
          <YAxis dataKey="toolName" type="category" stroke={darkMode ? '#ddd' : '#000'} />
          <Tooltip
            contentStyle={{
              backgroundColor: darkMode ? '#333' : '#fff',
              color: darkMode ? '#fff' : '#000',
            }}
          />
          <Legend />
          <Bar dataKey="usedForLifetime" stackId="a" fill="blue">
            <LabelList dataKey="usedForLifetime" position="insideRight" />
          </Bar>
          <Bar dataKey="damaged" stackId="a" fill="red">
            <LabelList dataKey="damaged" position="insideRight" />
          </Bar>
          <Bar dataKey="lost" stackId="a" fill="yellow">
            <LabelList dataKey="lost" position="insideRight" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StackedBarChart;
