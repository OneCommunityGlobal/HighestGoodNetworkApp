import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import styles from './IssueCharts.module.css';

import {
  fetchLongestOpenIssues,
  fetchMostExpensiveIssues,
} from '../../../actions/bmdashboard/issueChartActions';

function IssuesCharts({ bmProjects = [] }) {
  const dispatch = useDispatch();

  const [graphType, setGraphType] = useState('Longest Open');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const { longestOpenIssues = [], mostExpensiveIssues = [] } = useSelector(
    state => state.issue || {},
  );
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const params = {
      projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
      startDate: dateRange.start || undefined,
      endDate: dateRange.end || undefined,
    };

    if (graphType === 'Longest Open') {
      dispatch(fetchLongestOpenIssues(params));
    } else {
      dispatch(fetchMostExpensiveIssues(params));
    }
  }, [graphType, selectedProjects, dateRange.start, dateRange.end, dispatch]);

  const chartData = graphType === 'Longest Open' ? longestOpenIssues : mostExpensiveIssues;

  const data = {
    labels: chartData.map(issue => issue.title || issue.issueId),
    datasets: [
      {
        label: graphType === 'Longest Open' ? 'Days Open' : 'Total Cost ($)',
        data: chartData.map(issue =>
          graphType === 'Longest Open' ? issue.daysOpen : issue.totalCost,
        ),
        backgroundColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)',
        borderColor:
          graphType === 'Longest Open' ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      layout: {
        padding: { right: 80, left: 10 },
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'right',
          clip: false,
          formatter: value => (graphType === 'Longest Open' ? `${value} days` : `$${value}`),
          color: darkMode ? '#fff' : '#000',
          font: { weight: 'bold' },
        },
        title: {
          display: true,
          text:
            graphType === 'Longest Open'
              ? 'Top 5 Longest Open Issues'
              : 'Most Expensive Issues by Time Open',
          font: { size: 14, weight: 'bold' },
          color: darkMode ? '#fff' : '#000',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: graphType === 'Longest Open' ? 'Days Open' : 'Total Cost ($)',
            font: { size: 12 },
            color: darkMode ? '#fff' : '#000',
          },
          ticks: { color: darkMode ? '#ccc' : '#333' },
        },
        y: {
          title: {
            display: true,
            text: 'Issue Title',
            font: { size: 12 },
            color: darkMode ? '#fff' : '#000',
          },
          ticks: {
            color: darkMode ? '#ccc' : '#333',
            maxRotation: 0,
            autoSkip: false,
          },
        },
      },
      elements: {
        bar: { borderRadius: 4, borderSkipped: false },
      },
    }),
    [graphType, darkMode],
  );

  const projectOptions = bmProjects.map(p => ({ value: p._id, label: p.name }));
  const selectedProjectOptions = projectOptions.filter(opt => selectedProjects.includes(opt.value));

  const darkSelectStyles = darkMode
    ? {
        control: base => ({
          ...base,
          background: '#2b3e59',
          borderColor: '#4a5a72',
          color: '#fff',
        }),
        menu: base => ({ ...base, background: '#2b3e59' }),
        option: (base, { isFocused }) => ({
          ...base,
          background: isFocused ? '#4a5a72' : '#2b3e59',
          color: '#fff',
        }),
        multiValue: base => ({ ...base, background: '#4a5a72' }),
        multiValueLabel: base => ({ ...base, color: '#fff' }),
        singleValue: base => ({ ...base, color: '#fff' }),
        input: base => ({ ...base, color: '#fff' }),
        placeholder: base => ({ ...base, color: '#aaa' }),
      }
    : {};

  return (
    <div className={darkMode ? styles.dark : ''}>
      <div className={styles.container}>
        <div className={styles.dateInputs}>
          <DatePicker
            selected={dateRange.start}
            onChange={value => setDateRange(prev => ({ ...prev, start: value }))}
            placeholderText="Start date"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={10}
            className={darkMode ? styles.dateDark : styles.dateInput}
          />
          <span>to</span>
          <DatePicker
            selected={dateRange.end}
            onChange={value => setDateRange(prev => ({ ...prev, end: value }))}
            placeholderText="End date"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={10}
            className={darkMode ? styles.dateDark : styles.dateInput}
          />
        </div>
        <div className={styles.multiSelectWrapper}>
          <Select
            isMulti
            options={projectOptions}
            value={selectedProjectOptions}
            onChange={selected => setSelectedProjects(selected.map(s => s.value))}
            placeholder="All Projects"
            styles={darkSelectStyles}
          />
        </div>
        <div className={styles.inputGroup}>
          <select
            id="type"
            value={graphType}
            onChange={e => setGraphType(e.target.value)}
            className={darkMode ? styles.selectDark : styles.select}
          >
            <option value="Longest Open">Longest Open</option>
            <option value="Most Expensive">Most Expensive</option>
          </select>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {chartData.length > 0 ? (
          <Bar
            key={`${graphType}-${selectedProjects.join(',')}-${dateRange.start}-${dateRange.end}`}
            data={data}
            options={options}
            plugins={[ChartDataLabels]}
            height={300}
          />
        ) : (
          <p className={styles.noData}>No issues found.</p>
        )}
      </div>
    </div>
  );
}

export default IssuesCharts;
