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

/* -----------------------------------------------------
   THEME UPDATER
----------------------------------------------------- */
function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();

    const container = map.getContainer();

    // Remove both classes first, then add the correct one
    container.classList.remove('dark-mode-map', 'light-mode-map');
    container.classList.add(darkMode ? 'dark-mode-map' : 'light-mode-map');

    // Update popups and tooltips with proper class management
    map.eachLayer(layer => {
      if (layer.getPopup) {
        const popup = layer.getPopup();
        if (popup) {
          const popupElement = popup.getElement();
          if (popupElement) {
            popupElement.classList.remove('dark-mode-popup', 'light-mode-popup');
            popupElement.classList.add(darkMode ? 'dark-mode-popup' : 'light-mode-popup');

            // Hide the popup tip/arrow
            const tip = popupElement.querySelector('.leaflet-popup-tip');
            if (tip) {
              tip.style.display = 'none';
            }
          }
        }
      }

      if (layer.getTooltip) {
        const tooltip = layer.getTooltip();
        if (tooltip) {
          const tooltipElement = tooltip.getElement();
          if (tooltipElement) {
            tooltipElement.classList.remove('dark-mode-tooltip', 'light-mode-tooltip');
            tooltipElement.classList.add(darkMode ? 'dark-mode-tooltip' : 'light-mode-tooltip');
          }
        }
      }
    });
  }, [darkMode, map]);
  return null;
}

