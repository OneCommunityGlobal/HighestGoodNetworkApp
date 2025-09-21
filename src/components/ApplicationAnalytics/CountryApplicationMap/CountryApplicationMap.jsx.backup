import React, { useState, useMemo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useSelector } from 'react-redux';
import styles from './CountryApplicationMap.module.css';

// World map topojson URL - using a reliable TopoJSON source
const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

// Mock data for demonstration - this will be replaced with API calls
const mockApplicationData = [
  { country: 'United States of America', applications: 1250, previousPeriod: 1100 },
  { country: 'Canada', applications: 450, previousPeriod: 420 },
  { country: 'United Kingdom', applications: 380, previousPeriod: 350 },
  { country: 'Germany', applications: 320, previousPeriod: 300 },
  { country: 'France', applications: 280, previousPeriod: 260 },
  { country: 'Australia', applications: 250, previousPeriod: 230 },
  { country: 'Japan', applications: 200, previousPeriod: 190 },
  { country: 'Brazil', applications: 180, previousPeriod: 170 },
  { country: 'India', applications: 160, previousPeriod: 150 },
  { country: 'South Africa', applications: 140, previousPeriod: 130 },
  { country: 'Mexico', applications: 120, previousPeriod: 110 },
  { country: 'Italy', applications: 100, previousPeriod: 95 },
  { country: 'Spain', applications: 90, previousPeriod: 85 },
  { country: 'Netherlands', applications: 80, previousPeriod: 75 },
  { country: 'Sweden', applications: 70, previousPeriod: 65 },
];

// Mock role data
const mockRoles = [
  'Software Developer',
  'Project Manager',
  'Data Analyst',
  'UX Designer',
  'Marketing Specialist',
  'Content Writer',
  'DevOps Engineer',
  'Product Manager',
  'QA Tester',
  'Business Analyst',
];

