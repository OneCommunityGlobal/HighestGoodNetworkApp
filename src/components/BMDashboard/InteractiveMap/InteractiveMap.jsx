/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';

import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';

/* -----------------------------------------------------
   THEME UPDATER
----------------------------------------------------- */
function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.getContainer().classList.toggle('dark-mode-map', darkMode);
  }, [darkMode, map]);
  return null;
}

/* -----------------------------------------------------
   LEGEND (BOTTOM-RIGHT, SAFE MARGINS)
----------------------------------------------------- */
function Legend() {
  const map = useMap();
  const darkMode = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
    const div = L.DomUtil.create("div", "info legend");
    div.style.transform = "translate(-5px, -50px)";
    div.style.backgroundColor = darkMode ? "#1e2a3a" : "white";
    div.style.color = darkMode ? "white" : "#222";
    div.style.padding = "10px 12px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = darkMode
      ? "0 0 12px rgba(0,0,0,0.4)"
      : "0 0 12px rgba(0,0,0,0.15)";

    div.style.position = "relative";     // avoids clipping inside overflow:hidden
    div.style.zIndex = 1000;

    const statuses = ["active", "delayed", "completed"];
    const colors = ["#DE6A6A", "#E3D270", "#6ACFDE"];

    div.innerHTML = `
      <h4 style="margin:0 0 6px;font-size:14px;">Project Status</h4>
      ${statuses
        .map(
          (s, i) => `
        <div style="display:flex;align-items:center;margin-bottom:4px;">
          <span style="
            width:12px;height:12px;border-radius:50%;
            background:${colors[i]};
            margin-right:6px;
          "></span>
          <span>${s}</span>
        </div>`
        )
        .join("")}
      `;
      return div;
    };


    legend.addTo(map);

    return () => legend.remove();
  }, [map, darkMode]);

  return null;
}


/* -----------------------------------------------------
   MAIN INTERACTIVE MAP
----------------------------------------------------- */
export default function InteractiveMap() {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const history = useHistory();

  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapKey, setMapKey] = useState(0);
  const [errMsg, setErrMsg] = useState('');

  /* -----------------------------------------
     COLORS
  ----------------------------------------- */
  const getStatusColor = (status) => {
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

  /* -----------------------------------------
     FETCH
  ----------------------------------------- */
  const fetchOrgs = async () => {
    try {
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch {
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = response.data.data || [];

      // Print fetched data to check if backend is correct
      console.log("Backend data fetched:", data);

      setOrgs(data);
      setFilteredOrgs(data);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------
     FILTERING
  ----------------------------------------- */
  const applyDateFilters = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setErrMsg("End date cannot be earlier than start date");
      return;
    }
    setErrMsg("");

    let filtered = [...orgs];
    if (startDate) filtered = filtered.filter(o => new Date(o.startDate) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(o => new Date(o.startDate) <= new Date(endDate));

    setFilteredOrgs(filtered);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setErrMsg('');
    setFilteredOrgs(orgs);
  };

  const handleProjectClick = (org) =>
    history.push(`/bmdashboard/projects/${org.orgId}`);

  /* -----------------------------------------
     EFFECTS
  ----------------------------------------- */
  useEffect(() => { fetchOrgs(); }, []);
  useEffect(() => { setMapKey(k => k + 1); }, [darkMode]);

  /* -----------------------------------------
     LAYOUT STYLES
  ----------------------------------------- */
  const S = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: darkMode ? '#0d1b2a' : 'white'
    },

    topBar: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '12px 15px',
      gap: '12px',
      flexWrap: 'wrap'
    },

    mapArea: {
      flex: 1,
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },

    bottomLeftLabel: {
      position: 'absolute',
      left: '10px',
      bottom: '10px',
      padding: '6px 10px',
      background: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
      borderRadius: '6px',
      fontSize: '12px',
      backdropFilter: 'blur(6px)',
      color: darkMode ? 'white' : '#222',
      zIndex: 1000
    },

    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 15px",
      gap: "12px",
      flexWrap: "wrap", 
    },

    titleText: {
      margin: 0,
      fontSize: "20px",
      fontWeight: 600,
      color: darkMode ? "white" : "#222",
    },

    filterRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      flexWrap: "wrap", 
    },

  };

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */
  return (
    <div style={S.container}>
      {/* HEADER ROW — Title (left) + Filters (right) */}
      <div style={S.headerRow}>
        <h2 style={S.titleText}>
          Global Distribution and Project Status Overview
        </h2>

        <div style={S.filterRow}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.input}
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.input}
          />
          <button onClick={applyDateFilters} className={styles.applyButton}>
            Apply
          </button>
          <button onClick={resetFilters} className={styles.resetButton}>
            Reset
          </button>

          {errMsg && (
            <span style={{ color: "#DE6A6A", fontSize: "12px", paddingTop: "5px" }}>
              {errMsg}
            </span>
          )}
        </div>
      </div>


      {/* MAP — full width, flexible height */}
      <div style={S.mapArea}>
        {/* Bottom-left label inside map */}
        <div style={S.bottomLeftLabel}>
          Showing {filteredOrgs.length} of {orgs.length} projects
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading…</div>
        ) : (
          <MapContainer
            key={mapKey}
            center={[40, 0]}
            zoom={3}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
          >
            <MapThemeUpdater darkMode={darkMode} />

            <TileLayer
              url={
                darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />

            <Legend />

            <MarkerClusterGroup maxClusterRadius={70} chunkedLoading>
              {filteredOrgs.map((org, index) => (
                <CircleMarker
                  key={org.orgId || index}
                  center={[org.latitude, org.longitude]}
                  radius={8}
                  pathOptions={{
                    fillColor: getStatusColor(org.status),
                    fillOpacity: 0.85,
                    color: 'white',
                    weight: 1
                  }}
                >
                  <Tooltip>View Project #{org.orgId}</Tooltip>

                  <Popup>
                    <h3>Project #{org.orgId}</h3>
                    <p>Name: {org.name}</p>
                    <p>Status: {org.status}</p>
                    <p>Country: {org.country}</p>
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
  );
}