/* -----------------------------------------------------
   LEGEND (BOTTOM-RIGHT, SAFE MARGINS)
----------------------------------------------------- */
function Legend() {
  const map = useMap();
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.transform = 'translate(-5px, -50px)';
      div.style.backgroundColor = darkMode ? '#1e2a3a' : 'white';
      div.style.color = darkMode ? 'white' : '#222';
      div.style.padding = '12px 15px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = darkMode ? '0 4px 15px rgba(0,0,0,0.6)' : '0 4px 15px rgba(0,0,0,0.15)';
      div.style.border = darkMode ? '1px solid #3a506b' : '1px solid #ddd';
      div.style.fontSize = '14px';
      div.style.fontWeight = '500';
      div.style.backdropFilter = 'blur(10px)';
      div.style.position = 'relative';
      div.style.zIndex = 1000;

      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];

      div.innerHTML = `
      <h4 style="margin:0 0 10px;font-size:15px;font-weight:600;color:${
        darkMode ? 'white' : '#222'
      };">Project Status</h4>
      ${statuses
        .map(
          (s, i) => `
        <div style="display:flex;align-items:center;margin-bottom:8px;">
          <span style="
            width:14px;height:14px;border-radius:50%;
            background:${colors[i]};
            margin-right:10px;
            border: ${darkMode ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.2)'};
          "></span>
          <span style="color:${darkMode ? 'white' : '#222'};text-transform:capitalize;">${s}</span>
        </div>`,
        )
        .join('')}
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
     COLORS
  ----------------------------------------- */
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
        const pseudoData = getPseudoOrgs();
        setOrgs(pseudoData);
        setFilteredOrgs(pseudoData);
      } else {
        setOrgs(data);
        setFilteredOrgs(data);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      // If fetch fails, use pseudo data
      const pseudoData = getPseudoOrgs();
      setOrgs(pseudoData);
      setFilteredOrgs(pseudoData);
    } finally {
      setLoading(false);
    }
  };

  // Pseudo test data function
  const getPseudoOrgs = () => {
    return [
      {
        orgId: 9991,
        name: 'Test Project Alpha',
        status: 'active',
        country: 'United States',
        latitude: 34.1185,
        longitude: -118.0743,
        startDate: '2025-11-01',
        remark: 'This is a remark for Project Alpha.',
      },
      {
        orgId: 9992,
        name: 'Test Project Beta',
        status: 'completed',
        country: 'Germany',
        latitude: 52.52,
        longitude: 13.405,
        startDate: '2023-12-10',
        endDate: '2024-12-10',
        remark: 'Beta testing completed successfully.',
      },
      {
        orgId: 9993,
        name: 'Test Project Gamma',
        status: 'delayed',
        country: 'Japan',
        latitude: 35.6895,
        longitude: 139.6917,
        startDate: '2025-06-01',
        remark: 'Awaiting equipment shipment.',
      },
    ];
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
     DARK MODE STYLES
  ----------------------------------------- */
  const getStyles = () => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: darkMode ? '#0d1b2a' : 'white',
      color: darkMode ? 'white' : '#222',
    },

    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      gap: '15px',
      flexWrap: 'wrap',
      background: darkMode ? '#1e2a3a' : 'white',
      borderBottom: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
    },

    titleText: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 600,
      color: darkMode ? 'white' : '#222',
    },

    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },

    input: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : 'white',
      color: darkMode ? 'white' : '#222',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },

    applyButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },

    resetButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : '#f5f5f5',
      color: darkMode ? 'white' : '#222',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },

    mapArea: {
      flex: 1,
      position: 'relative',
      borderRadius: '0',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },

    bottomLeftLabel: {
      position: 'absolute',
      left: '15px',
      bottom: '15px',
      padding: '8px 12px',
      background: darkMode ? 'rgba(30, 42, 58, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '6px',
      fontSize: '13px',
      backdropFilter: 'blur(10px)',
      color: darkMode ? 'white' : '#222',
      border: darkMode ? '1px solid #3a506b' : '1px solid rgba(0,0,0,0.1)',
      zIndex: 1000,
      fontWeight: '500',
    },
  });

  const S = getStyles();

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
              {filteredOrgs.map((org, index) => (
                <CircleMarker
                  key={org.orgId || index}
                  center={[org.latitude, org.longitude]}
                  radius={8}
                  pathOptions={{
                    fillColor: getStatusColor(org.status),
                    fillOpacity: 0.9,
                    color: darkMode ? '#1e2a3a' : 'white',
                    weight: 2,
                  }}
                >
                  <Tooltip
                    className={darkMode ? 'dark-mode-tooltip' : 'light-mode-tooltip'}
                    direction="top"
                    offset={[0, -8]}
                    opacity={0.95}
                    permanent={false}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        textAlign: 'center',
                      }}
                    >
                      Project #{org.orgId}
                    </div>
                  </Tooltip>

                  <Popup className={darkMode ? 'dark-mode-popup' : 'light-mode-popup'}>
                    <div
                      style={{
                        minWidth: '200px',
                        color: darkMode ? 'white' : '#222',
                        fontFamily: 'Arial, sans-serif',
                        background: darkMode ? '#2d4059' : 'white',
                        borderRadius: '8px',
                        boxShadow: darkMode
                          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
                          : '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Compact Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '10px',
                          padding: '12px 12px 10px 12px',
                          borderBottom: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
                          background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(org.status),
                            marginRight: '8px',
                            flexShrink: 0,
                          }}
                        ></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              margin: '0 0 2px 0',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: darkMode ? 'white' : '#222',
                              lineHeight: '1.3',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {org.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '11px',
                              color: darkMode ? '#b0b8c4' : '#666',
                              textTransform: 'capitalize',
                            }}
                          >
                            {org.status} • #{org.orgId}
                          </span>
                        </div>
                      </div>

                      {/* Compact Details */}
                      <div style={{ marginBottom: '12px', padding: '0 12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              color: darkMode ? '#b0b8c4' : '#666',
                              fontWeight: '500',
                            }}
                          >
                            Country:
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              color: darkMode ? 'white' : '#222',
                            }}
                          >
                            {org.country}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              color: darkMode ? '#b0b8c4' : '#666',
                              fontWeight: '500',
                            }}
                          >
                            Start:
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '600',
                              color: darkMode ? 'white' : '#222',
                            }}
                          >
                            {new Date(org.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Compact Button */}
                      <div style={{ padding: '0 12px 12px 12px' }}>
                        <button
                          onClick={() => handleProjectClick(org)}
                          style={{
                            width: '100%',
                            backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50',
                            color: 'white',
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                          }}
                          onMouseOver={e => {
                            e.target.style.backgroundColor = darkMode ? '#5abfcc' : '#45a049';
                            e.target.style.transform = 'translateY(-1px)';
                          }}
                          onMouseOut={e => {
                            e.target.style.backgroundColor = darkMode ? '#6ACFDE' : '#4CAF50';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
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
