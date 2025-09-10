import { useState, useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { mockProjects, mockData } from './mockData';
import CustomDropdown from './DropDown';
import CustomLabel from './Label';
import CustomTooltip from './Tooltip';
import styles from './MostWastedMaterials.module.css';

export default function MostWastedMaterialsDashboard() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0],
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = mockData[selectedProject.id] || mockData.all;
    const sortedData = [...data].sort((a, b) => b.wastePercentage - a.wastePercentage);
    setChartData(sortedData);
  }, [selectedProject, dateRange]);

  return (
    <div className={`${styles.mostWastedMaterialsContainer}`}>
      <div className={`${styles.mostWastedMaterialsHeader}`}>
        <h1>Most Wasted Materials</h1>
      </div>

      <div className={`${styles.mostWastedMaterialsCard}`}>
        <div className={`${styles.mostWastedMaterialsFilter}`}>
          {/* Project Filter */}
          <div className={`${styles.mostWastedMaterialsFilterItem}`}>
            <label htmlFor="project-filter">Project Filter</label>
            <CustomDropdown
              options={mockProjects}
              selected={selectedProject}
              onSelect={setSelectedProject}
            />
          </div>

          {/* Date Filter */}
          <div className={`${styles.mostWastedMaterialsFilterItem}`}>
            <label htmlFor="date-filter">Date Filter</label>
            <div className={`${styles.dateFilterGrid}`}>
              <div>
                <label htmlFor="date-from" className={`${styles.dateLabel}`}>
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className={`${styles.dateInput}`}
                />
              </div>
              <div>
                <label htmlFor="date-to" className={`${styles.dateLabel}`}>
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className={`${styles.dateInput}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="material"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                interval={0}
                tick={{ fill: '#374151' }}
              />
              <YAxis
                label={{
                  value: 'Percentage of Material Wasted (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#374151' },
                }}
                fontSize={12}
                tick={{ fill: '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="wastePercentage"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                label={<CustomLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
