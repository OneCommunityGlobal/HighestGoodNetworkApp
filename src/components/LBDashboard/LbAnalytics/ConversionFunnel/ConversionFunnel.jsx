import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MultiSelect } from 'react-multi-select-component';
import Plot from 'react-plotly.js';
import styles from './ConversionFunnel.module.css';

/**
 * ConversionFunnelFilters Component
 * Provides filtering controls for the conversion funnel
 */
const ConversionFunnelFilters = ({
  dateRange,
  category,
  selectedVillages,
  selectedProperties,
  villageOptions,
  propertyOptions,
  onDateRangeChange,
  onCategoryChange,
  onVillagesChange,
  onPropertiesChange,
  darkMode,
}) => {
  const handleStartDateChange = date => {
    onDateRangeChange([date, dateRange[1]]);
  };

  const handleEndDateChange = date => {
    onDateRangeChange([dateRange[0], date]);
  };

  return (
    <div className={`${styles.filtersContainer} ${darkMode ? styles.darkFiltersContainer : ''}`}>
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Date Range:</span>
        <div className={styles.dateRangePicker}>
          <div className={styles.datePickerWrapper}>
            <span className={styles.dateLabel}>From:</span>
            <DatePicker
              selected={dateRange[0]}
              onChange={handleStartDateChange}
              selectsStart
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              maxDate={dateRange[1]}
              dateFormat="MMM d, yyyy"
              className={`${styles.datePicker} ${darkMode ? styles.darkDatePicker : ''}`}
            />
          </div>
          <div className={styles.datePickerWrapper}>
            <span className={styles.dateLabel}>To:</span>
            <DatePicker
              selected={dateRange[1]}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              minDate={dateRange[0]}
              maxDate={new Date()}
              dateFormat="MMM d, yyyy"
              className={`${styles.datePicker} ${darkMode ? styles.darkDatePicker : ''}`}
            />
          </div>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Category:</span>
        <div className={styles.categoryButtons}>
          <button
            type="button"
            className={`${styles.categoryButton} ${
              category === 'village' ? styles.categoryButtonActive : ''
            } ${darkMode ? styles.darkCategoryButton : ''}`}
            onClick={() => onCategoryChange('village')}
          >
            By Village
          </button>
          <button
            type="button"
            className={`${styles.categoryButton} ${
              category === 'property' ? styles.categoryButtonActive : ''
            } ${darkMode ? styles.darkCategoryButton : ''}`}
            onClick={() => onCategoryChange('property')}
          >
            By Property
          </button>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>
          {category === 'village' ? 'Select Villages:' : 'Select Properties:'}
        </span>
        <div className={styles.multiSelectWrapper}>
          {category === 'village' ? (
            <MultiSelect
              options={villageOptions}
              value={selectedVillages}
              onChange={onVillagesChange}
              labelledBy="Select Villages"
              className={darkMode ? styles.darkMultiSelect : ''}
              hasSelectAll={true}
              disableSearch={false}
              overrideStrings={{
                selectSomeItems: 'Select villages...',
                allItemsAreSelected: 'All villages selected',
                selectAll: 'Select All',
                search: 'Search villages',
              }}
            />
          ) : (
            <MultiSelect
              options={propertyOptions}
              value={selectedProperties}
              onChange={onPropertiesChange}
              labelledBy="Select Properties"
              className={darkMode ? styles.darkMultiSelect : ''}
              hasSelectAll={true}
              disableSearch={false}
              overrideStrings={{
                selectSomeItems: 'Select properties...',
                allItemsAreSelected: 'All properties selected',
                selectAll: 'Select All',
                search: 'Search properties',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ConversionFunnelChart Component
 * Renders a Sankey diagram using Plotly to visualize the conversion funnel
 */
const ConversionFunnelChart = ({ data, darkMode }) => {
  if (!data) return null;

  const { labels, source, target, value, nodeColors, linkColors, numbers } = data;

  // Fixed node positions for clean layout
  const nodePositions = {
    x: [0.02, 0.26, 0.26, 0.56, 0.92, 0.92, 0.92, 0.92],
    y: [0.08, 0.62, 0.08, 0.48, 0.82, 0.38, 0.6, 0.08],
  };

  const plotData = [
    {
      type: 'sankey',
      orientation: 'h',
      arrangement: 'snap',
      node: {
        pad: 32,
        thickness: 20,
        line: {
          color: darkMode ? '#1a1a1a' : '#ffffff',
          width: 2,
        },
        x: nodePositions.x,
        y: nodePositions.y,
        textfont: {
          size: 11,
          color: darkMode ? '#f5f5f5' : '#444444',
          family: 'Arial, sans-serif',
        },
        label: labels.map(label => {
          const labelValues = {
            'Users Attracted': numbers.usersAttracted,
            'Showed Interest': numbers.showedInterest,
            'Did Not Show Interest': numbers.didNotShowInterest,
            'Placed Bids': numbers.placedBids,
            'Did Not Place Bids': numbers.didNotPlaceBids,
            'Paying Guests': numbers.payingGuests,
            'Did Not Convert': numbers.didNotConvert,
            Bounced: numbers.bounced,
          };
          return `${label}<br>${labelValues[label]?.toLocaleString() || ''}`;
        }),
        color: nodeColors,
        customdata: labels,
        hovertemplate: '%{customdata}<br>%{value:,}<extra></extra>',
      },
      link: {
        source,
        target,
        value,
        color: linkColors,
        hovertemplate:
          '%{source.customdata} → %{target.customdata}<br>%{value:,} users<extra></extra>',
      },
    },
  ];

  const layout = {
    font: {
      size: 12,
      color: darkMode ? '#ffffff' : '#222222',
      family: 'Arial, sans-serif',
    },
    plot_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    paper_bgcolor: darkMode ? '#1a1a1a' : '#ffffff',
    margin: {
      l: 20,
      r: 20,
      t: 50,
      b: 40,
    },
    height: 640,
    annotations: [
      {
        text: 'Legend:',
        x: 1.02,
        y: 0.95,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 14,
          color: darkMode ? '#ffffff' : '#222222',
          weight: 'bold',
        },
      },
      {
        text: '● Conversion Steps',
        x: 1.02,
        y: 0.88,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 12,
          color: '#5DBEAF',
        },
      },
      {
        text: '● Interest Phase',
        x: 1.02,
        y: 0.81,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 12,
          color: '#6B5B95',
        },
      },
      {
        text: '● Bidding Phase',
        x: 1.02,
        y: 0.74,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 12,
          color: '#F39C12',
        },
      },
      {
        text: '● Successful Conversion',
        x: 1.02,
        y: 0.67,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 12,
          color: '#E74C3C',
        },
      },
      {
        text: '● Drop-off Points',
        x: 1.02,
        y: 0.6,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'left',
        yanchor: 'top',
        showarrow: false,
        font: {
          size: 12,
          color: '#2C3E50',
        },
      },
    ],
  };

  const config = {
    displayModeBar: false,
    displaylogo: false,
    responsive: true,
  };

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkChartCard : ''}`}>
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </div>
  );
};

/**
 * ConversionFunnel Component
 * Main component displaying conversion funnel with filters
 */
const ConversionFunnel = ({ darkMode }) => {
  const [dateRange, setDateRange] = useState([
    moment()
      .subtract(6, 'months')
      .toDate(),
    moment().toDate(),
  ]);
  const [category, setCategory] = useState('village'); // 'village' or 'property'
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock village and property options
  const villageOptions = [
    { label: 'Village 1', value: 'village1' },
    { label: 'Village 2', value: 'village2' },
    { label: 'Village 3', value: 'village3' },
    { label: 'Village 4', value: 'village4' },
    { label: 'Village 5', value: 'village5' },
  ];

  const propertyOptions = [
    { label: 'Property A', value: 'propertyA' },
    { label: 'Property B', value: 'propertyB' },
    { label: 'Property C', value: 'propertyC' },
    { label: 'Property D', value: 'propertyD' },
    { label: 'Property E', value: 'propertyE' },
    { label: 'Property F', value: 'propertyF' },
  ];

  // Generate mock conversion funnel data
  useEffect(() => {
    setLoading(true);

    // Calculate date range in days to vary data
    const daysDiff = moment(dateRange[1]).diff(moment(dateRange[0]), 'days');
    const dateMultiplier = Math.min(daysDiff / 180, 2); // Cap at 2x for 6+ months

    // Calculate selection multiplier based on villages/properties
    let selectionMultiplier = 1;
    if (category === 'village' && selectedVillages.length > 0) {
      selectionMultiplier = selectedVillages.length / villageOptions.length;
    } else if (category === 'property' && selectedProperties.length > 0) {
      selectionMultiplier = selectedProperties.length / propertyOptions.length;
    }

    // Base numbers vary by category
    const baseUsers = category === 'village' ? 10000 : 8500;
    const baseMultiplier = dateMultiplier * selectionMultiplier;

    // Add variation to conversion rates (not just fixed percentages)
    const interestRate = 0.35 + Math.random() * 0.25; // 35-60% show interest
    const bidRate = 0.35 + Math.random() * 0.25; // 35-60% of interested place bids
    const conversionRate = 0.3 + Math.random() * 0.25; // 30-55% of bidders convert

    // Sample conversion funnel data - varies based on filters
    const usersAttracted = Math.round(baseUsers * baseMultiplier);
    const showedInterest = Math.round(usersAttracted * interestRate);
    const didNotShowInterest = usersAttracted - showedInterest;
    const placedBids = Math.round(showedInterest * bidRate);
    const didNotPlaceBids = showedInterest - placedBids;
    const payingGuests = Math.round(placedBids * conversionRate);
    const didNotConvert = placedBids - payingGuests;
    const bounced = didNotShowInterest;

    // Create Sankey data structure
    const sankeyData = {
      // Nodes (labels for each stage)
      labels: [
        'Users Attracted', // 0
        'Showed Interest', // 1
        'Did Not Show Interest', // 2
        'Placed Bids', // 3
        'Did Not Place Bids', // 4
        'Paying Guests', // 5
        'Did Not Convert', // 6
        'Bounced', // 7
      ],

      // Links between nodes (source -> target with value)
      source: [
        0, // Users Attracted -> Showed Interest
        0, // Users Attracted -> Did Not Show Interest
        1, // Showed Interest -> Placed Bids
        1, // Showed Interest -> Did Not Place Bids
        3, // Placed Bids -> Paying Guests
        3, // Placed Bids -> Did Not Convert
        2, // Did Not Show Interest -> Bounced
      ],
      target: [
        1, // -> Showed Interest
        2, // -> Did Not Show Interest
        3, // -> Placed Bids
        4, // -> Did Not Place Bids
        5, // -> Paying Guests
        6, // -> Did Not Convert
        7, // -> Bounced
      ],
      value: [
        showedInterest, // 4200
        didNotShowInterest, // 5800
        placedBids, // 1800
        didNotPlaceBids, // 2400
        payingGuests, // 720
        didNotConvert, // 1080
        bounced, // 5800
      ],

      // Colors for nodes (matching the image provided)
      nodeColors: [
        '#5DBEAF', // Users Attracted (teal)
        '#6B5B95', // Showed Interest (purple)
        '#2C3E50', // Did Not Show Interest (dark blue)
        '#F39C12', // Placed Bids (orange)
        '#2C3E50', // Did Not Place Bids (dark blue)
        '#E74C3C', // Paying Guests (red/pink)
        '#34495E', // Did Not Convert (grey-blue)
        '#5DBEAF', // Bounced (teal)
      ],

      // Colors for links
      linkColors: [
        'rgba(107, 91, 149, 0.4)', // Users -> Showed Interest (purple)
        'rgba(44, 62, 80, 0.4)', // Users -> Did Not Show Interest (dark)
        'rgba(243, 156, 18, 0.4)', // Showed -> Placed Bids (orange)
        'rgba(44, 62, 80, 0.4)', // Showed -> Did Not Place Bids (dark)
        'rgba(231, 76, 60, 0.4)', // Placed -> Paying (red)
        'rgba(52, 73, 94, 0.4)', // Placed -> Did Not Convert (grey)
        'rgba(93, 190, 175, 0.4)', // Did Not Show -> Bounced (teal)
      ],

      // Numerical data for display
      numbers: {
        usersAttracted,
        showedInterest,
        didNotShowInterest,
        placedBids,
        didNotPlaceBids,
        payingGuests,
        didNotConvert,
        bounced,
      },
    };

    setTimeout(() => {
      setData(sankeyData);
      setLoading(false);
    }, 300);
  }, [dateRange, category, selectedVillages, selectedProperties]);

  const handleDateRangeChange = range => {
    setDateRange(range);
  };

  const handleCategoryChange = newCategory => {
    setCategory(newCategory);
    // Reset selections when category changes
    if (newCategory === 'village') {
      setSelectedProperties([]);
    } else {
      setSelectedVillages([]);
    }
  };

  const handleVillagesChange = villages => {
    setSelectedVillages(villages);
  };

  const handlePropertiesChange = properties => {
    setSelectedProperties(properties);
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <ConversionFunnelFilters
        dateRange={dateRange}
        category={category}
        selectedVillages={selectedVillages}
        selectedProperties={selectedProperties}
        villageOptions={villageOptions}
        propertyOptions={propertyOptions}
        onDateRangeChange={handleDateRangeChange}
        onCategoryChange={handleCategoryChange}
        onVillagesChange={handleVillagesChange}
        onPropertiesChange={handlePropertiesChange}
        darkMode={darkMode}
      />

      <div className={styles.chartContainer}>
        {loading ? (
          <div className={styles.loading}>Loading conversion funnel data...</div>
        ) : data ? (
          <ConversionFunnelChart data={data} darkMode={darkMode} />
        ) : (
          <div className={styles.noData}>No data available</div>
        )}
      </div>
    </div>
  );
};

ConversionFunnel.propTypes = {
  darkMode: PropTypes.bool,
};

ConversionFunnel.defaultProps = {
  darkMode: false,
};

export default ConversionFunnel;