function CountryApplicationMap() {
  const darkMode = useSelector(state => state.theme.darkMode);

  // State management
  const [dateFilter, setDateFilter] = useState('monthly');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mapError, setMapError] = useState(null);

  // Process data based on filters
  const processedData = useMemo(() => {
    let filteredData = [...mockApplicationData];

    // Apply role filter if any roles are selected
    if (selectedRoles.length > 0) {
      // In real implementation, this would filter based on actual role data
      filteredData = filteredData.map(country => ({
        ...country,
        applications: Math.floor(country.applications * (0.7 + Math.random() * 0.6)),
      }));
    }

    return filteredData;
  }, [selectedRoles]);

  // Calculate color scale
  const colorScale = useMemo(() => {
    const maxApplications = Math.max(...processedData.map(d => d.applications));
    const minApplications = Math.min(...processedData.map(d => d.applications));

    return applications => {
      if (!applications) return darkMode ? '#2d3748' : '#f7fafc';

      const intensity = (applications - minApplications) / (maxApplications - minApplications);

      if (darkMode) {
        // Dark mode color scale
        return `rgb(${Math.floor(30 + intensity * 100)}, ${Math.floor(
          50 + intensity * 150,
        )}, ${Math.floor(100 + intensity * 155)})`;
      } else {
        // Light mode color scale
        return `rgb(${Math.floor(240 - intensity * 100)}, ${Math.floor(
          240 - intensity * 150,
        )}, ${Math.floor(255 - intensity * 155)})`;
      }
    };
  }, [processedData, darkMode]);

  // Handle role selection
  const handleRoleChange = useCallback((role, checked) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, role]);
    } else {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    }
  }, []);

  // Handle date filter change
  const handleDateFilterChange = useCallback(value => {
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  }, []);

  // Handle mouse events for tooltip
  const handleMouseEnter = useCallback((event, country) => {
    setHoveredCountry(country);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback(
    event => {
      if (hoveredCountry) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [hoveredCountry],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  // Calculate percentage change
  const calculatePercentageChange = useCallback((current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  }, []);

  // Get comparison text based on date filter
  const getComparisonText = useCallback(
    country => {
      if (dateFilter === 'custom' || (!customStartDate && !customEndDate)) {
        return null;
      }

      const percentageChange = calculatePercentageChange(
        country.applications,
        country.previousPeriod,
      );
      if (percentageChange === null) return null;

      const periodText =
        dateFilter === 'weekly' ? 'week' : dateFilter === 'monthly' ? 'month' : 'year';

      const direction = percentageChange > 0 ? 'more' : 'less';
      const absChange = Math.abs(percentageChange);

      return `${absChange}% ${direction} than last ${periodText}`;
    },
    [dateFilter, customStartDate, customEndDate, calculatePercentageChange],
  );

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Country of Application Map</h2>
        <p className={styles.subtitle}>
          Interactive map showing application distribution by country
        </p>
      </div>

      {/* Filters Panel */}
      <div className={styles.filtersPanel}>
        {/* Date Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="date-filter" className={styles.filterLabel}>
            Time Period
          </label>
          <select
            id="date-filter"
            value={dateFilter}
            onChange={e => handleDateFilterChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateFilter === 'custom' && (
            <div className={styles.customDateInputs}>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className={styles.dateInput}
                placeholder="Start Date"
              />
              <span className={styles.dateSeparator}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className={styles.dateInput}
                placeholder="End Date"
              />
            </div>
          )}
        </div>

        {/* Role Filter */}
        <div className={styles.filterGroup}>
          <fieldset>
            <legend className={styles.filterLabel}>Roles (Multi-select)</legend>
            <div className={styles.roleCheckboxes}>
              {mockRoles.map(role => (
                <label key={role} className={styles.roleCheckbox}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={e => handleRoleChange(role, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>{role}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Map Container */}
      <div className={styles.mapContainer}>
        {mapError ? (
          <div className={styles.mapError}>
            <h3>Map Loading Error</h3>
            <p>Unable to load the world map. Please try refreshing the page.</p>
            <button
              onClick={() => {
                setMapError(null);
                window.location.reload();
              }}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        ) : (
          <ComposableMap
            projection="geoMercator"
            width={800}
            height={400}
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies
              geography={geoUrl}
              onError={error => {
                // eslint-disable-next-line no-console
                console.error('Map loading error:', error);
                setMapError(error);
              }}
            >
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryName =
                    geo.properties.NAME || geo.properties.NAME_EN || geo.properties.name;
                  const countryData = processedData.find(
                    d =>
                      d.country === countryName ||
                      d.country.toLowerCase().includes(countryName?.toLowerCase() || '') ||
                      countryName?.toLowerCase().includes(d.country.toLowerCase()) ||
                      // Additional matching for common variations
                      (countryName === 'United States of America' &&
                        d.country === 'United States of America') ||
                      (countryName === 'United Kingdom' && d.country === 'United Kingdom'),
                  );

                  const applications = countryData?.applications || 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(applications)}
                      stroke={darkMode ? '#4a5568' : '#e2e8f0'}
                      strokeWidth={0.5}
                      onMouseEnter={event => {
                        if (countryData) {
                          handleMouseEnter(event, countryData);
                        }
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          fill: colorScale(applications),
                          outline: 'none',
                          cursor: countryData ? 'pointer' : 'default',
                        },
                        hover: {
                          fill: countryData
                            ? colorScale(applications * 1.1)
                            : colorScale(applications),
                          outline: 'none',
                          cursor: countryData ? 'pointer' : 'default',
                        },
                        pressed: {
                          fill: colorScale(applications * 1.2),
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        )}

        {/* Color Scale Legend */}
        <div className={styles.legend}>
          <div className={styles.legendTitle}>Applications</div>
          <div className={styles.legendScale}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: colorScale(0) }} />
              <span>0</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{
                  backgroundColor: colorScale(
                    Math.max(...processedData.map(d => d.applications)) / 4,
                  ),
                }}
              />
              <span>{Math.round(Math.max(...processedData.map(d => d.applications)) / 4)}</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{
                  backgroundColor: colorScale(
                    Math.max(...processedData.map(d => d.applications)) / 2,
                  ),
                }}
              />
              <span>{Math.round(Math.max(...processedData.map(d => d.applications)) / 2)}</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{
                  backgroundColor: colorScale(Math.max(...processedData.map(d => d.applications))),
                }}
              />
              <span>{Math.max(...processedData.map(d => d.applications))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
          }}
        >
          <div className={styles.tooltipTitle}>{hoveredCountry.country}</div>
          <div className={styles.tooltipContent}>
            <div className={styles.tooltipStat}>
              <strong>Applications:</strong> {hoveredCountry.applications}
            </div>
            {getComparisonText(hoveredCountry) && (
              <div className={styles.tooltipComparison}>{getComparisonText(hoveredCountry)}</div>
            )}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className={styles.summaryStats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {processedData.reduce((sum, country) => sum + country.applications, 0)}
          </div>
          <div className={styles.statLabel}>Total Applications</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{processedData.length}</div>
          <div className={styles.statLabel}>Countries</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {Math.round(
              processedData.reduce((sum, country) => sum + country.applications, 0) /
                processedData.length,
            )}
          </div>
          <div className={styles.statLabel}>Avg per Country</div>
        </div>
        {selectedRoles.length > 0 && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{selectedRoles.length}</div>
            <div className={styles.statLabel}>Selected Roles</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryApplicationMap;
