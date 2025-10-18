/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';

function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const container = map.getContainer();
    container.classList.toggle(styles.darkModeMap, darkMode);
  }, [darkMode, map]);
  return null;
}

function Legend() {
  const map = useMap();
  const darkMode = useSelector(state => state.theme.darkMode);
  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', `${styles.legend} ${darkMode ? styles.dark : ''}`);
      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      let html = `<h4>Project Status</h4>`;
      statuses.forEach((status, i) => {
        html += `
          <div class="${styles.legendItem}">
            <div class="${styles.legendColor}" style="background-color:${colors[i]}"></div>
            <span>${status}</span>
          </div>
        `;
      });
      div.innerHTML = html;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map, darkMode]);
  return null;
}

function InteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapKey, setMapKey] = useState(0);
  const [errMsg, setErrMsg] = useState('');

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

  const fetchOrgs = async () => {
    try {
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch {
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }
      const data = response.data.data || [];
      setOrgs(data);
      setFilteredOrgs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilters = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setErrMsg('End date cannot be earlier than start date');
      return;
    }
    setErrMsg('');
    let filtered = [...orgs];
    if (startDate)
      filtered = filtered.filter(org => new Date(org.startDate) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(org => new Date(org.startDate) <= new Date(endDate));
    setFilteredOrgs(filtered);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setErrMsg('');
    setFilteredOrgs(orgs);
  };

  const handleProjectClick = org => {
    history.push(`/bmdashboard/projects/${org.orgId}`);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [darkMode]);

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <h1 className={styles.title}>Global Project Distribution and Status Overview</h1>

      <div className={styles.mapWrapper}>
        <div className={styles.filterContainer}>
          <div className={`${styles.filterBox} ${darkMode ? styles.darkFilterBox : ''}`}>
            <h4>Filter by Date Range</h4>
            <div className={styles.dateRow}>
              <div className={styles.dateInput}>
                <label>Start:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.dateInput}>
                <label>End:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            {errMsg && <span className={styles.error}>{errMsg}</span>}
            <div className={styles.buttonRow}>
              <button onClick={applyDateFilters} className={`${styles.button} ${styles.apply}`}>
                Apply
              </button>
              <button onClick={resetFilters} className={`${styles.button} ${styles.reset}`}>
                Reset
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading map data...</div>
        ) : (
          <MapContainer
            key={mapKey}
            center={[51.505, -0.09]}
            zoom={3}
            scrollWheelZoom
            className={styles.mapContainer}
          >
            <MapThemeUpdater darkMode={darkMode} />
            <TileLayer
              url={
                darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Legend />
            <MarkerClusterGroup
              disableClusteringAtZoom={13}
              spiderfyOnMaxZoom
              chunkedLoading
              maxClusterRadius={80}
            >
              {filteredOrgs.map((org, index) => (
                <CircleMarker
                  key={org.orgId || index}
                  center={[org.latitude, org.longitude]}
                  radius={8}
                  pathOptions={{
                    fillColor: getStatusColor(org.status),
                    fillOpacity: 0.8,
                    color: 'white',
                    weight: 1,
                  }}
                >
                  <Tooltip className={darkMode ? styles.darkTooltip : ''} permanent={false}>
                    Click here to View Project #{org.orgId} details
                  </Tooltip>
                  <Popup className={darkMode ? styles.darkPopup : ''}>
                    <div className={styles.popupContent}>
                      <h3>Project #{org.orgId}</h3>
                      <p>Name: {org.name}</p>
                      <p>Status: {org.status}</p>
                      <p>Country: {org.country}</p>
                      <p>Start Date: {new Date(org.startDate).toLocaleDateString()}</p>
                      <button
                        onClick={() => handleProjectClick(org)}
                        className={styles.detailsButton}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>

      <div className={styles.count}>
        Showing {filteredOrgs.length} of {orgs.length} projects
      </div>
    </div>
  );
}

export default InteractiveMap;
