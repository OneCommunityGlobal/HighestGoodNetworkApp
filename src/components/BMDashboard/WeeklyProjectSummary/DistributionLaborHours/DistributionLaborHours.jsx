import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './DistributionLaborHours.module.css';

const COLORS = ['#2a647c', '#2e8ea3', '#ffab91', '#ffccbb', '#bbbbbb', '#f9f3e3'];

const CustomTooltip = ({ active, payload, total, darkMode }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return (
      <div
        className={styles.tooltip}
        style={{
          backgroundColor: darkMode ? '#2e3e5a' : '#fff',
          color: darkMode ? '#fff' : '#000',
          border: darkMode ? '1px solid #555' : '1px solid #ccc',
        }}
      >
        <p>{name}</p>
        <p>{`Hours: ${value} hrs`}</p>
        <p>{`Percentage: ${percent}%`}</p>
      </div>
    );
  }

  return null;
};

export default function DistributionLaborHours() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Values currently selected by the user.
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });
  const [projectFilter, setProjectFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  // Gives the user visible confirmation that Submit worked.
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      /*
       * Mock data for now.
       *
       * project, member, and date have been added so that the filter controls
       * and Submit button can actually demonstrate filtering.
       *
       * When backend data is connected, replace this array with the API result.
       */
      const mockData = [
        {
          name: 'Stud Wall Construction',
          value: 25.9,
          project: 'Project A',
          member: 'Member 1',
          date: '2026-08-05',
        },
        {
          name: 'Foundation Concreting',
          value: 18.5,
          project: 'Project A',
          member: 'Member 2',
          date: '2026-08-09',
        },
        {
          name: 'Task A',
          value: 22.2,
          project: 'Project B',
          member: 'Member 1',
          date: '2026-08-12',
        },
        {
          name: 'Task B',
          value: 18.5,
          project: 'Project B',
          member: 'Member 2',
          date: '2026-08-16',
        },
        {
          name: 'Task C',
          value: 14.8,
          project: 'Project A',
          member: 'Member 1',
          date: '2026-08-20',
        },
        {
          name: 'Electrical',
          value: 12,
          project: 'Project A',
          member: 'Member 2',
          date: '2026-08-22',
        },
        {
          name: 'Plumbing',
          value: 8,
          project: 'Project B',
          member: 'Member 1',
          date: '2026-08-24',
        },
        {
          name: 'Welding',
          value: 6,
          project: 'Project B',
          member: 'Member 2',
          date: '2026-08-27',
        },
      ];

      setOriginalData(mockData);
    };

    fetchData();
  }, []);

  /*
   * Format filtered rows as:
   * top 5 tasks + combined "Others" row.
   */
  const formatChartData = data => {
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    const top5 = sortedData.slice(0, 5).map(({ name, value }) => ({
      name,
      value,
    }));

    const othersTotal = sortedData.slice(5).reduce((sum, item) => sum + item.value, 0);

    if (othersTotal > 0) {
      top5.push({
        name: 'Others',
        value: Number(othersTotal.toFixed(1)),
      });
    }

    return top5;
  };

  /*
   * Display all data when the component initially loads.
   */
  useEffect(() => {
    if (originalData.length > 0) {
      setFilteredData(formatChartData(originalData));
    }
  }, [originalData]);

  const handleSubmit = () => {
    let result = [...originalData];

    if (dateRange.from) {
      result = result.filter(item => item.date >= dateRange.from);
    }

    if (dateRange.to) {
      result = result.filter(item => item.date <= dateRange.to);
    }

    if (projectFilter) {
      result = result.filter(item => item.project === projectFilter);
    }

    if (memberFilter) {
      result = result.filter(item => item.member === memberFilter);
    }

    setFilteredData(formatChartData(result));
    setFiltersApplied(true);
  };

  const totalHours = useMemo(() => filteredData.reduce((sum, item) => sum + item.value, 0), [
    filteredData,
  ]);

  const projectOptions = [
    { value: '', label: 'ALL' },
    { value: 'Project A', label: 'Project A' },
    { value: 'Project B', label: 'Project B' },
  ];

  const memberOptions = [
    { value: '', label: 'ALL' },
    { value: 'Member 1', label: 'Member 1' },
    { value: 'Member 2', label: 'Member 2' },
  ];

  const selectedProject =
    projectOptions.find(option => option.value === projectFilter) || projectOptions[0];

  const selectedMember =
    memberOptions.find(option => option.value === memberFilter) || memberOptions[0];

  /*
   * Rendering the React Select menu in document.body prevents the menu
   * from being clipped or closed unexpectedly by dashboard containers.
   */
  const menuPortalTarget = typeof document !== 'undefined' ? document.body : null;

  const selectStyles = {
    menuPortal: base => ({
      ...base,
      zIndex: 9999,
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Distribution of Labor Hours</h3>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="labor-from-date">From</label>

          <input
            id="labor-from-date"
            type="date"
            value={dateRange.from}
            onChange={e => {
              setDateRange(previous => ({
                ...previous,
                from: e.target.value,
              }));
              setFiltersApplied(false);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="labor-to-date">To</label>

          <input
            id="labor-to-date"
            type="date"
            value={dateRange.to}
            onChange={e => {
              setDateRange(previous => ({
                ...previous,
                to: e.target.value,
              }));
              setFiltersApplied(false);
            }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="project-filter">Project</label>

          <Select
            inputId="project-filter"
            options={projectOptions}
            value={selectedProject}
            onChange={option => {
              setProjectFilter(option?.value || '');
              setFiltersApplied(false);
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            styles={selectStyles}
            isSearchable={false}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="member-filter">Member</label>

          <Select
            inputId="member-filter"
            options={memberOptions}
            value={selectedMember}
            onChange={option => {
              setMemberFilter(option?.value || '');
              setFiltersApplied(false);
            }}
            className="react-select-container"
            classNamePrefix="react-select"
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            styles={selectStyles}
            isSearchable={false}
          />
        </div>

        <div className={styles.buttonContainer}>
          <button className={styles.button} type="button" onClick={handleSubmit}>
            Submit
          </button>

          {filtersApplied && <span className={styles.appliedMessage}>Filters applied</span>}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        {filteredData.length > 0 ? (
          <>
            <div className={styles.legend}>
              {filteredData.map((entry, index) => (
                <div key={entry.name} className={styles.legendItem}>
                  <span
                    className={styles.colorBox}
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />

                  <span
                    className={styles.legendText}
                    style={{
                      color: darkMode ? '#f5f5f5' : '#000',
                    }}
                  >
                    {entry.name}: {entry.value} hrs
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.pieChartContainer}>
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ x, y, value }) => (
                      <text
                        x={x}
                        y={y}
                        fill={darkMode ? '#fff' : '#1f2937'}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="600"
                      >
                        {totalHours > 0 ? `${((value / totalHours) * 100).toFixed(1)}%` : '0.0%'}
                      </text>
                    )}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip total={totalHours} darkMode={darkMode} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className={styles.noData}>No labor-hour data found for the selected filters.</div>
        )}
      </div>
    </div>
  );
}
