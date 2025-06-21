/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './InteractiveMap.css';

// dark mode
function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  
  useEffect(() => {
    // redraw for dark mode map
    map.invalidateSize();
    
    //add or remove dark mode class
    const container = map.getContainer();
    if (darkMode) {
      container.classList.add('dark-mode-map');
    } else {
      container.classList.remove('dark-mode-map');
    }
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
      div.style.boxShadow = darkMode ? '0 0 15px rgba(255,255,255,0.1)' : '0 0 15px rgba(0,0,0,0.2)';
      
      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      
      div.innerHTML = `<h4 style="margin-top: 0; margin-bottom: 5px; color: ${darkMode ? 'white' : 'black'}">Project Status</h4>`;
      
      for (let i = 0; i < statuses.length; i++) {
        div.innerHTML +=
          `${'<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
            '<div style="width: 12px; height: 12px; border-radius: 50%; background-color: '}${
            colors[i]
          }; margin-right: 8px;"></div>` +
          `<span style="text-transform: capitalize; color: ${darkMode ? 'white' : 'black'}">${statuses[i]}</span>` +
          `</div>`;
      }
      return div;
    };
    
    // Add the legend to the map
    legend.addTo(map);
    
    return () => {
      legend.remove();
    };
  }, [map, darkMode]);
  
  return null;
}

function InteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrg, setHoveredOrg] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapKey, setMapKey] = useState(0); 
  
  // update map for dark mode
  useEffect(() => {
    setMapKey(prevKey => prevKey + 1);
  }, [darkMode]);
  
  // status color: active, delayed, completed
  const getStatusColor = status => {
    switch (status.toLowerCase()) {
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
  
  // fetch orgs
  const fetchOrgs = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      const data = response.data.data || [];
      setOrgs(data);
      setFilteredOrgs(data);
      return data;
    } catch (error) {
      console.error('Error fetching orgs: ', error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Apply date filters
  const applyDateFilters = () => {
    let filtered = [...orgs];
    if (startDate) {
      const startDateFilter = new Date(startDate);
      filtered = filtered.filter(org => {
        const orgStartDate = new Date(org.startDate);
        return orgStartDate >= startDateFilter;
      });
    }
    if (endDate) {
      const endDateFilter = new Date(endDate);
      filtered = filtered.filter(org => {
        const orgStartDate = new Date(org.startDate);
        return orgStartDate <= endDateFilter;
      });
    }
    setFilteredOrgs(filtered);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilteredOrgs(orgs);
  };
  
  useEffect(() => {
    fetchOrgs();
  }, []);
  
  // Dark mode styles
  const styles = {
    container: {
      color: darkMode ? 'white' : 'black',
      backgroundColor: darkMode ? '#0d1b2a' : 'white', // Dark blue background
      transition: 'background-color 0.3s, color 0.3s',
      padding: '20px',
    },
    title: {
      paddingBottom: '20px',
      color: darkMode ? 'white' : 'black',
      transition: 'color 0.3s',
    },
    filterContainer: {
      position: 'relative',
      width: '90%',
      maxWidth: '1200px',
      margin: '0 auto 10px auto',
      display: 'flex',
      justifyContent: 'flex-end',
    },
    filterBox: {
      backgroundColor: darkMode ? '#1e2a3a' : 'white', // Slightly lighter dark blue
      color: darkMode ? 'white' : 'black',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: darkMode ? '0 0 15px rgba(255,255,255,0.1)' : '0 0 15px rgba(0,0,0,0.1)',
      width: '400px',
      transition: 'background-color 0.3s, color 0.3s, box-shadow 0.3s',
    },
    filterTitle: {
      fontSize: '15px',
      color: darkMode ? 'white' : 'black',
      transition: 'color 0.3s',
    },
    filterControls: {
      display: 'flex',
      gap: '10px',
      marginBottom: '10px',
    },
    filterLabel: {
      display: 'block',
      marginBottom: '5px',
      fontSize: '14px',
      color: darkMode ? 'white' : 'black',
      transition: 'color 0.3s',
    },
    filterInput: {
      width: '100%',
      padding: '8px',
      borderRadius: '4px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : 'white',
      color: darkMode ? 'white' : 'black',
      transition: 'background-color 0.3s, color 0.3s, border 0.3s',
    },
    applyButton: {
      backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50', 
      color: darkMode ? '#0d1b2a' : 'white',
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      flex: 1,
      transition: 'background-color 0.3s, color 0.3s',
      fontWeight: 'bold',
    },
    resetButton: {
      backgroundColor: darkMode ? '#DE6A6A' : '#f44336',
      color: darkMode ? '#0d1b2a' : 'white',
      padding: '8px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      flex: 1,
      transition: 'background-color 0.3s, color 0.3s',
      fontWeight: 'bold',
    },
    mapContainer: {
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },
    mapWrapper: {
      height: '700px',
      width: '90%',
      maxWidth: '1200px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: darkMode ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 15px rgba(0,0,0,0.1)',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#1e2a3a' : 'white',
      color: darkMode ? 'white' : 'black',
      transition: 'background-color 0.3s, color 0.3s, border 0.3s',
      borderRadius: '8px',
    },
    map: {
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      height: '100%',
      width: '100%',
      transition: 'border 0.3s',
    },
    countText: {
      width: '90%',
      maxWidth: '1200px',
      margin: '10px auto',
      textAlign: 'right',
      color: darkMode ? 'white' : 'black',
      transition: 'color 0.3s',
    },
    popupContent: {
      backgroundColor: darkMode ? '#1e2a3a' : 'white',
      color: darkMode ? 'white' : 'black',
      padding: '5px',
      borderRadius: '4px',
    },
    popupButton: {
      backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50',
      color: darkMode ? '#0d1b2a' : 'white',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    tooltip: {
      backgroundColor: darkMode ? '#1e2a3a' : 'white',
      color: darkMode ? 'white' : 'black',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
    }
  };

  const popupClassName = darkMode ? 'dark-mode-popup' : '';
  const tooltipClassName = darkMode ? 'dark-mode-tooltip' : '';

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Global Distribution and Org Status Overview</h1>
      <div style={styles.filterContainer}>
        <div style={styles.filterBox}>
          <h3 style={styles.filterTitle}>Filter Projects between Dates</h3>
          <div style={styles.filterControls}>
            <div style={{ flex: 1 }}>
              <label style={styles.filterLabel}>
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.filterLabel}>
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={applyDateFilters}
              style={styles.applyButton}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              style={styles.resetButton}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div style={styles.mapContainer}>
        <div style={styles.mapWrapper}>
          {loading ? (
            <div style={styles.loadingContainer}>
              Loading map data...
            </div>
          ) : (
            <MapContainer
              key={mapKey} 
              center={[51.505, -0.09]}
              maxBounds={[
                [-90, -225],
                [90, 225],
              ]}
              maxBoundsViscosity={1.0}
              zoom={3}
              scrollWheelZoom
              style={styles.map}
            >
              <MapThemeUpdater darkMode={darkMode} />
              <TileLayer
                noWrap
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={darkMode 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                minZoom={2}
                maxZoom={15}
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
                  eventHandlers={{
                    mouseover: () => {
                      setHoveredOrg(org);
                    },
                    mouseout: () => {
                      setHoveredOrg(null);
                    },
                  }}
                  >
                    <Tooltip 
                      direction="top" 
                      offset={[0, -10]} 
                      opacity={1} 
                      permanent={false}
                      className={tooltipClassName}
                    >
                      <div>Click here to view Organization {org.orgId} details</div>
                    </Tooltip>
                    <Popup className={popupClassName}>
                      <div style={styles.popupContent}>
                        <h3>{org.name}</h3>
                        <p>Org ID: {org.orgId}</p>
                        <p>Status: {org.status}</p>
                        <p>Country: {org.country}</p>
                        <p>Start Date: {new Date(org.startDate).toLocaleDateString()}</p>
                        <button
                          type="button"
                          // onClick={() => console.log('Clicked on org:', org)}
                          style={styles.popupButton}
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
        </div>
        <div style={styles.countText}>
          Showing {filteredOrgs.length} of {orgs.length} projects
        </div>
      </div>
    );
  }
  
  export default InteractiveMap;
  