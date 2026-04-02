import { useState, useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from 'recharts';
import { mockProjects, mockData } from './mockData';
import CustomDropdown from './DropDown';
import CustomLabel from './Label';
import CustomTooltip from './Tooltip';
import styles from './MostWastedMaterials.module.css';
import { useSelector } from 'react-redux';

const downloadCSV = (rows, filename = 'most-wasted-materials.csv') => {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
  const csv = [headers.join(','), ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export default function MostWastedMaterialsDashboard() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const [chartData, setChartData] = useState([]);
  const [topN, setTopN] = useState(8);
  const [sortDir, setSortDir] = useState('desc');

  const dateBounds = useMemo(() => {
    const data = mockData[selectedProject.id] || mockData.all;
    const dates = data
      .map(item => item.date)
      .filter(Boolean)
      .sort();
    if (dates.length === 0) {
      return { min: '0000-01-01', max: '9999-12-31' };
    }
    return { min: dates[0], max: dates[dates.length - 1] };
  }, [selectedProject]);

  useEffect(() => {
    setDateRange(prev => ({
      from:
        prev.from && prev.from >= dateBounds.min && prev.from <= dateBounds.max
          ? prev.from
          : dateBounds.min,
      to:
        prev.to && prev.to >= dateBounds.min && prev.to <= dateBounds.max
          ? prev.to
          : dateBounds.max,
    }));
  }, [dateBounds]);

  useEffect(() => {
    const data = mockData[selectedProject.id] || mockData.all;
    const fromDate = dateRange.from || dateBounds.min;
    const toDate = dateRange.to || dateBounds.max;
    const minDate = fromDate <= toDate ? fromDate : toDate;
    const maxDate = fromDate <= toDate ? toDate : fromDate;
    const filteredData = data.filter(item => item.date >= minDate && item.date <= maxDate);
    const sortedData = [...filteredData].sort((a, b) =>
      sortDir === 'desc'
        ? b.wastePercentage - a.wastePercentage
        : a.wastePercentage - b.wastePercentage,
    );
    const n = Number(topN);
    const clampedN = Math.max(1, Math.min(20, Number.isNaN(n) ? 8 : n));
    setChartData(sortedData.slice(0, clampedN));
  }, [selectedProject, dateRange, dateBounds, sortDir, topN]);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.mostWastedMaterialsContainer}`}>
        <div className={`${styles.mostWastedMaterialsHeader}`}>
          <h1 className={`${styles.headerTitle}`}>Most Wasted Materials</h1>
        </div>

        <div className={`${styles.mostWastedMaterialsCard}`}>
          <div className={`${styles.mostWastedMaterialsFilter}`}>
            {/* Project Filter */}
            <div className={`${styles.mostWastedMaterialsFilterItem}`}>
              <label htmlFor="project-filter" className={`${styles.filterLabel}`}>
                Project Filter
              </label>
              <CustomDropdown
                options={mockProjects}
                selected={selectedProject}
                onSelect={setSelectedProject}
              />
            </div>

            {/* Date Filter */}
            <div className={`${styles.mostWastedMaterialsFilterItem}`}>
              <label htmlFor="date-filter" className={`${styles.filterLabel}`}>
                Date Filter
              </label>
              <div className={`${styles.dateFilterGrid}`}>
                <div>
                  <label htmlFor="date-from" className={`${styles.dateLabel}`}>
                    From
                  </label>
                  <input
                    id="date-from"
                    type="date"
                    min={dateBounds.min}
                    max={dateBounds.max}
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
                    min={dateBounds.min}
                    max={dateBounds.max}
                    value={dateRange.to}
                    onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className={`${styles.dateInput}`}
                  />
                </div>
              </div>
            </div>

            {/* Top N */}
            <div className={`${styles.mostWastedMaterialsFilterItem}`}>
              <label htmlFor="top-n" className={`${styles.filterLabel}`}>
                Top N
              </label>
              <input
                id="top-n"
                type="number"
                min={1}
                max={8}
                value={topN}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setTopN('');
                    return;
                  }
                  const num = Number(val);
                  if (!Number.isNaN(num)) {
                    setTopN(num);
                  }
                }}
                onBlur={() => {
                  setTopN(prev => {
                    const n = Number(prev);
                    if (Number.isNaN(n)) return 8;
                    return Math.max(1, Math.min(8, n));
                  });
                }}
                className={`${styles.dateInput}`}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`${styles.actionButtons}`}>
            <button
              type="button"
              onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
              className={`${styles.actionButton}`}
              title="Toggle sort order"
            >
              Sort: {sortDir === 'desc' ? 'Most → Least' : 'Least → Most'}
            </button>
            <button
              type="button"
              onClick={() => downloadCSV(chartData)}
              className={`${styles.actionButton}`}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className={`${styles.chartWrapper}`}>
          <div className={`${styles.chartContainer}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className={`${styles.chartGrid}`} />
                <XAxis
                  dataKey="material"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  interval={0}
                  tick={{ fill: darkMode ? '#d1d5db' : '#374151' }}
                />
                <YAxis
                  label={{
                    value: 'Percentage of Material Wasted (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: darkMode ? '#d1d5db' : '#374151' },
                  }}
                  fontSize={12}
                  tick={{ fill: darkMode ? '#d1d5db' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wastePercentage" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="wastePercentage"
                    position="top"
                    formatter={v => `${v}%`}
                    style={{ fill: darkMode ? '#ffffff' : '#374151' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
