/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';

import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import 'leaflet/dist/leaflet.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import styles from './InteractiveMap.module.css';

/* -----------------------------------------------------
   APPLY DARK MODE STYLING TO MAP
----------------------------------------------------- */
function MapThemeUpdater({ darkMode }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    if (darkMode) container.classList.add(styles.darkMap);
    else container.classList.remove(styles.darkMap);

    container.setAttribute('tabindex', '-1');
    map.invalidateSize();
  }, [darkMode, map]);

  return null;
}

/* -----------------------------------------------------
   DRAGGABLE LEGEND
----------------------------------------------------- */
function FloatingLegend({ darkMode, mapAreaRef }) {
  const legendRef = useRef(null);
  const [pos, setPos] = useState({ left: null, top: null });
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const origRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const div = legendRef.current;
    if (!div || !mapAreaRef.current) return;

    if (pos.left === null && pos.top === null) {
      const mapRect = mapAreaRef.current.getBoundingClientRect();
      setPos({
        left: mapRect.width - div.offsetWidth - 20,
        top: mapRect.height - div.offsetHeight - 20,
      });
    }

    const onMouseMove = e => {
      if (!draggingRef.current) return;

      const mapRect = mapAreaRef.current.getBoundingClientRect();

      let newLeft = origRef.current.x + (e.clientX - startRef.current.x);
      let newTop = origRef.current.y + (e.clientY - startRef.current.y);

      newLeft = Math.max(0, Math.min(newLeft, mapRect.width - 160));
      newTop = Math.max(0, Math.min(newTop, mapRect.height - 180));

      setPos({ left: newLeft, top: newTop });
    };

    const onMouseUp = () => {
      draggingRef.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [mapAreaRef, pos.left, pos.top]);

  const onMouseDown = e => {
    draggingRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    origRef.current = { x: pos.left, y: pos.top };
  };

  const statuses = ['active', 'delayed', 'completed'];
  const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];

  if (pos.left === null && pos.top === null && mapAreaRef.current) {
    const mapRect = mapAreaRef.current.getBoundingClientRect();
    setPos({
      left: mapRect.width - 160 - 20,
      top: mapRect.height - 180 - 20,
    });
  }

  return (
    <div
      ref={legendRef}
      className={styles.legendBox}
      style={{
        left: pos.left !== null ? pos.left + 'px' : undefined,
        top: pos.top !== null ? pos.top + 'px' : undefined,
        bottom: undefined,
        right: undefined,
        position: 'absolute',
        cursor: 'move',
      }}
      onMouseDown={onMouseDown}
    >
      <h4>Project Status</h4>
      {statuses.map((s, i) => (
        <div key={s} className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: colors[i] }}></span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

// Helper function to parse date safely with timezone consideration
const parseDateSafe = dateString => {
  if (!dateString) return null;

  if (dateString instanceof Date) {
    return isNaN(dateString.getTime()) ? null : dateString;
  }

  // Handle YYYY-MM-DD format specifically
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Helper to normalize dates for comparison
const normalizeDate = date => {
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Function to reverse geocode coordinates to get country name
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ProjectMapApp/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    if (data.address) {
      return data.address.country || data.address.country_code || 'Unknown Country';
    }

    return 'Unknown Location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Location not available';
  }
};

// Custom hook to fetch country names for coordinates
const useCountryNames = orgs => {
  const [countryCache, setCountryCache] = useState({});
  const [loadingCountries, setLoadingCountries] = useState({});

  useEffect(() => {
    const fetchCountryForOrgs = async () => {
      const orgsToGeocode = orgs.filter(org => {
        const cacheKey = `${org.latitude},${org.longitude}`;
        return !org.country && !countryCache[cacheKey] && !loadingCountries[cacheKey];
      });

      if (orgsToGeocode.length === 0) return;

      const newLoading = { ...loadingCountries };

      orgsToGeocode.forEach(org => {
        const cacheKey = `${org.latitude},${org.longitude}`;
        newLoading[cacheKey] = true;
      });

      setLoadingCountries(newLoading);

      for (const org of orgsToGeocode) {
        const cacheKey = `${org.latitude},${org.longitude}`;

        try {
          const country = await reverseGeocode(org.latitude, org.longitude);

          setCountryCache(prev => ({
            ...prev,
            [cacheKey]: country,
          }));
        } catch (error) {
          console.error(`Failed to geocode ${cacheKey}:`, error);

          setCountryCache(prev => ({
            ...prev,
            [cacheKey]: 'Unknown',
          }));
        }

        setLoadingCountries(prev => {
          const updated = { ...prev };
          delete updated[cacheKey];
          return updated;
        });
      }
    };

    fetchCountryForOrgs();
  }, [orgs, countryCache, loadingCountries]);

  const getCountryName = org => {
    if (org.country) return org.country;

    const cacheKey = `${org.latitude},${org.longitude}`;

    if (countryCache[cacheKey]) return countryCache[cacheKey];
    if (loadingCountries[cacheKey]) return 'Loading country...';

    return 'Location details';
  };

  return { getCountryName, loadingCountries };
};

/* -----------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------- */
export default function InteractiveMap() {
  const darkMode = useSelector(s => s.theme.darkMode);
  const history = useHistory();
  const mapAreaRef = useRef(null);

  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [mapKey, setMapKey] = useState(0);

  const { getCountryName } = useCountryNames(filteredOrgs);

  const pseudoOrgs = [
    {
      orgId: 9991,
      name: 'Project Alpha',
      status: 'active',
      latitude: 34.1185,
      longitude: -118.0743,
      startDate: '2025-11-01',
      endDate: '2026-05-01',
      country: 'United States',
    },
    {
      orgId: 9992,
      name: 'Project Beta',
      status: 'completed',
      latitude: 52.52,
      longitude: 13.405,
      startDate: '2023-12-10',
      endDate: '2024-08-15',
      country: 'Germany',
    },
    {
      orgId: 9993,
      name: 'Project Gamma',
      status: 'delayed',
      latitude: 35.6895,
      longitude: 139.6917,
      startDate: '2025-06-01',
      endDate: '2026-01-30',
      country: 'Japan',
    },
  ];

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#DE6A6A';
      case 'delayed':
        return '#E3D270';
      case 'completed':
        return '#6ACFDE';
      default:
        return '#AAAAAA';
    }
  };

  const getProjectStartDate = org =>
    parseDateSafe(
      org.startDate ||
        org.start_date ||
        org.projectStartDate ||
        org.project_start_date ||
        org.createdAt,
    );

  const getProjectEndDate = org =>
    parseDateSafe(
      org.endDate || org.end_date || org.projectEndDate || org.project_end_date || org.updatedAt,
    );

  const fetchOrgs = async () => {
    try {
      let res;

      try {
        res = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch {
        res = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = res.data.data && res.data.data.length ? res.data.data : pseudoOrgs;

      setOrgs(data);
      setFilteredOrgs(data);
    } catch (e) {
      console.error(e);

      setOrgs(pseudoOrgs);
      setFilteredOrgs(pseudoOrgs);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setFiltering(true);
    setErrMsg('');

    if (startDate && endDate && endDate < startDate) {
      setErrMsg('End date cannot be earlier than start date');
      setFilteredOrgs([]);
      setMapKey(k => k + 1);
      setFiltering(false);
      return;
    }

    const filtered = orgs.filter(org => {
      const orgStartDate = getProjectStartDate(org);
      const orgEndDate = getProjectEndDate(org) || orgStartDate;

      if (!orgStartDate) return false;

      const normOrgStart = normalizeDate(orgStartDate);
      const normOrgEnd = normalizeDate(orgEndDate);
      const normFilterStart = normalizeDate(startDate);
      const normFilterEnd = normalizeDate(endDate);

      if (normFilterStart && normFilterEnd) {
        const overlaps = normOrgStart <= normFilterEnd && normOrgEnd >= normFilterStart;
        if (!overlaps) return false;
      } else if (normFilterStart) {
        if (normOrgEnd < normFilterStart) return false;
      } else if (normFilterEnd) {
        if (normOrgStart > normFilterEnd) return false;
      }

      if (statusFilter && org.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });

    setFilteredOrgs(filtered);
    setMapKey(k => k + 1);
    setFiltering(false);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStatusFilter('');
    setErrMsg('');
    setFilteredOrgs(orgs);
    setMapKey(k => k + 1);
  };

  const handleProjectClick = org => history.push(`/bmdashboard/projects/${org.orgId}`);

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    setMapKey(k => k + 1);
  }, [darkMode]);

  const formatDateForDisplay = dateValue => {
    if (!dateValue) return 'N/A';

    const date = dateValue instanceof Date ? dateValue : parseDateSafe(dateValue);

    if (!date) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={darkMode ? styles.darkPage : styles.lightPage}>
      <div className={styles.container}>
        {/* TITLE ROW */}
        <div className={styles.headerRow}>
          <h2 className={styles.titleText}>Global Distribution and Project Status Overview</h2>
        </div>

        {/* FILTER ROW */}
        <div className={styles.filterRowExtra}>
          <label className={styles.filterLabel}>Date Range:</label>

          <div className={styles.filterInputs}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
              placeholderText="Start Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
              dateFormat="MM/dd/yyyy"
              isClearable
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />

            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
              placeholderText="End Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
              dateFormat="MM/dd/yyyy"
              isClearable
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>

            <button
              type="button"
              onClick={handleApplyFilters}
              className={`${styles.filterButton} ${darkMode ? styles.filterButtonDark : ''}`}
              disabled={filtering}
            >
              {filtering ? 'Applying...' : 'Apply'}
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className={`${styles.filterButton} ${darkMode ? styles.filterButtonDark : ''}`}
              disabled={filtering}
            >
              Reset
            </button>

            {errMsg && <span className={styles.errorMsg}>{errMsg}</span>}
          </div>

          <div className={styles.totalProjects}>
            Showing {filteredOrgs.length} of {orgs.length} projects
          </div>
        </div>

        {/* MAP */}
        <div className={styles.mapArea} ref={mapAreaRef}>
          <FloatingLegend darkMode={darkMode} mapAreaRef={mapAreaRef} />

          {loading ? (
            <div className={styles.loading}>Loading…</div>
          ) : (
            <MapContainer
              key={mapKey}
              center={[40, 0]}
              zoom={3}
              scrollWheelZoom
              zoomControl={false}
              className={styles.mapContainer}
              keyboard={false}
            >
              <MapThemeUpdater darkMode={darkMode} />

              <TileLayer
                url={
                  darkMode
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
              />

              <MarkerClusterGroup maxClusterRadius={70} chunkedLoading>
                {filteredOrgs.map(org => (
                  <CircleMarker
                    key={org.orgId}
                    center={[org.latitude, org.longitude]}
                    radius={8}
                    pathOptions={{
                      fillColor: getStatusColor(org.status),
                      fillOpacity: 0.85,
                      color: 'white',
                      weight: 1,
                    }}
                  >
                    <Tooltip className={darkMode ? styles.darkTooltip : styles.lightTooltip}>
                      <div>
                        <strong>{org.name}</strong>
                        <br />
                        Status: {org.status}
                        <br />
                        Country: {getCountryName(org)}
                      </div>
                    </Tooltip>

                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{org.name}</h3>

                        <div style={{ marginBottom: '10px' }}>
                          <strong>Project ID:</strong> #{org.orgId}
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <strong>Status:</strong>{' '}
                          <span
                            style={{
                              color:
                                org.status === 'active'
                                  ? '#DE6A6A'
                                  : org.status === 'delayed'
                                  ? '#E3D270'
                                  : org.status === 'completed'
                                  ? '#6ACFDE'
                                  : '#AAAAAA',
                              fontWeight: 'bold',
                            }}
                          >
                            {org.status}
                          </span>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <strong>Location:</strong> {getCountryName(org)}
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <strong>Start Date:</strong>{' '}
                          {formatDateForDisplay(getProjectStartDate(org))}
                        </div>

                        {getProjectEndDate(org) && (
                          <div style={{ marginBottom: '15px' }}>
                            <strong>End Date:</strong>{' '}
                            {formatDateForDisplay(getProjectEndDate(org))}
                          </div>
                        )}

                        <button
                          onClick={() => handleProjectClick(org)}
                          className={styles.detailsButton}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#1f6feb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          View Project Details
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
