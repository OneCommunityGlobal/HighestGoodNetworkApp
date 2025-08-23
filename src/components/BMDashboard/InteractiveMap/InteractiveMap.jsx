/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import css from './InteractiveMap.module.css';

function MapThemeUpdater({ darkMode }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const container = map.getContainer();
    container.classList.toggle('dark-mode-map', darkMode);
  }, [darkMode, map]);

  return null;
}

function Legend() {
  const map = useMap();
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = darkMode ? '#1e2a3a' : 'white';
      div.style.color = darkMode ? 'white' : 'black';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = darkMode
        ? '0 0 15px rgba(255,255,255,0.1)'
        : '0 0 15px rgba(0,0,0,0.2)';

      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];

      let html = `<h4 style="margin-top:0;margin-bottom:5px;color:${
        darkMode ? 'white' : 'black'
      }">Project Status</h4>`;

      statuses.forEach((status, i) => {
        html += `
          <div style="display:flex;align-items:center;margin-bottom:5px;">
            <div style="width:12px;height:12px;border-radius:50%;background-color:${
              colors[i]
            };margin-right:8px;"></div>
            <span style="color:${darkMode ? 'white' : 'black'}">${status}</span>
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
      const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      const data = response.data.data || [];
      setOrgs(data);
      setFilteredOrgs(data);
    } catch (error) {
      console.error('Error fetching orgs:', error);
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
    if (startDate) {
      const startDateFilter = new Date(startDate);
      filtered = filtered.filter(org => new Date(org.startDate) >= startDateFilter);
    }
    if (endDate) {
      const endDateFilter = new Date(endDate);
      filtered = filtered.filter(org => new Date(org.startDate) <= endDateFilter);
    }
    setFilteredOrgs(filtered);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setErrMsg('');
    setFilteredOrgs(orgs);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [darkMode]);

  const styles = {
    container: {
      color: darkMode ? 'white' : 'black',
      backgroundColor: darkMode ? '#0d1b2a' : 'white',
      padding: '20px',
      transition: 'all 0.3s ease',
    },
    title: {
      color: darkMode ? 'white' : 'black',
      paddingBottom: '20px',
      transition: 'color 0.3s',
    },
    filterContainer: {
      width: '90%',
      maxWidth: '1200px',
      margin: '0 auto 10px',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    filterBox: {
      backgroundColor: darkMode ? '#1e2a3a' : 'white',
      color: darkMode ? 'white' : 'black',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: darkMode ? '0 0 15px rgba(255,255,255,0.1)' : '0 0 15px rgba(0,0,0,0.1)',
      width: '400px',
      transition: 'all 0.3s ease',
    },
    filterLabel: {
      display: 'block',
      marginBottom: '5px',
      color: darkMode ? 'white' : 'black',
    },
    filterInput: {
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : 'white',
      color: darkMode ? 'white' : 'black',
    },
    button: {
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      flex: 1,
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
    },
    mapWrapper: {
      height: '700px',
      width: '90%',
      maxWidth: '1200px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 15px rgba(0,0,0,0.1)',
      margin: '0 auto',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      backgroundColor: darkMode ? '#1e2a3a' : 'white',
      color: darkMode ? 'white' : 'black',
    },
    countText: {
      width: '90%',
      maxWidth: '1200px',
      margin: '10px auto',
      textAlign: 'right',
      color: darkMode ? 'white' : 'black',
    },
    popupContent: {
      color: darkMode ? 'white' : 'black',
      margin: 0,
    },
    popupTitle: {
      marginTop: 0,
      color: darkMode ? 'white' : 'black',
    },
    errorMessage: {
      color: '#DE6A6A',
      fontSize: '14px',
      marginTop: '5px',
      display: 'block',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Global Distribution and Org Status Overview</h1>

      <div style={styles.filterContainer}>
        <div style={styles.filterBox}>
          <h3 style={{ color: darkMode ? 'white' : 'black', marginTop: 0 }}>
            Filter Projects between Dates
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.filterLabel}>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.filterLabel}>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>
          {errMsg && <span style={styles.errorMessage}>{errMsg}</span>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={applyDateFilters}
              style={{
                ...styles.button,
                backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50',
                color: darkMode ? '#0d1b2a' : 'white',
              }}
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              style={{
                ...styles.button,
                backgroundColor: darkMode ? '#DE6A6A' : '#f44336',
                color: darkMode ? '#0d1b2a' : 'white',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div style={styles.mapWrapper}>
        {loading ? (
          <div style={styles.loadingContainer}>Loading map data...</div>
        ) : (
          <MapContainer
            key={mapKey}
            center={[51.505, -0.09]}
            zoom={3}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
            noWrap={true}
            worldCopyJump={false}
            maxBounds={[
              [-85, -180],
              [85, 180],
            ]}
            maxBoundsViscosity={1.0}
          >
            <MapThemeUpdater darkMode={darkMode} />
            <TileLayer
              url={
                darkMode
                  ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              noWrap={true}
            />
            <Legend />
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
                <Tooltip className={darkMode ? 'dark-mode-tooltip' : ''} permanent={false}>
                  Click for {org.name} details
                </Tooltip>
                <Popup className={darkMode ? 'dark-mode-popup' : ''}>
                  <div
                    style={{
                      color: darkMode ? 'white' : '#222',
                      backgroundColor: 'transparent',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    <h3 style={{ marginTop: 0, color: 'inherit' }}>{org.name}</h3>
                    <p>Org ID: {org.orgId}</p>
                    <p>Status: {org.status}</p>
                    <p>Country: {org.country}</p>
                    <p>Start Date: {new Date(org.startDate).toLocaleDateString()}</p>
                    <button
                      style={{
                        backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50',
                        color: darkMode ? '#0d1b2a' : 'white',
                        padding: '5px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '10px',
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>

      <div style={styles.countText}>
        Showing {filteredOrgs.length} of {orgs.length} projects
      </div>
    </div>
  );
}

export default InteractiveMap;
