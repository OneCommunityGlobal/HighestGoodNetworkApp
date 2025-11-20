import { useEffect, useState, useMemo, useRef } from 'react';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
} from 'chart.js';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Info, Repeat } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { setProjectFilter } from '../../../../actions/bmdashboard/issueChartActions';
import styles from './QuantityOfMaterialsUsed.module.css';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  LineController,
);

const colorPalette = [
  '#2B5F8C',
  '#A66D9C',
  '#F2B8A2',
  '#A7D0D9',
  '#7C77B9',
  '#FF6F61',
  '#6B4226',
  '#78A083',
  '#FFB400',
  '#3E885B',
  '#6C5B7B',
  '#FF9800',
  '#D72638',
  '#3D348B',
  '#31A2AC',
  '#1F2041',
  '#B47B84',
  '#FF5E00',
  '#5F5AA2',
  '#BE95C4',
  '#E84855',
  '#0081A7',
  '#B0D0D3',
  '#56A3A6',
  '#F4D35E',
];

// Generates a random color if colors exceed 25
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

function QuantityOfMaterialsUsed({ data }) {
  const [chartData, setChartData] = useState(null);
  const projects = useSelector(state => state.bmProjects);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(projects);

  const [selectedDate, setSelectedDate] = useState('Last Week');
  const [dateRangeOne, setDateRangeOne] = useState([null, null]);
  const [dateRangeTwo, setDateRangeTwo] = useState([null, null]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const selectedOrg = useSelector(state => state.weeklyProjectSummary.projectFilter);
  const [legendColors, setLegendColors] = useState([]);
  const chartContainerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState([0, 30]);
  const [selectedMaterialName, setSelectedMaterialName] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#22272e' : '#fff',
        borderColor: darkMode ? '#375071' : '#ccc',
        color: darkMode ? '#fff' : '#232323',
        minHeight: 38,
        boxShadow: 'none',
        borderRadius: 8,
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#22272e' : '#fff',
        fontSize: 12,
        zIndex: 10001,
        borderRadius: 8,
        marginTop: 2,
        color: darkMode ? '#fff' : '#232323',
      }),
      menuList: base => ({
        ...base,
        maxHeight: 400,
        overflowY: 'auto',
        backgroundColor: darkMode ? '#22272e' : '#fff',
        color: darkMode ? '#fff' : '#232323',
        padding: 0,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? '#0d55b3'
          : state.isFocused
          ? '#0d55b3'
          : darkMode
          ? '#22272e'
          : '#fff',
        color: state.isSelected ? '#fff' : darkMode ? '#fff' : '#232323',
        fontSize: 13,
        padding: '10px 16px',
        cursor: 'pointer',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#375071' : '#e2e7ee',
        borderRadius: 6,
        fontSize: 12,
        marginRight: 4,
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        fontSize: 12,
        padding: '2px 6px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        ':hover': {
          backgroundColor: darkMode ? '#0d55b3' : '#e2e7ee',
          color: '#fff',
        },
        borderRadius: 4,
        padding: 2,
      }),
      singleValue: base => ({
        ...base,
        color: darkMode ? '#fff' : base.color,
      }),
      input: base => ({
        ...base,
        color: darkMode ? '#fff' : base.color,
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#fff' : base.color,
      }),
    }),
    [darkMode],
  );

  const handleProjectChange = selected => {
    setProjectFilter(selected ? selected.map(option => option.value) : []);
  };
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1200);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // **Dropdown Options**
  const materialOptions = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const uniqueMaterials = new Map();
    data.forEach(mat => {
      if (mat?.itemType?.name) {
        uniqueMaterials.set(mat.itemType.name, {
          value: mat.itemType.name,
          label: mat.itemType.name,
        });
      }
    });
    return Array.from(uniqueMaterials.values());
  }, [data]);

  const orgOptions = useMemo(() => [{ value: selectedOrg, label: selectedOrg }], [selectedOrg]);

  const projectOptions = selectedProjects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const dateOptions = useMemo(
    () => [
      { value: 'ALL', label: 'ALL' },
      { value: 'This Week', label: 'This Week' },
      { value: 'This Month', label: 'This Month' },
      { value: 'This Year', label: 'This Year' },
      { value: 'Last Week', label: 'Last Week' },
      { value: 'Last Month', label: 'Last Month' },
      { value: 'Last Year', label: 'Last Year' },
      { value: 'Custom', label: 'Custom Date' },
    ],
    [],
  );

  const getPeriodLabel = date => {
    if (date === 'ALL') return 'Total Materials Used';

    let periodOne = 'This Year';
    let periodTwo = 'Last Year';
    if (date.includes('This Week')) {
      periodOne = 'This Week';
      periodTwo = 'Last Week';
    } else if (date.includes('This Month')) {
      periodOne = 'This Month';
      periodTwo = 'Last Month';
    }
    if (date.includes('Last Week')) {
      periodOne = 'Last Week';
      periodTwo = 'Before Last Week';
    } else if (date.includes('Last Month')) {
      periodOne = 'Last Month';
      periodTwo = 'Before Last Month';
    } else if (date.includes('Custom')) {
      periodOne = 'Custom Date One';
      periodTwo = 'Custom Date Two';
    } else if (date.includes('Last Year')) {
      periodOne = 'Last Year';
      periodTwo = 'Before Last Year';
    }

    return `${periodOne} vs ${periodTwo}`;
  };

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setChartData({
        labels: [],
        datasets: [
          {
            label: 'Quantity Used',
            data: [],
            backgroundColor: [],
            type: 'bar', // Explicitly define type
          },
        ],
      });
      return;
    }

    const periodOneUsageMap = new Map();
    const periodTwoUsageMap = new Map();

    data.forEach(material => {
      if (!material?.itemType?.name || !material?.updateRecord) return;
      const materialName = material.itemType.name;
      let periodOneUsage = 0;
      let periodTwoUsage = 0;

      material.updateRecord.forEach(record => {
        if (!record || !record.date) return;
        const recordDate = moment(record.date);
        let isPeriodOne = false;
        let isPeriodTwo = false;

        if (selectedDate === 'ALL') {
          isPeriodOne = true;
        } else if (selectedDate === 'Last Week') {
          isPeriodOne = recordDate.isBetween(
            moment()
              .subtract(1, 'week')
              .startOf('week'),
            moment()
              .subtract(1, 'week')
              .endOf('week'),
          );
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(2, 'week')
              .startOf('week'),
            moment()
              .subtract(2, 'week')
              .endOf('week'),
          );
        } else if (selectedDate === 'Last Month') {
          isPeriodOne = recordDate.isBetween(
            moment()
              .subtract(1, 'month')
              .startOf('month'),
            moment()
              .subtract(1, 'month')
              .endOf('month'),
          );
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(2, 'month')
              .startOf('month'),
            moment()
              .subtract(2, 'month')
              .endOf('month'),
          );
        } else if (selectedDate === 'Last Year') {
          isPeriodOne = recordDate.isBetween(
            moment()
              .subtract(1, 'year')
              .startOf('year'),
            moment()
              .subtract(1, 'year')
              .endOf('year'),
          );
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(2, 'year')
              .startOf('year'),
            moment()
              .subtract(2, 'year')
              .endOf('year'),
          );
        } else if (selectedDate === 'This Week') {
          isPeriodOne = recordDate.isBetween(moment().startOf('week'), moment().endOf('week'));
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(1, 'week')
              .startOf('week'),
            moment()
              .subtract(1, 'week')
              .endOf('week'),
          );
        } else if (selectedDate === 'This Month') {
          isPeriodOne = recordDate.isBetween(moment().startOf('month'), moment().endOf('month'));
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(1, 'month')
              .startOf('month'),
            moment()
              .subtract(1, 'month')
              .endOf('month'),
          );
        } else if (selectedDate === 'This Year') {
          isPeriodOne = recordDate.isBetween(moment().startOf('year'), moment().endOf('year'));
          isPeriodTwo = recordDate.isBetween(
            moment()
              .subtract(1, 'year')
              .startOf('year'),
            moment()
              .subtract(1, 'year')
              .endOf('year'),
          );
        } else if (
          selectedDate === 'Custom' &&
          dateRangeOne[0] &&
          dateRangeOne[1] &&
          dateRangeTwo[0] &&
          dateRangeTwo[1]
        ) {
          isPeriodOne = recordDate.isBetween(
            moment(dateRangeOne[0]).startOf('day'),
            moment(dateRangeOne[1]).endOf('day'),
          );
          isPeriodTwo = recordDate.isBetween(
            moment(dateRangeTwo[0]).startOf('day'),
            moment(dateRangeTwo[1]).endOf('day'),
          );
        }

        if (isPeriodOne) {
          periodOneUsage += record?.quantityUsed || 0;
        }
        if (isPeriodTwo) {
          periodTwoUsage += record?.quantityUsed || 0;
        }
      });

      const existingOne = periodOneUsageMap.get(materialName) || 0;
      periodOneUsageMap.set(materialName, existingOne + periodOneUsage);

      const existingTwo = periodTwoUsageMap.get(materialName) || 0;
      periodTwoUsageMap.set(materialName, existingTwo + periodTwoUsage);
    });

    const allMaterialNames = data.map(m => m?.itemType?.name).filter(Boolean);
    const uniqueNames = [...new Set(allMaterialNames)];

    let sortedMaterials = uniqueNames
      .map(name => ({
        name,
        totalUsage: periodOneUsageMap.get(name) || 0,
        previousTotal: periodTwoUsageMap.get(name) || 0,
      }))
      .sort((a, b) => b.totalUsage - a.totalUsage);

    if (selectedMaterials.length > 0) {
      sortedMaterials = sortedMaterials.filter(m => selectedMaterials.includes(m.name));
    }

    const displayMaterials = sortedMaterials.map(m => m.name);
    const usageData = sortedMaterials.map(m => m.totalUsage);
    const previousUsageData = sortedMaterials.map(m => m.previousTotal);

    const assignedColors = displayMaterials.map(
      (_, index) => colorPalette[index % colorPalette.length] || getRandomColor(),
    );
    setLegendColors(assignedColors);
    const comparisonColors = previousUsageData.map((prev, index) => {
      if (prev < usageData[index]) return 'green';
      if (prev > usageData[index]) return 'red';
      return 'gray';
    });

    if (periodOneUsageMap.size === 0 && periodTwoUsageMap.size > 0) {
      let sortedPreviousData = Array.from(periodTwoUsageMap);

      if (selectedMaterials.length > 0) {
        sortedPreviousData = sortedPreviousData.filter(([name]) =>
          selectedMaterials.includes(name),
        );
      }

      sortedPreviousData = sortedPreviousData.sort((a, b) => b[1] - a[1]);
      const sortedLabels = sortedPreviousData.map(([name]) => name);
      const sortedUsageData = sortedPreviousData.map(([, usage]) => usage);
      const assignedDotColors = sortedLabels.map(
        (_, index) => colorPalette[index % colorPalette.length] || getRandomColor(),
      );
      setLegendColors(assignedDotColors);
      const comparisonColorsPrev = sortedLabels.map(name => {
        const prevUsage = periodTwoUsageMap.get(name) || 0;
        const currentUsage = periodOneUsageMap.get(name) || 0;
        if (prevUsage < currentUsage) return 'red';
        if (prevUsage > currentUsage) return 'green';
        return 'gray';
      });
      setChartData({
        labels: sortedLabels,
        datasets: [
          {
            label: `${getPeriodLabel(selectedDate).split(' vs ')[1]} Usage`,
            type: 'line',
            data: sortedUsageData,
            borderColor: 'gray',
            backgroundColor: comparisonColorsPrev,
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: assignedDotColors,
            pointHoverRadius: 6,
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointStyle: 'rectRot',
            tension: 0.3,
            order: 1,
          },
        ],
      });
      return;
    }

    setChartData({
      labels: displayMaterials,
      datasets: [
        {
          label:
            selectedDate === 'ALL'
              ? 'Total Quantity Used'
              : `${getPeriodLabel(selectedDate).split(' vs ')[0]} Usage`,
          data: usageData,
          backgroundColor: assignedColors,
          borderRadius: 4,
          type: 'bar',
          order: 2,
        },
        ...(selectedDate !== 'ALL'
          ? [
              {
                label: `${getPeriodLabel(selectedDate).split(' vs ')[1]} Usage`,
                type: 'line',
                data: previousUsageData,
                borderColor: 'gray',
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: comparisonColors,
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointStyle: 'rectRot',
                tension: 0.3,
                order: 1,
              },
            ]
          : []),
      ],
    });
  }, [data, selectedMaterials, selectedOrg, selectedDate, dateRangeOne, dateRangeTwo]);

  const barWidth = 12;
  // Subtract the 40-px y-axis offset
  const axisOffset = 35;

  const handleScroll = () => {
    if (!chartData || !chartData.labels?.length) return;
    const container = chartContainerRef.current;
    const { scrollLeft } = container;
    const containerWidth = container.clientWidth;
    const totalBars = chartData.labels.length;

    const effectiveScrollLeft = Math.max(0, scrollLeft - axisOffset);

    const startIndex = Math.floor(effectiveScrollLeft / barWidth);
    const endIndex = Math.min(
      Math.ceil((effectiveScrollLeft + containerWidth) / barWidth),
      totalBars,
    );

    setVisibleRange([startIndex, endIndex]);
  };

  const getMaterialUsageDetails = materialName => {
    // First find all materials with the matching name
    const matchingMaterials = data.filter(m => m?.itemType?.name === materialName);

    if (!matchingMaterials || matchingMaterials.length === 0) return null;

    // Track usage by project
    const usageByProject = {};
    const projectData = {};

    // Process each material item
    matchingMaterials.forEach(material => {
      if (!material.updateRecord || !material.project?.name) return;

      const projectName = material.project.name;

      // Initialize project data if not already done
      if (!projectData[projectName]) {
        projectData[projectName] = {
          totalUsage: 0,
          timelineByDate: {}, // Track usage by date for this project
        };
      }

      // Process update records for this material
      material.updateRecord.forEach(record => {
        if (!record || !record.date) return;

        const recordDate = moment(record.date);
        let shouldInclude = false;

        // Apply date filtering based on selected date range
        if (selectedDate === 'ALL') {
          shouldInclude = true;
        } else if (selectedDate === 'Last Week') {
          shouldInclude = recordDate.isBetween(
            moment()
              .subtract(1, 'week')
              .startOf('week'),
            moment()
              .subtract(1, 'week')
              .endOf('week'),
          );
        } else if (selectedDate === 'Last Month') {
          shouldInclude = recordDate.isBetween(
            moment()
              .subtract(1, 'month')
              .startOf('month'),
            moment()
              .subtract(1, 'month')
              .endOf('month'),
          );
        } else if (selectedDate === 'Last Year') {
          shouldInclude = recordDate.isBetween(
            moment()
              .subtract(1, 'year')
              .startOf('year'),
            moment()
              .subtract(1, 'year')
              .endOf('year'),
          );
        } else if (selectedDate === 'This Week') {
          shouldInclude = recordDate.isBetween(moment().startOf('week'), moment().endOf('week'));
        } else if (selectedDate === 'This Month') {
          shouldInclude = recordDate.isBetween(moment().startOf('month'), moment().endOf('month'));
        } else if (selectedDate === 'This Year') {
          shouldInclude = recordDate.isBetween(moment().startOf('year'), moment().endOf('year'));
        } else if (selectedDate === 'Custom' && dateRangeOne[0] && dateRangeOne[1]) {
          shouldInclude = recordDate.isBetween(
            moment(dateRangeOne[0]).startOf('day'),
            moment(dateRangeOne[1]).endOf('day'),
          );
        }

        if (shouldInclude) {
          const quantity = record.quantityUsed || 0;
          const dateStr = recordDate.format('YYYY-MM-DD');

          // Add to project's total usage
          projectData[projectName].totalUsage += quantity;

          // Add to this project's timeline, grouped by date
          if (!projectData[projectName].timelineByDate[dateStr]) {
            projectData[projectName].timelineByDate[dateStr] = 0;
          }
          projectData[projectName].timelineByDate[dateStr] += quantity;
        }
      });

      // Update the usageByProject map with the total for this project
      usageByProject[projectName] = projectData[projectName].totalUsage;
    });

    // Sort projects by usage (highest first)
    const sortedProjects = Object.entries(usageByProject).sort((a, b) => b[1] - a[1]);

    // Get top project or default to Unknown
    const topProject = sortedProjects.length > 0 ? sortedProjects[0][0] : 'Unknown';
    const topProjectUsage = sortedProjects.length > 0 ? sortedProjects[0][1] : 0;

    // Create the timeline for the top project only
    let timeline = [];
    if (topProject !== 'Unknown' && projectData[topProject]) {
      timeline = Object.entries(projectData[topProject].timelineByDate)
        .map(([date, quantity]) => ({ date, quantity }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return {
      name: materialName,
      timeline,
      total: topProjectUsage,
      project: topProject,
      projectUsage: sortedProjects.map(([name, usage]) => ({ name, usage })),
      debugProjects: sortedProjects.map(([name, usage]) => `${name}: ${usage}`).join(', '),
    };
  };
  return (
    <div
      className={`weekly-project-summary-card normal-card ${darkMode ? 'dark-mode' : ''}`}
      style={{ position: 'relative' }}
    >
      <div className={`${styles.chartTitleContainer}`}>
        <h2 className={`${styles.quantityOfMaterialsUsedChartTitle}`}>
          Quantity of Materials Used
        </h2>

        <button
          type="button"
          className={`${styles.quantityOfMaterialsUsedChartInfoButton}`}
          data-tip
          data-for="materials-info"
          aria-label="Chart Info"
        >
          <Info size={14} strokeWidth={2} />
        </button>
      </div>

      <ReactTooltip
        id="materials-info"
        place="left"
        effect="solid"
        className={`${styles.quantityOfMaterialsUsedChartTooltip}`}
        clickable
        event="click"
        globalEventOff="click"
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Chart Overview</div>
        <div>This chart compares material quantities across two time periods.</div>
        <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
          <li>
            Bars represent the selected time period (e.g., <em>Last Week</em>).
          </li>
          <li>
            Dots represent the previous corresponding period (e.g., <em>Before Last Week</em>).
          </li>
          <li>Hover over bars or dots to view exact quantities.</li>
          <li>
            <strong className={darkMode ? 'text-light' : ''}>Click on a bar </strong> to view
            detailed usage:
            <ul style={{ paddingLeft: '16px' }}>
              <li>Usage timeline (date-wise quantity)</li>
              <li>Project where it was used the most</li>
              <li>Total quantity used</li>
            </ul>
          </li>
          <li>
            The dropdown filters allow you to:
            <ul style={{ paddingLeft: '16px' }}>
              <li>Select specific materials (multi-select).</li>
              <li>Choose organization (defaulted).</li>
              <li>Pick a time period (preset ranges or custom dates).</li>
            </ul>
          </li>
          <li>When using custom date ranges, the two periods can be swapped or reversed.</li>
          <li>
            Use the horizontal scroll bar to view more materials if the chart exceeds visible width.
          </li>
          <li>The legend below shows the top 10 visible materials in the current scroll range.</li>
          <li>
            Legend colors match chart bars. Dots are color-coded based on change:
            <ul style={{ paddingLeft: '16px' }}>
              <li>
                <strong className={darkMode ? 'text-light' : ''}>Red</strong> – Increase in usage
              </li>
              <li>
                <strong className={darkMode ? 'text-light' : ''}>Green</strong> – Decrease in usage
              </li>
              <li>
                <strong className={darkMode ? 'text-light' : ''}>Gray</strong> – No change
              </li>
            </ul>
          </li>
          <li>Scrollbars only appear when content overflows, maintaining a clean layout.</li>
        </ul>
      </ReactTooltip>
      <div
        className={`quantity-of-materials-used-dropdown ${styles.dropdownContainer} ${styles.quantityOfMaterialsUsedCard}`}
      >
        <Select
          isMulti
          isSearchable
          options={materialOptions}
          value={materialOptions.filter(option => selectedMaterials.includes(option.value))}
          onChange={selectedOptions =>
            setSelectedMaterials(selectedOptions.map(({ value }) => value))
          }
          placeholder="All Materials testing"
          classNamePrefix="custom-select"
          className={`quantity-of-materials-used-dropdown-item ${styles.dropdownItem} custom-scrollbar ${styles.multiSelect}`}
          menuPosition="fixed"
          menuPlacement={isSmallScreen ? 'top' : 'auto'}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          styles={selectStyles}
        />

        <Select
          isMulti
          isSearchable
          options={projectOptions}
          value={projectOptions.filter(option => selectedProjects.includes(option.value))}
          onChange={selectedOptions =>
            setSelectedProjects(selectedOptions.map(({ value }) => value))
          }
          placeholder="Projects"
          menuPlacement={isSmallScreen ? 'top' : 'auto'}
          classNamePrefix="custom-select"
          className={`quantity-of-materials-used-dropdown-item ${styles.dropdownItem}`}
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          styles={selectStyles}
        />
        <Select
          options={dateOptions}
          value={dateOptions.find(option => option.value === selectedDate)}
          onChange={selectedOption => {
            setSelectedDate(selectedOption.value);
            if (selectedOption.value !== 'Custom') {
              setDateRangeOne([null, null]);
              setDateRangeTwo([null, null]);
            }
          }}
          placeholder="Date"
          classNamePrefix="custom-select"
          className={`quantity-of-materials-used-dropdown-item ${styles.dropdownItem}`}
          styles={selectStyles}
        />
      </div>

      {selectedDate === 'Custom' && (
        <div className={`${styles.quantityOfMaterialUsedDatePickerContainer}`}>
          <DatePicker
            selected={dateRangeOne[0]}
            onChange={dates => {
              if (dates[0] && dates[1]) {
                setDateRangeOne(dates);
                setTimeout(() => document.activeElement.blur(), 200);
              } else {
                setDateRangeOne(dates);
              }
            }}
            startDate={dateRangeOne[0]}
            endDate={dateRangeOne[1]}
            selectsRange
            minDate={new Date(0)}
            maxDate={new Date()}
            dateFormat="MM/dd/yy - MM/dd/yy"
            placeholderText="Select Date Range one"
            className={`${styles.quantityOfMaterialUsedCustomDatePicker}`}
            disabledKeyboardNavigation
            calendarStartDay={1}
            shouldCloseOnSelect={false}
            value={
              dateRangeOne[0] && dateRangeOne[1]
                ? `${moment(dateRangeOne[0]).format('MM/DD/YY')} - ${moment(dateRangeOne[1]).format(
                    'MM/DD/YY',
                  )}`
                : ''
            }
            onCalendarClose={() => {
              if (!dateRangeOne[1]) setDateRangeOne([null, null]);
            }}
          />
          <button
            type="button"
            className={`${styles.quantityOfMaterialsUsedSwapDatesButton}`}
            onClick={() => {
              const newRangeOne = [...dateRangeTwo];
              const newRangeTwo = [...dateRangeOne];
              setDateRangeOne(newRangeOne);
              setDateRangeTwo(newRangeTwo);
            }}
            aria-label="Swap Date Ranges"
          >
            <Repeat size={16} />
          </button>
          <DatePicker
            selected={dateRangeTwo[0]}
            onChange={dates => {
              if (dates[0] && dates[1]) {
                setDateRangeTwo(dates);
                setTimeout(() => document.activeElement.blur(), 200);
              } else {
                setDateRangeTwo(dates);
              }
            }}
            startDate={dateRangeTwo[0]}
            endDate={dateRangeTwo[1]}
            selectsRange
            minDate={new Date(0)}
            maxDate={new Date()}
            dateFormat="MM/dd/yy - MM/dd/yy"
            placeholderText="Select Date Range two"
            className={`${styles.quantityOfMaterialUsedCustomDatePicker}`}
            disabledKeyboardNavigation
            calendarStartDay={1}
            shouldCloseOnSelect={false}
            value={
              dateRangeTwo[0] && dateRangeTwo[1]
                ? `${moment(dateRangeTwo[0]).format('MM/DD/YY')} - ${moment(dateRangeTwo[1]).format(
                    'MM/DD/YY',
                  )}`
                : ''
            }
            onCalendarClose={() => {
              if (!dateRangeTwo[1]) setDateRangeTwo([null, null]);
            }}
          />
        </div>
      )}

      <div
        className={`${styles.quantityOfMaterialsUsedChartContainer}`}
        ref={chartContainerRef}
        onScroll={handleScroll}
      >
        {chartData ? (
          <div
            className={`${styles.quantityOfMaterialsUsedChartInnerScrollable}`}
            style={{
              minWidth: `${chartData.labels.length * barWidth}px`,
            }}
            onScroll={handleScroll}
          >
            <Bar
              data={chartData}
              key={uuidv4()}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                onClick: (event, elements) => {
                  if (!elements.length) return;
                  const { index } = elements[0];
                  const label = chartData.labels[index];
                  setSelectedMaterialName(label);
                  setShowModal(true);
                },
                plugins: {
                  legend: {
                    display: false,
                    labels: {
                      color: darkMode ? '#000' : '#fff', // legend labels (if shown)
                    },
                  },
                  tooltip: {
                    bodyColor: '#fff',
                    titleColor: '#fff',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      display: false,
                    },
                    grid: {
                      color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: darkMode ? '#ccc' : '#333',
                    },
                    grid: {
                      color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    },
                  },
                },
                animation: {
                  duration: 100,
                },
                type: 'bar',
                transitions: {
                  active: {
                    animation: {
                      duration: 100,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
      {/* Fixed label below chart */}
      <div
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '12px',
          marginTop: '5px',
          color: 'var(--text-color)',
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span>📊 {getPeriodLabel(selectedDate).split(' vs ')[0]}</span>
        {selectedDate !== 'ALL' && (
          <>
            <span>vs</span>
            <span>📈 {getPeriodLabel(selectedDate).split(' vs ')[1]}</span>
          </>
        )}
      </div>

      {/* Fixed legend below label */}
      {chartData && chartData.labels && visibleRange && (
        <div
          className={`${styles.quantityOfMaterialsUsedCustomLegendContainer}`}
          style={{
            color: 'var(--text-color)',
          }}
        >
          <strong className={darkMode ? 'text-light' : ''}>
            Visible Top {Math.min(10, visibleRange[1] - visibleRange[0])} of {selectedDate}:{' '}
          </strong>
          {chartData.datasets[0].data
            .slice(visibleRange[0], visibleRange[1])
            .map((usage, index) => ({
              name: chartData.labels[visibleRange[0] + index],
              usage,
              color:
                legendColors[visibleRange[0] + index] ||
                chartData.datasets[0].backgroundColor?.[visibleRange[0] + index] ||
                chartData.datasets[0].pointBackgroundColor?.[visibleRange[0] + index],
              actualIndex: visibleRange[0] + index,
            }))
            .filter(item => item.name != null && item.usage != null)
            .sort((a, b) => b.usage - a.usage)
            .slice(0, 10)
            .map(({ name, color }, index) => (
              <span key={uuidv4()} className={`${styles.quantityOfMaterialsUsedLegendItem}`}>
                <span
                  className={`${styles.quantityOfMaterialsUsedLegendDot}`}
                  style={{
                    backgroundColor: color,
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '5px',
                  }}
                />
                {name}
                {index < 9 ? ', ' : ''}
              </span>
            ))}
        </div>
      )}
      {showModal && selectedMaterialName && (
        <div className={`${styles.quantityModalOverlay}`}>
          <div className={`${styles.quantityModalContent}`}>
            <div className={`${styles.quantityModalHeader}`}>
              <h3 className={`${styles.quantityModalHeading}`}>
                <span>{selectedMaterialName} – Usage Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={`${styles.quantityModalCloseButton}`}
              >
                Close
              </button>
            </div>

            {(() => {
              const details = getMaterialUsageDetails(selectedMaterialName);
              if (!details) return <p>No usage data available.</p>;

              return (
                <>
                  <p className={darkMode ? 'text-light' : ''}>
                    <strong className={darkMode ? 'text-light' : ''}>Highest Usage in:</strong>{' '}
                    {details.project}
                  </p>
                  <p className={darkMode ? 'text-light' : ''}>
                    <strong className={darkMode ? 'text-light' : ''}>Total Quantity:</strong>{' '}
                    {details.total}
                  </p>

                  <h4 className={`${styles.quantityModalSubheading}`}>📅 Usage Timeline</h4>
                  <div className={`${styles.quantityModalTimeline}`}>
                    {details.timeline.map(item => (
                      <div key={uuidv4()} className={`${styles.timelineRow}`}>
                        <span className={`${styles.timelineDate} ${darkMode ? ' text-light' : ''}`}>
                          {item.date}
                        </span>
                        <span className={`${styles.timelineQty} ${darkMode ? ' text-light' : ''}`}>
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuantityOfMaterialsUsed;
