/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { MapThemeUpdater, Legend, ProjectMarkers, MapUtils } from './MapSharedComponents';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';

export default function InteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapKey, setMapKey] = useState(0);
  const [errMsg, setErrMsg] = useState('');

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
      console.log('Backend data fetched:', data);

      // If no data from backend, use pseudo data
      if (data.length === 0) {
        console.log('No data from backend, using pseudo data');
        const pseudoData = MapUtils.getPseudoOrgs();
        setOrgs(pseudoData);
        setFilteredOrgs(pseudoData);
      } else {
        setOrgs(data);
        setFilteredOrgs(data);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      // If fetch fails, use pseudo data
      const pseudoData = MapUtils.getPseudoOrgs();
      setOrgs(pseudoData);
      setFilteredOrgs(pseudoData);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------
     FILTERING
  ----------------------------------------- */
  const applyDateFilters = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setErrMsg('End date cannot be earlier than start date');
      return;
    }
    setErrMsg('');

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

  const handleProjectClick = org => history.push(`/bmdashboard/projects/${org.orgId}`);

  /* -----------------------------------------
     EFFECTS
  ----------------------------------------- */
  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    setMapKey(k => k + 1);
  }, [darkMode]);

  /* -----------------------------------------
     STYLES
  ----------------------------------------- */
  const S = MapUtils.getMapStyles(darkMode);

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */
  return (
    <div style={S.container}>
      {/* HEADER ROW — Title (left) + Filters (right) */}
      <div style={S.headerRow}>
        <h2 style={S.titleText}>Global Distribution and Project Status Overview</h2>

        <div style={S.filterRow}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={S.input}
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={S.input}
          />
          <button onClick={applyDateFilters} style={S.applyButton}>
            Apply
          </button>
          <button onClick={resetFilters} style={S.resetButton}>
            Reset
          </button>

          {errMsg && (
            <span style={{ color: '#DE6A6A', fontSize: '13px', fontWeight: '500' }}>{errMsg}</span>
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
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: darkMode ? 'white' : '#222',
              background: darkMode ? '#0d1b2a' : 'white',
            }}
          >
            Loading…
          </div>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <Legend />

            <MarkerClusterGroup maxClusterRadius={70} chunkedLoading spiderfyOnMaxZoom={true}>
              <ProjectMarkers
                orgs={filteredOrgs}
                darkMode={darkMode}
                onProjectClick={handleProjectClick}
                markerRadius={8}
              />
            </MarkerClusterGroup>
          </MapContainer>
        )}
      </div>
    </div>
  );
}
