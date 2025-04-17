/* eslint-disable */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function Legend() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'white';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      div.innerHTML = '<h4 style="margin-top: 0; margin-bottom: 5px;">Project Status</h4>';
      for (let i = 0; i < statuses.length; i++) {
        div.innerHTML +=
          `${'<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
            '<div style="width: 12px; height: 12px; border-radius: 50%; background-color: '}${
            colors[i]
          }; margin-right: 8px;"></div>` +
          `<span style="text-transform: capitalize;">${statuses[i]}</span>` +
          `</div>`;
      }

      return div;
    };

    // Add the legend to the map
    legend.addTo(map);

    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
}

function InteractiveMap() {
  const [orgs, setOrgs] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrg, setHoveredOrg] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  return (
    <div>
      <h1 style={{ paddingBottom: '20px' }}>Global Distribution and Org Status Overview</h1>
      <div
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '1200px',
          margin: '0 auto 10px auto',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '5px',
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            width: '400px',
          }}
        >
          <h3 style={{ fontSize: '15px' }}>Filter Projects between Dates</h3>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                End Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={applyDateFilters}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '8px 15px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '700px',
            width: '90%',
            maxWidth: '1200px',
          }}
        >
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                border: '1px solid grey',
              }}
            >
              Loading map data...
            </div>
          ) : (
            <MapContainer
              center={[51.505, -0.09]}
              maxBounds={[
                [-90, -225],
                [90, 225],
              ]}
              maxBoundsViscosity={1.0}
              zoom={3}
              scrollWheelZoom
              style={{
                border: '1px solid grey',
                height: '100%',
                width: '100%',
              }}
            >
              <TileLayer
                noWrap
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                  <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                    <div>Click here to view Organization {org.orgId} details</div>
                  </Tooltip>
                  <Popup>
                    <div>
                      <h3>{org.name}</h3>
                      <p>Org ID: {org.orgId}</p>
                      <p>Status: {org.status}</p>
                      <p>Country: {org.country}</p>
                      <p>Start Date: {new Date(org.startDate).toLocaleDateString()}</p>
                      <button
                        type="button"
                        // onClick={() => console.log('Clicked on org:', org)}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          padding: '5px 10px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
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
      </div>
      <div
        style={{
          width: '90%',
          maxWidth: '1200px',
          margin: '10px auto',
          textAlign: 'right',
        }}
      >
        Showing {filteredOrgs.length} of {orgs.length} projects
      </div>
    </div>
  );
}

export default InteractiveMap;
