/* eslint-disable */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useSelector } from 'react-redux';
import countryApplicationService from '../../services/countryApplicationService';
import styles from './CountryOfApplicationMapChart.module.css';

function toYyyyMmDd(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// World map topojson URL - using reliable TopoJSON source
const geoUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

// Country name mappings to handle different naming conventions
const countryNameMap = {
  'United States of America': ['United States', 'USA', 'US'],
  'United Kingdom': ['UK', 'Great Britain'],
  'South Africa': ['RSA'],
};

function CountryOfApplicationMapChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  // State management
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mapError, setMapError] = useState(null);
  const [applicationData, setApplicationData] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMapError(null);

        // Try to fetch from backend API first
        try {
          console.log('🔄 Fetching from backend API with filters:', {
            timeFrame: dateFilter,
            selectedRole: selectedRole,
            customStartDate,
            customEndDate,
          });

          const params = {
            roles: selectedRole !== 'ALL' ? [selectedRole] : [],
          };

          if (dateFilter === 'ALL') {
            params.timeFrame = 'ALL';
          } else if (dateFilter === 'CUSTOM') {
            params.startDate = toYyyyMmDd(customStartDate);
            params.endDate = toYyyyMmDd(customEndDate);
            params.customDateRange = !!(customStartDate && customEndDate);
          } else {
            const end = new Date();
            const start = new Date();
            if (dateFilter === 'WEEK') {
              start.setDate(end.getDate() - 7);
            } else if (dateFilter === 'MONTH') {
              start.setDate(end.getDate() - 30);
            } else if (dateFilter === 'YEAR') {
              start.setDate(end.getDate() - 365);
            }
            params.startDate = start.toISOString().slice(0, 10);
            params.endDate = end.toISOString().slice(0, 10);
          }

          const [response, rolesPayload] = await Promise.all([
            countryApplicationService.getCountryApplicationData(params),
            countryApplicationService.getAvailableRoles(),
          ]);

          console.log('📦 Backend response:', response);
          console.log(
            '📊 Total applications from backend:',
            response.data?.reduce((sum, c) => sum + (c.count || 0), 0) || 0,
          );

          // Backend returns data directly in the array, not nested under 'countries'
          const countriesData = Array.isArray(response)
            ? response
            : response.countries || response.data || [];

          // Transform API data to match component format
          const transformedData = countriesData.map(country => ({
            country: country.countryName,
            applications: country.count || 0,
            previousPeriod: country.previousCount || 0,
            percentageChange: country.percentageChange || 0,
          }));

          setApplicationData(transformedData);

          const stats = {
            totalApplications: transformedData.reduce(
              (sum, country) => sum + country.applications,
              0,
            ),
            totalCountries: transformedData.length,
            avgPerCountry:
              transformedData.length > 0
                ? Math.round(
                    transformedData.reduce((sum, country) => sum + country.applications, 0) /
                      transformedData.length,
                  )
                : 0,
          };

          console.log('✅ Summary Statistics:', stats);
          console.log('🔍 Applied Filters:', {
            timeFrame: dateFilter,
            role: selectedRole,
            dates:
              dateFilter === 'CUSTOM'
                ? `${toYyyyMmDd(customStartDate)} to ${toYyyyMmDd(customEndDate)}`
                : 'N/A',
          });

          setLastFetchTime(new Date().toLocaleTimeString());

          const rolesFromApi = rolesPayload?.data;
          if (Array.isArray(rolesFromApi) && rolesFromApi.length > 0) {
            setAvailableRoles(rolesFromApi);
          } else if (response.availableRoles) {
            setAvailableRoles(response.availableRoles);
          } else {
            setAvailableRoles([
              'Software Developer',
              'Project Manager',
              'Data Analyst',
              'UX Designer',
              'Marketing Specialist',
              'Content Writer',
              'DevOps Engineer',
              'Product Manager',
            ]);
          }

          console.log('✅ Successfully fetched data from backend');
        } catch (apiError) {
          // If API fails, fall back to mock data
          console.warn('⚠️ Backend API unavailable, using mock data:', apiError.message);

          const mockData = countryApplicationService.getMockData();
          const transformedData = mockData.countries.map(country => ({
            country: country.countryName,
            applications: country.applicationCount || 0,
            previousPeriod: country.previousCount || 0,
          }));

          setApplicationData(transformedData);
          setAvailableRoles([
            'Software Developer',
            'Project Manager',
            'Data Analyst',
            'UX Designer',
            'Marketing Specialist',
            'Content Writer',
            'DevOps Engineer',
            'Product Manager',
          ]);
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setMapError('Failed to load application data');
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, selectedRole, customStartDate, customEndDate]);

  // Role and time filters are applied server-side; no client-side random scaling
  const processedData = useMemo(() => applicationData, [applicationData]);

  // Calculate color scale with softer pastel greens
  const colorScale = useCallback(
    applications => {
      if (!applications || applications === 0) {
        return darkMode ? '#2d3748' : '#f7fafc';
      }

      const maxApplications = Math.max(...processedData.map(d => d.applications));
      const minApplications = Math.min(
        ...processedData.filter(d => d.applications > 0).map(d => d.applications),
      );

      const intensity =
        maxApplications === minApplications
          ? 1
          : (applications - minApplications) / (maxApplications - minApplications);

      if (darkMode) {
        // Dark mode: soft pastel gradient from light mint to sage green
        const r = Math.floor(169 - intensity * 50); // 169 -> 119 (mint to sage)
        const g = Math.floor(228 - intensity * 40); // 228 -> 188 (soft green range)
        const b = Math.floor(204 - intensity * 70); // 204 -> 134 (pastel to deeper)
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Light mode: soft pastel gradient from very light mint to medium sage
        const r = Math.floor(209 - intensity * 80); // 209 -> 129 (pale mint to sage)
        const g = Math.floor(242 - intensity * 55); // 242 -> 187 (very soft to medium)
        const b = Math.floor(235 - intensity * 85); // 235 -> 150 (pastel range)
        return `rgb(${r}, ${g}, ${b})`;
      }
    },
    [processedData, darkMode],
  );

  // Handle role selection
  const handleRoleChange = useCallback(value => {
    setSelectedRole(value);
  }, []);

  // Handle date filter change
  const handleDateFilterChange = useCallback(value => {
    setDateFilter(value);
    if (value !== 'CUSTOM') {
      setCustomStartDate(null);
      setCustomEndDate(null);
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

  // Get comparison text based on date filter
  const getComparisonText = useCallback(
    country => {
      if (dateFilter === 'CUSTOM' || dateFilter === 'ALL') {
        return null;
      }

      // Use percentageChange from backend if available
      const percentageChange = country.percentageChange;
      if (percentageChange === null || percentageChange === undefined) return null;

      const periodText = dateFilter === 'WEEK' ? 'week' : dateFilter === 'MONTH' ? 'month' : 'year';

      const direction = percentageChange > 0 ? 'more' : 'less';
      const absChange = Math.abs(Math.round(percentageChange));

      return `${absChange}% ${direction} than last ${periodText}`;
    },
    [dateFilter],
  );

  // Match country names flexibly
  const findCountryData = useCallback(
    geoCountryName => {
      if (!geoCountryName) return null;

      return processedData.find(d => {
        // Safety check
        if (!d || !d.country) return false;

        // Direct match
        if (d.country.toLowerCase() === geoCountryName.toLowerCase()) return true;

        // Check if either contains the other
        if (
          d.country.toLowerCase().includes(geoCountryName.toLowerCase()) ||
          geoCountryName.toLowerCase().includes(d.country.toLowerCase())
        )
          return true;

        // Check mappings
        for (const [mainName, aliases] of Object.entries(countryNameMap)) {
          if (
            d.country === mainName &&
            aliases.some(alias => geoCountryName.toLowerCase().includes(alias.toLowerCase()))
          )
            return true;
        }

        return false;
      });
    },
    [processedData],
  );

  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.loading}>Loading map data...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Country of Application Map</h2>
        <p className={styles.subtitle}>
          Interactive map showing application distribution by country
        </p>
        {lastFetchTime && (
          <p
            className={styles.subtitle}
            style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '4px' }}
          >
            Last updated: {lastFetchTime} | Filter:{' '}
            {dateFilter === 'ALL'
              ? 'All Time'
              : dateFilter === 'WEEK'
              ? 'Last 7 Days'
              : dateFilter === 'MONTH'
              ? 'Last 30 Days'
              : dateFilter === 'YEAR'
              ? 'Last Year'
              : 'Custom'}{' '}
            | Role: {selectedRole}
          </p>
        )}
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
            <option value="ALL">All Time</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">Last 30 Days</option>
            <option value="YEAR">Last Year</option>
            <option value="CUSTOM">Custom Range</option>
          </select>

          {dateFilter === 'CUSTOM' && (
            <div className={styles.customDateInputs}>
              <DatePicker
                selected={customStartDate}
                onChange={setCustomStartDate}
                placeholderText="Start Date"
                isClearable
                showIcon
                dateFormat="yyyy-MM-dd"
                maxDate={customEndDate || undefined}
                className={styles.dateInput}
                calendarClassName={darkMode ? styles.datePickerCalendarDark : undefined}
                popperClassName={styles.datePickerPopper}
              />
              <span className={styles.dateSeparator}>to</span>
              <DatePicker
                selected={customEndDate}
                onChange={setCustomEndDate}
                placeholderText="End Date"
                isClearable
                showIcon
                dateFormat="yyyy-MM-dd"
                minDate={customStartDate || undefined}
                className={styles.dateInput}
                calendarClassName={darkMode ? styles.datePickerCalendarDark : undefined}
                popperClassName={styles.datePickerPopper}
              />
            </div>
          )}
        </div>

        {/* Role Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="role-filter" className={styles.filterLabel}>
            Role
          </label>
          <select
            id="role-filter"
            value={selectedRole}
            onChange={e => handleRoleChange(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Roles</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className={styles.mapContainer}>
        {mapError ? (
          <div className={styles.mapError}>
            <h3>Map Loading Error</h3>
            <p>{mapError}</p>
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
            projectionConfig={{
              scale: 147,
              center: [0, 20],
            }}
            width={1200}
            height={600}
            style={{ width: '100%', height: 'auto' }}
          >
            <Geographies
              geography={geoUrl}
              onError={error => {
                console.error('Map loading error:', error);
                setMapError('Unable to load map data');
              }}
            >
              {({ geographies }) =>
                geographies.map(geo => {
                  const countryName =
                    geo.properties.NAME || geo.properties.NAME_EN || geo.properties.name;
                  const countryData = findCountryData(countryName);

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
                            ? colorScale(applications * 1.15)
                            : colorScale(applications),
                          outline: 'none',
                          cursor: countryData ? 'pointer' : 'default',
                          stroke: darkMode ? '#68d391' : '#48bb78',
                          strokeWidth: 1.5,
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
            {processedData.length > 0 && (
              <>
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
                      backgroundColor: colorScale(
                        Math.max(...processedData.map(d => d.applications)),
                      ),
                    }}
                  />
                  <span>{Math.max(...processedData.map(d => d.applications))}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div
          className={styles.tooltip}
          style={{
            left: tooltipPosition.x + 15,
            top: tooltipPosition.y + 15,
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 999999,
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
            {processedData.length > 0
              ? Math.round(
                  processedData.reduce((sum, country) => sum + country.applications, 0) /
                    processedData.length,
                )
              : 0}
          </div>
          <div className={styles.statLabel}>Avg per Country</div>
        </div>
        {selectedRole !== 'ALL' && (
          <div className={styles.statItem}>
            <div className={styles.statValue}>{selectedRole}</div>
            <div className={styles.statLabel}>Selected Role</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryOfApplicationMapChart;
