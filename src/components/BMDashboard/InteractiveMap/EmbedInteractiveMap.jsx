/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import { ENDPOINTS } from '../../../utils/URL';

/* -----------------------------------------------------
   THEME UPDATER FOR EMBED
----------------------------------------------------- */
function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();

    const container = map.getContainer();
    container.classList.remove('dark-mode-map', 'light-mode-map');
    container.classList.add(darkMode ? 'dark-mode-map' : 'light-mode-map');

    // Update popups and tooltips
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
   LEGEND FOR EMBED
----------------------------------------------------- */
function Legend() {
  const map = useMap();
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');

      // Enhanced styling for better visibility
      div.style.backgroundColor = darkMode ? 'rgba(30, 42, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)';
      div.style.color = darkMode ? 'white' : '#222';
      div.style.padding = '12px 15px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = darkMode ? '0 4px 15px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.15)';
      div.style.border = darkMode ? '1px solid #3a506b' : '1px solid #ccc';
      div.style.fontSize = '14px';
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.minWidth = '160px';
      div.style.backdropFilter = 'blur(10px)';

      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      const labels = ['Active - Red', 'Delayed - Yellow', 'Completed - Blue'];

      div.innerHTML = `<div style="color: ${
        darkMode ? 'white' : '#333'
      }; font-weight: bold; margin-bottom: 8px; font-size: 16px;">Project Status</div>`;

      statuses.forEach((status, i) => {
        div.innerHTML +=
          `<div style="display: flex; align-items: center; margin-bottom: 6px;">` +
          `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${
            colors[i]
          }; margin-right: 10px; border: ${
            darkMode ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333'
          };"></div>` +
          `<span style="text-transform: capitalize; color: ${
            darkMode ? 'white' : '#333'
          }; font-weight: 500;">${labels[i]}</span>` +
          `</div>`;
      });
      return div;
    };
    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map, darkMode]);
  return null;
}

/* -----------------------------------------------------
   EMBED INTERACTIVE MAP
----------------------------------------------------- */
function EmbedInteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // status color: active, delayed, completed
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#DE6A6A';
      case 'delayed':
        return '#E3D270';
      case 'completed':
        return '#6ACFDE';
      default:
        return '#CCCCCC';
    }
  };

  // fetch projects/orgs
  const fetchOrgs = async () => {
    try {
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch (projectError) {
        // Fallback to organization data for now
        console.log('Projects with location endpoint not available, using organization data');
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = response.data.data || [];

      // If no data from backend, use pseudo data
      if (data.length === 0) {
        console.log('No data from backend, using pseudo data');
        const pseudoData = getPseudoOrgs();
        setOrgs(pseudoData);
      } else {
        setOrgs(data);
      }
      return data;
    } catch (error) {
      console.error('Error fetching project/org data:', error);
      // If fetch fails, use pseudo data
      const pseudoData = getPseudoOrgs();
      setOrgs(pseudoData);
      return [];
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

  const handleProjectClick = org => {
    // Navigate to project details page
    history.push(`/bmdashboard/projects/${org.orgId}`);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: darkMode ? '#0d1b2a' : 'white',
      }}
    >
      {/* Project counter for embed version */}
      <div
        style={{
          position: 'absolute',
          left: '15px',
          top: '15px',
          padding: '8px 12px',
          background: darkMode ? 'rgba(30, 42, 58, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '6px',
          fontSize: '13px',
          backdropFilter: 'blur(10px)',
          color: darkMode ? 'white' : '#222',
          border: darkMode ? '1px solid #3a506b' : '1px solid rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontWeight: '500',
        }}
      >
        Showing {orgs.length} projects
      </div>

      <MapContainer
        center={[20, 0]}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        zoom={1}
        minZoom={1}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
        worldCopyJump
      >
        <MapThemeUpdater darkMode={darkMode} />

        <TileLayer
          noWrap={false}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            darkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          minZoom={1}
          maxZoom={15}
        />

        <Legend />

        <MarkerClusterGroup
          disableClusteringAtZoom={13}
          spiderfyOnMaxZoom={true}
          chunkedLoading={true}
          maxClusterRadius={80}
        >
          {orgs.map((org, index) => (
            <CircleMarker
              key={org.orgId || index}
              center={[org.latitude, org.longitude]}
              radius={6}
              pathOptions={{
                fillColor: getStatusColor(org.status),
                fillOpacity: 0.8,
                color: darkMode ? '#1e2a3a' : 'white',
                weight: 1,
              }}
            >
              <Tooltip
                className={darkMode ? 'dark-mode-tooltip' : 'light-mode-tooltip'}
                direction="top"
                offset={[0, -10]}
                opacity={1}
                permanent={false}
              >
                <div style={{ fontSize: '11px', textAlign: 'center' }}>Project #{org.orgId}</div>
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
    </div>
  );
}

export default EmbedInteractiveMap;
