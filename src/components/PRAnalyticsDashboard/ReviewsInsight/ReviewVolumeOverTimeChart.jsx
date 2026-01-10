import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ReviewVolumeOverTimeChart.module.css';

function ReviewVolumeOverTimeChart({ darkMode: propDarkMode, villages = [], loadingVillages = false, villagesError = null }) {
  const darkModeFromStore = useSelector(state => state.theme.darkMode);
  const darkMode = propDarkMode !== undefined ? propDarkMode : darkModeFromStore;
  
  // State for filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [category, setCategory] = useState('By Village'); // 'By Village' or 'By Property'
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  
  // Mock data - replace with actual API call
  const [chartData, setChartData] = useState([
    {
      month: 'Apr 2023',
      Negative: 12,
      Neutral: 15,
      Positive: 25,
    },
    {
      month: 'Jun 2023',
      Negative: 15,
      Neutral: 23,
      Positive: 38,
    },
    {
      month: 'Sep 2023',
      Negative: 23,
      Neutral: 33,
      Positive: 40,
    },
    {
      month: 'Oct 2023',
      Negative: 23,
      Neutral: 37,
      Positive: 48,
    },
    {
      month: 'Nov 2023',
      Negative: 25,
      Neutral: 42,
      Positive: 45,
    },
    {
      month: 'Dec 2023',
      Negative: 22,
      Neutral: 33,
      Positive: 48,
    },
    {
      month: 'Jan 2024',
      Negative: 19,
      Neutral: 30,
      Positive: 42,
    },
    {
      month: 'Feb 2024',
      Negative: 18,
      Neutral: 23,
      Positive: 42,
    },
  ]);

  // Default village and property options (matching ReviewWordCloud)
  const defaultVillageOptions = [
    { value: 'Eco Village', label: 'Eco Village' },
    { value: 'Forest Retreat', label: 'Forest Retreat' },
    { value: 'Desert Oasis', label: 'Desert Oasis' },
    { value: 'River Valley', label: 'River Valley' },
    { value: 'City Sanctuary', label: 'City Sanctuary' },
  ];

  const defaultPropertyOptions = [
    { value: 'Mountain View', label: 'Mountain View', village: 'Eco Village' },
    { value: 'Solar Haven', label: 'Solar Haven', village: 'Eco Village' },
    { value: 'Lakeside Cottage', label: 'Lakeside Cottage', village: 'Forest Retreat' },
    { value: 'Woodland Cabin', label: 'Woodland Cabin', village: 'Forest Retreat' },
    { value: 'Tiny Home', label: 'Tiny Home', village: 'Desert Oasis' },
    { value: 'Earth Ship', label: 'Earth Ship', village: 'Desert Oasis' },
    { value: 'Riverside Cabin', label: 'Riverside Cabin', village: 'River Valley' },
    { value: 'Floating House', label: 'Floating House', village: 'River Valley' },
    { value: 'Urban Garden Apartment', label: 'Urban Garden Apartment', village: 'City Sanctuary' },
    { value: 'Eco Loft', label: 'Eco Loft', village: 'City Sanctuary' },
  ];

  // Extract village options - use API data if available, otherwise use defaults
  const villageOptions = useMemo(() => {
    if (Array.isArray(villages) && villages.length > 0) {
      const apiVillages = villages
        .filter(v => v && (v.name || v.regionId || v._id || v.id))
        .map(v => ({
          value: v._id || v.id || v.name || v.regionId || '',
          label: v.name || v.regionId || 'Unknown Village',
        }));
      
      // Merge with defaults if they're not already in API data
      const defaultLabels = defaultVillageOptions.map(v => v.label);
      const apiLabels = apiVillages.map(v => v.label);
      const additionalDefaults = defaultVillageOptions.filter(v => !apiLabels.includes(v.label));
      
      return [...apiVillages, ...additionalDefaults];
    }
    return defaultVillageOptions;
  }, [villages]);

  // Extract property options - use API data if available, otherwise use defaults
  // Support both flat list (for chart) and grouped structure (matching ReviewWordCloud)
  const propertyOptions = useMemo(() => {
    let apiProperties = [];
    
    if (Array.isArray(villages) && villages.length > 0) {
      apiProperties = villages.flatMap(v => {
        if (Array.isArray(v.properties) && v.properties.length > 0) {
          return v.properties
            .filter(p => p && (p._id || p.id || p.title || p.name))
            .map(p => ({
              value: p._id || p.id || p.title || p.name || '',
              label: p.title || p.name || 'Unknown Property',
              village: v.name || v.regionId || 'Unknown Village',
            }));
        }
        return [];
      });
    }
    
    // Remove duplicates based on value, merge with defaults
    const allPropertiesMap = new Map();
    
    // Add API properties first
    apiProperties.forEach(p => {
      allPropertiesMap.set(p.value || p.label, p);
    });
    
    // Add defaults if they're not already in API data
    defaultPropertyOptions.forEach(p => {
      if (!allPropertiesMap.has(p.value)) {
        allPropertiesMap.set(p.value, p);
      }
    });

    // Return as flat list for the chart filter (react-select multi-select)
    return Array.from(allPropertiesMap.values());
  }, [villages]);

  // Grouped property options for display (matching ReviewWordCloud structure)
  const groupedPropertyOptions = useMemo(() => {
    const grouped = {};
    
    propertyOptions.forEach(prop => {
      const village = prop.village || 'Other';
      if (!grouped[village]) {
        grouped[village] = [];
      }
      grouped[village].push({
        value: prop.value,
        label: prop.label,
      });
    });

    // Convert to react-select grouped format
    return Object.entries(grouped).map(([village, properties]) => ({
      label: village.toUpperCase(),
      options: properties,
    }));
  }, [propertyOptions]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // Clear selections when category changes
    setSelectedVillages([]);
    setSelectedProperties([]);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = (data.Negative || 0) + (data.Neutral || 0) + (data.Positive || 0);
      return (
        <div className={`${styles.customTooltip} ${darkMode ? styles.darkTooltip : ''}`}>
          <p className={`${styles.tooltipLabel} ${darkMode ? styles.darkText : ''}`}>{data.month}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          <p className={`${styles.tooltipTotal} ${darkMode ? styles.darkText : ''}`}>Total: {total}</p>
        </div>
      );
    }
    return null;
  };

  // Chart will render with sample data regardless of villages loading state

  return (
    <div className={`${styles.chartContainer} ${darkMode ? styles.darkContainer : ''}`}>
      <h2 className={`${styles.chartTitle} ${darkMode ? styles.darkText : ''}`}>
        Review Volume Over Time
      </h2>

      {/* Chart Display - On Top */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={500} minWidth={0}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#e0e0e0'} />
            <XAxis
              dataKey="month"
              tick={{ fill: darkMode ? '#f1f1f1' : '#666', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              label={{
                value: 'Time',
                position: 'insideBottom',
                offset: -10,
                style: { textAnchor: 'middle', fill: darkMode ? '#f1f1f1' : '#666', fontSize: 14 },
              }}
            />
            <YAxis
              tick={{ fill: darkMode ? '#f1f1f1' : '#666', fontSize: 12 }}
              width={60}
              label={{
                value: 'Review Volume',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: darkMode ? '#f1f1f1' : '#666', fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
              formatter={(value) => {
                // Fix typo: "Negagative" -> "Negative"
                if (value === 'Negative') return 'Negative';
                return value;
              }}
            />
            <Bar dataKey="Negative" stackId="a" fill="#DC3545" name="Negative" />
            <Bar dataKey="Neutral" stackId="a" fill="#6C757D" name="Neutral" />
            <Bar dataKey="Positive" stackId="a" fill="#28A745" name="Positive" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters Section - On Bottom */}
      <div className={`${styles.filtersContainer} ${darkMode ? styles.darkFilters : ''}`}>
        {/* Dates Filter */}
        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
            Dates:
          </label>
          <div className={styles.dateRangeContainer}>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate || undefined}
              className={`${styles.dateInput} ${darkMode ? `${styles.darkInput} calendar-icon-dark` : ''}`}
              style={darkMode ? { colorScheme: 'dark' } : {}}
            />
            <span className={`${styles.dateSeparator} ${darkMode ? styles.darkText : ''}`}>
              to
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || undefined}
              className={`${styles.dateInput} ${darkMode ? `${styles.darkInput} calendar-icon-dark` : ''}`}
              style={darkMode ? { colorScheme: 'dark' } : {}}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
            Category:
          </label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className={`${styles.categorySelect} ${darkMode ? styles.darkSelect : ''}`}
          >
            <option value="By Village">By Village</option>
            <option value="By Property">By Property</option>
          </select>
        </div>

        {/* Villages Multi-select (active when Category = "By Village") */}
        {category === 'By Village' && (
          <div className={styles.filterGroup}>
            <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
              Villages:
            </label>
            <Select
              isMulti
              options={villageOptions}
              value={selectedVillages}
              onChange={setSelectedVillages}
              placeholder="Select villages..."
              className={styles.multiSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  borderColor: darkMode ? '#34495e' : '#d9d9d9',
                  boxShadow: '2px 2px 4px 1px rgba(0,0,0,0.1)',
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: darkMode ? '#4a5568' : '#40a9ff',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#34495e'
                      : '#e6f7ff'
                    : darkMode
                    ? '#1c2541'
                    : '#fff',
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:active': {
                    backgroundColor: darkMode ? '#4a5568' : '#bae7ff',
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#34495e' : '#e6f7ff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:hover': {
                    backgroundColor: '#dc3545',
                    color: '#fff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#888' : '#999',
                }),
                input: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
              }}
            />
          </div>
        )}

        {/* Properties Multi-select (active when Category = "By Property") */}
        {category === 'By Property' && (
          <div className={styles.filterGroup}>
            <label className={`${styles.filterLabel} ${darkMode ? styles.darkText : ''}`}>
              Properties:
            </label>
            <Select
              isMulti
              options={propertyOptions}
              value={selectedProperties}
              onChange={setSelectedProperties}
              placeholder="Select properties..."
              className={styles.multiSelect}
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  borderColor: darkMode ? '#34495e' : '#d9d9d9',
                  boxShadow: '2px 2px 4px 1px rgba(0,0,0,0.1)',
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: darkMode ? '#4a5568' : '#40a9ff',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#34495e'
                      : '#e6f7ff'
                    : darkMode
                    ? '#1c2541'
                    : '#fff',
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:active': {
                    backgroundColor: darkMode ? '#4a5568' : '#bae7ff',
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: darkMode ? '#34495e' : '#e6f7ff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                  '&:hover': {
                    backgroundColor: '#dc3545',
                    color: '#fff',
                  },
                }),
                placeholder: (base) => ({
                  ...base,
                  color: darkMode ? '#888' : '#999',
                }),
                input: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: darkMode ? '#f1f1f1' : '#000',
                }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewVolumeOverTimeChart;
