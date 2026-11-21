import { useState, useEffect, useRef, forwardRef } from 'react';
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
import { MapConfig } from './MapSharedComponents';

/* -----------------------------------------------------
   CUSTOM DATE INPUT
----------------------------------------------------- */

const MapDateInput = forwardRef(({ darkMode, className, ...props }, ref) => (
  <input
    {...props}
    ref={ref}
    className={`${styles.dateInput} ${
      darkMode ? styles.dateInputDark : styles.dateInputLight
    } ${className || ''}`}
  />
));

MapDateInput.displayName = 'MapDateInput';

/* -----------------------------------------------------
   APPLY DARK MODE STYLING TO MAP
----------------------------------------------------- */

function MapThemeUpdater({ darkMode }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    if (darkMode) {
      container.classList.add(styles.darkMap);
    } else {
      container.classList.remove(styles.darkMap);
    }

    container.setAttribute('tabindex', '-1');
    map.invalidateSize();
  }, [darkMode, map]);

  return null;
}

/* -----------------------------------------------------
   DRAGGABLE LEGEND
----------------------------------------------------- */

function FloatingLegend({ mapAreaRef }) {
  const legendRef = useRef(null);
  const [pos, setPos] = useState({ left: null, top: null });

  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const origRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const legend = legendRef.current;
    const mapArea = mapAreaRef.current;

    if (!legend || !mapArea) return undefined;

    if (pos.left === null && pos.top === null) {
      const mapRect = mapArea.getBoundingClientRect();

      setPos({
        left: 20,
        top: Math.max(0, mapRect.height - legend.offsetHeight - 20),
      });
    }

    const onMouseMove = e => {
      if (!draggingRef.current) return;

      const mapRect = mapArea.getBoundingClientRect();

      const newLeft = Math.max(
        0,
        Math.min(
          origRef.current.x + (e.clientX - startRef.current.x),
          mapRect.width - legend.offsetWidth,
        ),
      );

      const newTop = Math.max(
        0,
        Math.min(
          origRef.current.y + (e.clientY - startRef.current.y),
          mapRect.height - legend.offsetHeight,
        ),
      );

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
    if (e.target.closest('button') && e.target !== legendRef.current) return;

    draggingRef.current = true;

    startRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    origRef.current = {
      x: pos.left ?? 20,
      y: pos.top ?? 20,
    };
  };

  const onKeyDown = e => {
    const movements = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    };

    const movement = movements[e.key];

    if (!movement) return;

    e.preventDefault();

    const mapArea = mapAreaRef.current;
    const legend = legendRef.current;

    if (!mapArea || !legend) return;

    const mapRect = mapArea.getBoundingClientRect();

    setPos(current => ({
      left: Math.max(
        0,
        Math.min(
          (current.left ?? 20) + movement[0],
          Math.max(0, mapRect.width - legend.offsetWidth),
        ),
      ),
      top: Math.max(
        0,
        Math.min(
          (current.top ?? 20) + movement[1],
          Math.max(0, mapRect.height - legend.offsetHeight),
        ),
      ),
    }));
  };

  const statuses = ['active', 'delayed', 'completed'];
  const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];

  return (
    <button
      ref={legendRef}
      type="button"
      className={styles.legendBox}
      aria-label="Draggable project status legend. Use arrow keys to move."
      style={{
        left: pos.left !== null ? `${pos.left}px` : undefined,
        top: pos.top !== null ? `${pos.top}px` : undefined,
        bottom: undefined,
        right: undefined,
        position: 'absolute',
        cursor: 'move',
      }}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    >
      <h4>Project Status</h4>

      {statuses.map((status, index) => (
        <div key={status} className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: colors[index] }} />
          <span>{status}</span>
        </div>
      ))}
    </button>
  );
}

/* -----------------------------------------------------
   DATE HELPERS
----------------------------------------------------- */

const parseDateSafe = dateString => {
  if (!dateString) return null;

  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(dateString);

  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeDate = date => {
  if (!date) return null;

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/* -----------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------- */

export default function InteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  const mapAreaRef = useRef(null);

  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const [mapKey, setMapKey] = useState(0);

  /* -----------------------------------------------------
     FETCH ORGANIZATIONS FROM BACKEND
  ----------------------------------------------------- */

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        setErrMsg('');

        const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);

        const data = response.data.data || [];

        const validOrgs = data.filter(
          org =>
            org.orgId &&
            org.latitude != null &&
            org.longitude != null &&
            Number.isFinite(Number(org.latitude)) &&
            Number.isFinite(Number(org.longitude)) &&
            Number(org.latitude) >= -90 &&
            Number(org.latitude) <= 90 &&
            Number(org.longitude) >= -180 &&
            Number(org.longitude) <= 180,
        );

        setOrgs(validOrgs);
        setFilteredOrgs(validOrgs);
      } catch (error) {
        console.error('Error fetching organization locations:', error);

        setErrMsg(error.response?.data?.error || 'Unable to load project locations.');

        setOrgs([]);
        setFilteredOrgs([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrgs();
  }, []);

  /* -----------------------------------------------------
     FILTER ORGANIZATIONS BY DATE AND STATUS
  ----------------------------------------------------- */

  useEffect(() => {
    setErrMsg('');

    if (startDate && endDate && endDate < startDate) {
      setErrMsg('End date cannot be earlier than start date');
      setFilteredOrgs([]);
      return;
    }

    const filtered = orgs.filter(org => {
      const orgStartDate = parseDateSafe(org.startDate);
      const orgEndDate = parseDateSafe(org.endDate) || orgStartDate;

      if (!orgStartDate) return false;

      const normalizedOrgStart = normalizeDate(orgStartDate);
      const normalizedOrgEnd = normalizeDate(orgEndDate);

      const normalizedFilterStart = normalizeDate(startDate);
      const normalizedFilterEnd = normalizeDate(endDate);

      if (normalizedFilterStart && normalizedFilterEnd) {
        const overlaps =
          normalizedOrgStart <= normalizedFilterEnd && normalizedOrgEnd >= normalizedFilterStart;

        if (!overlaps) return false;
      } else if (normalizedFilterStart) {
        if (normalizedOrgEnd < normalizedFilterStart) {
          return false;
        }
      } else if (normalizedFilterEnd) {
        if (normalizedOrgStart > normalizedFilterEnd) {
          return false;
        }
      }

      if (statusFilter && org.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });

    setFilteredOrgs(filtered);
  }, [startDate, endDate, statusFilter, orgs]);

  /* -----------------------------------------------------
     MAP HELPERS
  ----------------------------------------------------- */

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

  const getStatusClass = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.statusActive;

      case 'delayed':
        return styles.statusDelayed;

      case 'completed':
        return styles.statusCompleted;

      default:
        return styles.statusDefault;
    }
  };

  const formatDateForDisplay = dateString => {
    if (!dateString) return 'N/A';

    const date = parseDateSafe(dateString);

    if (!date) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  /* -----------------------------------------------------
     NAVIGATE TO PROJECT DETAILS PAGE
  ----------------------------------------------------- */

  const handleProjectClick = org => {
    history.push(`/bm/orgLocation/${org.orgId}`);
  };

  /* -----------------------------------------------------
     UPDATE MAP WHEN THEME CHANGES
  ----------------------------------------------------- */

  useEffect(() => {
    setMapKey(key => key + 1);
  }, [darkMode]);

  /* -----------------------------------------------------
     MAP CONTENT
  ----------------------------------------------------- */

  let mapContent;

  if (loading) {
    mapContent = <div className={styles.loading}>Loading…</div>;
  } else if (errMsg && orgs.length === 0) {
    mapContent = <div className={styles.loading}>{errMsg}</div>;
  } else {
    mapContent = (
      <MapContainer
        key={mapKey}
        center={[40, 0]}
        zoom={3}
        minZoom={2}
        maxZoom={15}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1.0}
        worldCopyJump={false}
        scrollWheelZoom
        className={styles.mapContainer}
        keyboard={false}
      >
        <MapThemeUpdater darkMode={darkMode} />

        <TileLayer
          noWrap
          bounds={[
            [-85, -180],
            [85, 180],
          ]}
          url={MapConfig.tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          minZoom={2}
          maxZoom={15}
        />

        <MarkerClusterGroup maxClusterRadius={70} chunkedLoading>
          {filteredOrgs.map(org => (
            <CircleMarker
              key={org.orgId}
              center={[Number(org.latitude), Number(org.longitude)]}
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
                  Country: {org.country || 'N/A'}
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
                        color: getStatusColor(org.status),
                        fontWeight: 'bold',
                      }}
                    >
                      {org.status}
                    </span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Status:</strong>{' '}
                    <span className={getStatusClass(org.status)}>{org.status}</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Location:</strong> {org.country || 'N/A'}
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Start Date:</strong> {formatDateForDisplay(org.startDate)}
                  </div>

                  {org.endDate && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>End Date:</strong> {formatDateForDisplay(org.endDate)}
                    </div>
                  )}

                  <button
                    type="button"
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
    );
  }

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */

  return (
    <div className={darkMode ? styles.darkPage : styles.lightPage}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.titleText}>Global Distribution and Project Status Overview</h2>
        </div>

        <div className={styles.filterRowExtra}>
          <span className={styles.filterLabel}>Date Range:</span>

          <div className={styles.filterInputs}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              customInput={<MapDateInput darkMode={darkMode} />}
              wrapperClassName={`${styles.datePickerWrapper} ${
                darkMode ? styles.datePickerWrapperDark : styles.datePickerWrapperLight
              }`}
              placeholderText="Start Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
              popperClassName={styles.datePickerPopper}
              popperPlacement="bottom-start"
              dateFormat="MM/dd/yyyy"
              isClearable
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />

            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              customInput={<MapDateInput darkMode={darkMode} />}
              wrapperClassName={`${styles.datePickerWrapper} ${
                darkMode ? styles.datePickerWrapperDark : styles.datePickerWrapperLight
              }`}
              placeholderText="End Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
              popperClassName={styles.datePickerPopper}
              popperPlacement="bottom-start"
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
              className={`${styles.dateInput} ${styles.statusSelect} ${
                darkMode ? styles.dateInputDark : styles.dateInputLight
              }`}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>

            {errMsg && <span className={styles.errorMsg}>{errMsg}</span>}
          </div>

          <div className={styles.totalProjects}>
            Total Projects: {orgs.length} | Showing: {filteredOrgs.length}
          </div>
        </div>

        <div className={styles.mapArea} ref={mapAreaRef}>
          <FloatingLegend mapAreaRef={mapAreaRef} />
          {mapContent}
        </div>
      </div>
    </div>
  );
}
