/* eslint-disable */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
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

function formatApplicationCount(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Linear RGB interpolation for map fill (0–1). */
function lerpRgb(from, to, t) {
  const u = Math.min(1, Math.max(0, t));
  const r = Math.round(from[0] + (to[0] - from[0]) * u);
  const g = Math.round(from[1] + (to[1] - from[1]) * u);
  const b = Math.round(from[2] + (to[2] - from[2]) * u);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Tooltip comparison copy — `preset` must be current WEEK | MONTH | YEAR (never default to "year"). */
function getMapTooltipComparisonLine(country, preset) {
  if (!country || preset === 'CUSTOM' || preset === 'ALL') return null;
  let periodWord;
  if (preset === 'WEEK') periodWord = 'week';
  else if (preset === 'MONTH') periodWord = 'month';
  else if (preset === 'YEAR') periodWord = 'year';
  else return null;

  let pct = country.percentageChange;
  if (pct == null || Number.isNaN(Number(pct))) {
    const prevRaw = country.previousPeriod;
    const prev = prevRaw != null ? Number(prevRaw) : 0;
    const curr = Number(country.applications) || 0;
    if (prevRaw == null && curr === 0) return null;
    if (prev === 0 && curr === 0) return null;
    pct = prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
  } else {
    pct = Number(pct);
  }

  if (Math.abs(pct) < 0.5) return `Same as last ${periodWord}`;
  const rounded = Math.round(Math.abs(pct));
  return pct > 0
    ? `${rounded}% more than last ${periodWord}`
    : `${rounded}% fewer than last ${periodWord}`;
}

function CountryOfApplicationMapChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  // State management
  const [dateFilter, setDateFilter] = useState('ALL');
  /** Empty array = all roles; otherwise list of role names sent to the API. */
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [mapError, setMapError] = useState(null);
  const [applicationData, setApplicationData] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const mapWrapRef = useRef(null);
  const [mapDims, setMapDims] = useState({ w: 960, h: 480 });

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const sync = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      const safeW = Math.max(280, Math.min(1200, w));
      const h = Math.max(220, Math.round(safeW * 0.5));
      setMapDims({ w: safeW, h });
    };
    sync();
    const ro = new ResizeObserver(() => sync());
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  const roleOptions = useMemo(() => availableRoles.map(r => ({ value: r, label: r })), [
    availableRoles,
  ]);

  const roleSelectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: 40,
        backgroundColor: darkMode ? '#2d3748' : '#fff',
        borderColor: state.isFocused ? '#48bb78' : darkMode ? '#4a5568' : '#e2e8f0',
        boxShadow: state.isFocused ? '0 0 0 1px #48bb78' : 'none',
      }),
      menu: base => ({
        ...base,
        zIndex: 100010,
        backgroundColor: darkMode ? '#2d3748' : '#fff',
        border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
      }),
      menuPortal: base => ({ ...base, zIndex: 100010 }),
      option: (base, st) => ({
        ...base,
        backgroundColor: st.isSelected
          ? '#48bb78'
          : st.isFocused
          ? darkMode
            ? '#4a5568'
            : '#f7fafc'
          : 'transparent',
        color: st.isSelected ? '#fff' : darkMode ? '#e2e8f0' : '#2d3748',
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#4a5568' : '#c6f6d5',
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#f7fafc' : '#22543d',
      }),
      multiValueRemove: (base, st) => ({
        ...base,
        color: st.isSelected ? '#fff' : darkMode ? '#e2e8f0' : '#2d3748',
        ':hover': {
          backgroundColor: darkMode ? '#68d391' : '#9ae6b4',
          color: '#1a202c',
        },
      }),
      placeholder: base => ({ ...base, color: darkMode ? '#a0aec0' : '#718096' }),
      input: base => ({ ...base, color: darkMode ? '#e2e8f0' : '#2d3748' }),
    }),
    [darkMode],
  );

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setHoveredCountry(null);
        setMapError(null);

        // Try to fetch from backend API first
        try {
          console.log('🔄 Fetching from backend API with filters:', {
            timeFrame: dateFilter,
            selectedRoles,
            customStartDate,
            customEndDate,
          });

          const params = {
            roles: selectedRoles.length > 0 ? selectedRoles : [],
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

          // Backend: { success, data: [...], meta } or legacy array
          const countriesData = Array.isArray(response)
            ? response
            : Array.isArray(response?.data)
            ? response.data
            : response.countries || [];

          // Transform API data to match component format
          const transformedData = countriesData.map(country => {
            const applications = country.count || 0;
            const previousPeriod =
              country.previousCount != null && !Number.isNaN(Number(country.previousCount))
                ? Number(country.previousCount)
                : null;
            let percentageChange =
              country.percentageChange != null && !Number.isNaN(Number(country.percentageChange))
                ? Number(country.percentageChange)
                : null;
            if (percentageChange == null && previousPeriod != null) {
              if (previousPeriod > 0)
                percentageChange = ((applications - previousPeriod) / previousPeriod) * 100;
              else if (applications > 0) percentageChange = 100;
              else percentageChange = 0;
            }
            return {
              country: country.countryName || country.country,
              applications,
              previousPeriod,
              percentageChange,
            };
          });

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
            roles: selectedRoles,
            dates:
              dateFilter === 'CUSTOM'
                ? `${toYyyyMmDd(customStartDate)} to ${toYyyyMmDd(customEndDate)}`
                : 'N/A',
          });

          setLastFetchTime(new Date().toLocaleTimeString());

          const rolesFromApi = rolesPayload?.roles || rolesPayload?.data;
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
          const transformedData = mockData.countries.map(country => {
            const applications = country.applicationCount || 0;
            const previousPeriod = country.previousCount ?? 0;
            const percentageChange =
              previousPeriod > 0
                ? ((applications - previousPeriod) / previousPeriod) * 100
                : applications > 0
                ? 100
                : 0;
            return {
              country: country.countryName,
              applications,
              previousPeriod,
              percentageChange,
            };
          });

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
  }, [dateFilter, selectedRoles, customStartDate, customEndDate]);

  // Role and time filters are applied server-side; no client-side random scaling
  const processedData = useMemo(() => applicationData, [applicationData]);

  // Log-scaled color ramp so mid/low counts spread apart when one country dominates (req: easier differences)
  const colorScale = useCallback(
    applications => {
      if (!applications || applications === 0) {
        return darkMode ? '#2d3748' : '#f7fafc';
      }

      const counts = processedData.map(d => d.applications);
      const maxApplications = Math.max(...counts, 0);
      if (maxApplications <= 0) {
        return darkMode ? '#2d3748' : '#f7fafc';
      }

      const positive = processedData.filter(d => d.applications > 0).map(d => d.applications);
      const minApplications = positive.length ? Math.min(...positive) : 1;

      let intensity;
      if (maxApplications === minApplications) {
        intensity = 1;
      } else {
        const log = Math.log1p;
        const lo = log(minApplications);
        const hi = log(maxApplications);
        const t = (log(applications) - lo) / (hi - lo);
        intensity = Math.min(1, Math.max(0, t));
        // Slight curve: lift mid-range so neighbors differ more when the range is huge
        intensity = Math.pow(intensity, 0.82);
      }

      if (darkMode) {
        // Dark slate-green → bright emerald
        return lerpRgb([34, 48, 58], [52, 211, 153], intensity);
      }
      // Very light mint → deep forest green
      return lerpRgb([236, 253, 245], [20, 83, 45], intensity);
    },
    [processedData, darkMode],
  );

  const selectedRoleOptions = useMemo(
    () => roleOptions.filter(o => selectedRoles.includes(o.value)),
    [roleOptions, selectedRoles],
  );

  // Handle date filter change
  const handleDateFilterChange = useCallback(value => {
    setDateFilter(String(value));
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

  const tooltipComparisonLine = hoveredCountry
    ? getMapTooltipComparisonLine(hoveredCountry, dateFilter)
    : null;

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
            | Roles: {selectedRoles.length ? selectedRoles.join(', ') : 'All'}
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

        {/* Role filter — multi-select (API accepts comma-separated roles). */}
        <div className={`${styles.filterGroup} ${styles.filterGroupWide}`}>
          <label htmlFor="country-map-role-filter" className={styles.filterLabel}>
            Roles
          </label>
          <Select
            inputId="country-map-role-filter"
            instanceId="country-map-role-filter"
            isMulti
            isClearable
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={roleOptions}
            value={selectedRoleOptions}
            onChange={opts => setSelectedRoles(opts ? opts.map(o => o.value) : [])}
            placeholder="All roles"
            classNamePrefix="custom-select"
            className={styles.roleSelect}
            styles={roleSelectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
          />
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
          <div ref={mapWrapRef} className={styles.mapSvgWrap}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: Math.max(100, Math.round((147 * mapDims.w) / 1200)),
                center: [0, 20],
              }}
              width={mapDims.w}
              height={mapDims.h}
              style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }}
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
          </div>
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
              <strong>Applications:</strong> {formatApplicationCount(hoveredCountry.applications)}
            </div>
            {(dateFilter === 'WEEK' || dateFilter === 'MONTH' || dateFilter === 'YEAR') &&
              hoveredCountry.previousPeriod != null && (
                <div className={styles.tooltipStat}>
                  <strong>Prior period:</strong>{' '}
                  {formatApplicationCount(hoveredCountry.previousPeriod)}
                </div>
              )}
            {tooltipComparisonLine ? (
              <div className={styles.tooltipComparison}>{tooltipComparisonLine}</div>
            ) : null}
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
        {selectedRoles.length > 0 && (
          <div className={styles.statItem}>
            <div
              className={styles.statValue}
              style={{ fontSize: 'clamp(13px, 2.8vw, 24px)', lineHeight: 1.2, textAlign: 'center' }}
            >
              {selectedRoles.join(', ')}
            </div>
            <div className={styles.statLabel}>Selected Roles</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CountryOfApplicationMapChart;
