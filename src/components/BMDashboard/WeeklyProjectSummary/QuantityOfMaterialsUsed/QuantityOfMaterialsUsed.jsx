import { useEffect, useState, useMemo } from 'react';
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
} from 'chart.js';
import { useSelector } from 'react-redux';
import './QuantityOfMaterialsUsed.css';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
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
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedDate, setSelectedDate] = useState('Last Week');
  const [dateRangeOne, setDateRangeOne] = useState([null, null]);
  const [dateRangeTwo, setDateRangeTwo] = useState([null, null]);
  const darkMode = useSelector(state => state.theme.darkMode);
  const selectedOrg = useSelector(state => state.weeklyProjectSummary.projectFilter);
  const [legendColors, setLegendColors] = useState([]);

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
    let periodTwo = 'Before Year';
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
      periodTwo = 'Before Month';
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
    setChartData(null);

    if (!Array.isArray(data) || data.length === 0) {
      setTimeout(() => {
        setChartData({
          labels: [],
          datasets: [{ label: 'Quantity Used', data: [], backgroundColor: [] }],
        });
      }, 0);
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

      if (periodOneUsage > 0) {
        const existing = periodOneUsageMap.get(materialName) || 0;
        periodOneUsageMap.set(materialName, existing + periodOneUsage);
      }
      if (periodTwoUsage > 0) {
        const existing = periodTwoUsageMap.get(materialName) || 0;
        periodTwoUsageMap.set(materialName, existing + periodTwoUsage);
      }
    });

    let sortedMaterials = Array.from(periodOneUsageMap, ([name, totalUsage]) => ({
      name,
      totalUsage,
      previousTotal: periodTwoUsageMap.get(name) || 0,
    })).sort((a, b) => b.totalUsage - a.totalUsage);

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

  return (
    <div className={`weekly-project-summary-card normal-card ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="quantity-of-materials-used-chart-title">Quantity of Materials Used</h2>

      <div className="quantity-of-materials-used-dropdown dropdown-container quantity-of-materials-used-card">
        <Select
          isMulti
          isSearchable
          options={materialOptions}
          value={materialOptions.filter(option => selectedMaterials.includes(option.value))}
          onChange={selectedOptions =>
            setSelectedMaterials(selectedOptions.map(({ value }) => value))
          }
          placeholder="All Materials"
          classNamePrefix="custom-select"
          className="quantity-of-materials-used-dropdown-item dropdown-item custom-scrollbar multi-select"
          menuPosition="fixed"
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
        />

        <Select
          options={orgOptions}
          value={orgOptions.find(option => option.value === selectedOrg)}
          placeholder="Organization"
          classNamePrefix="custom-select"
          className="quantity-of-materials-used-dropdown-item dropdown-item"
          // isDisabled
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
          className="quantity-of-materials-used-dropdown-item dropdown-item"
        />
      </div>

      {selectedDate === 'Custom' && (
        <div className="quantity-of-material-used-date-picker-container">
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
            dateFormat="MM/dd/yyyy - MM/dd/yyyy"
            placeholderText="Select Date Range one"
            className="quantity-of-material-used-custom-date-picker"
            disabledKeyboardNavigation
            calendarStartDay={1}
            shouldCloseOnSelect={false}
            onCalendarClose={() => {
              if (!dateRangeOne[1]) setDateRangeOne([null, null]);
            }}
          />
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
            dateFormat="MM/dd/yyyy - MM/dd/yyyy"
            placeholderText="Select Date Range two"
            className="quantity-of-material-used-custom-date-picker"
            disabledKeyboardNavigation
            calendarStartDay={1}
            shouldCloseOnSelect={false}
            onCalendarClose={() => {
              if (!dateRangeOne[1]) setDateRangeTwo([null, null]);
            }}
          />
        </div>
      )}

      <div className="quantity-of-materials-used-chart-container">
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { display: false },
                  title: {
                    display: true,
                    text: getPeriodLabel(selectedDate),
                  },
                },
                y: { beginAtZero: true },
              },
            }}
          />
        ) : (
          <p>Loading data...</p>
        )}
      </div>
      {chartData && chartData.labels && chartData.labels.length > 0 && (
        <div className="custom-legend-container">
          <strong>Top {Math.min(5, chartData.labels.length)}: </strong>
          {chartData.labels.slice(0, 5).map((material, index) => (
            <span key={material} className="legend-item">
              <span
                className="legend-dot"
                style={{
                  backgroundColor: legendColors[index],
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  marginRight: '5px',
                }}
              />
              {material}
              {index < Math.min(4, chartData.labels.length - 1) ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuantityOfMaterialsUsed;
