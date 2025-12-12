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

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [mapKey, setMapKey] = useState(0);

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

  const pseudoOrgs = [
    {
      orgId: 9991,
      name: 'Project Alpha',
      status: 'active',
      latitude: 34.1185,
      longitude: -118.0743,
      startDate: '2025-11-01',
    },
    {
      orgId: 9992,
      name: 'Project Beta',
      status: 'completed',
      latitude: 52.52,
      longitude: 13.405,
      startDate: '2023-12-10',
      endDate: '2024-08-15',
    },
    {
      orgId: 9993,
      name: 'Project Gamma',
      status: 'delayed',
      latitude: 35.6895,
      longitude: 139.6917,
      startDate: '2025-06-01',
    },
  ];

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

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setErrMsg('End date cannot be earlier than start date');
      setFilteredOrgs([]);
      return;
    }
    setErrMsg('');

    const filtered = orgs.filter(o => {
      const orgStart = new Date(o.startDate);
      const orgEnd = o.endDate ? new Date(o.endDate) : orgStart;
      if (isNaN(orgStart) || isNaN(orgEnd)) return false;
      if (startDate && orgEnd < startDate) return false;
      if (endDate && orgStart > endDate) return false;
      if (statusFilter && o.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      return true;
    });

    setFilteredOrgs(filtered);
  }, [startDate, endDate, statusFilter, orgs]);

  const handleProjectClick = org => history.push(`/bmdashboard/projects/${org.orgId}`);

  useEffect(() => {
    fetchOrgs();
  }, []);
  useEffect(() => {
    setMapKey(k => k + 1);
  }, [darkMode]);

  return (
    <div className={darkMode ? styles.darkPage : styles.lightPage}>
      <div className={styles.container}>
        {/* TITLE ROW */}
        <div className={styles.headerRow}>
          <h2 className={styles.titleText}>Global Distribution and Project Status Overview</h2>
        </div>

        {/* FILTER ROW */}
        <div className={styles.filterRowExtra}>
          <div className={styles.filterInputs}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
              placeholderText="Start Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
              placeholderText="End Date"
              calendarClassName={darkMode ? styles.calendarDark : styles.calendarLight}
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
            {errMsg && <span className={styles.errorMsg}>{errMsg}</span>}
          </div>
          <div className={styles.totalProjects}>Total Projects: {orgs.length}</div>
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
                      View Project #{org.orgId}
                    </Tooltip>
                    <Popup>
                      <h3>Project #{org.orgId}</h3>
                      <p>Name: {org.name}</p>
                      <p>Status: {org.status}</p>
                      <p>Start: {new Date(org.startDate).toLocaleDateString()}</p>
                      <button
                        onClick={() => handleProjectClick(org)}
                        className={styles.detailsButton}
                      >
                        View Details
                      </button>
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
