/* eslint-disable */
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import L from 'leaflet';
import { ENDPOINTS } from '../../../utils/URL';

// Enhanced legend with better styling
function Legend() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');

      // Enhanced styling for better visibility
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      div.style.padding = '12px 15px';
      div.style.borderRadius = '8px';
      div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      div.style.border = '1px solid #ccc';
      div.style.fontSize = '14px';
      div.style.fontFamily = 'Arial, sans-serif';
      div.style.minWidth = '160px';

      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      const labels = ['Active - Red', 'Delayed - Yellow', 'Completed - Blue'];

      div.innerHTML =
        '<div style="color: #333; font-weight: bold; margin-bottom: 8px; font-size: 16px;">Project Status</div>';

      statuses.forEach((status, i) => {
        div.innerHTML +=
          `<div style="display: flex; align-items: center; margin-bottom: 6px;">` +
          `<div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${colors[i]}; margin-right: 10px; border: 1px solid #333;"></div>` +
          `<span style="text-transform: capitalize; color: #333; font-weight: 500;">${labels[i]}</span>` +
          `</div>`;
      });
      return div;
    };
    legend.addTo(map);
    // clean function, rmv legend when component unmounts
    return () => {
      legend.remove();
    };
  }, [map]);
  return null;
}

function EmbedInteractiveMap() {
  const history = useHistory();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredOrg, setHoveredOrg] = useState(null);

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
        return '#CCCCCC';
    }
  };

  // fetch projects/orgs
  const fetchOrgs = async () => {
    try {
      // Try to fetch projects with location first (for when backend implements it)
      // Fall back to organizations if projects endpoint isn't ready
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch (projectError) {
        // Fallback to organization data for now
        console.log('Projects with location endpoint not available, using organization data');
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = response.data.data || [];
      setOrgs(data);
      return data;
    } catch (error) {
      console.error('Error fetching project/org data:', error);
      return [];
    } finally {
      setLoading(false);
    }
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
      }}
    >
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
        <TileLayer
          noWrap={false}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                <div style={{ fontSize: '12px' }}>
                  Click here to View Project #{org.orgId} details
                </div>
              </Tooltip>
              <Popup>
                <div style={{ fontSize: '12px' }}>
                  <h4>Project #{org.orgId}</h4>
                  <p>Name: {org.name}</p>
                  <p>Status: {org.status}</p>
                  <p>Country: {org.country}</p>
                  <button
                    type="button"
                    onClick={() => handleProjectClick(org)}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    View Details
                  </button>
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
