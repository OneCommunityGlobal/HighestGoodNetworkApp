/* eslint-disable */
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { ENDPOINTS } from '../../../utils/URL';

// legend added
function Legend() {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const statuses = ['active', 'delayed', 'completed'];
      const colors = ['#DE6A6A', '#E3D270', '#6ACFDE'];
      div.innerHTML += '<div style="color: black; font-size: 25px;">Project Distribution</div>';

      statuses.forEach((status, i) => {
        div.innerHTML +=
          `${'<div style="display: flex; align-items: center; margin-bottom: 5px;">' +
            '<div style="width: 12px; height: 12px; border-radius: 50%; background-color: '}${
            colors[i]
          }; margin-right: 8px;"></div>` +
          `<span style="text-transform: capitalize;">${status}</span>` +
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

  // fetch orgs
  const fetchOrgs = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      setOrgs(response.data.data || []);
      return response.data.data || [];
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
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
                {org.name} - {org.status}
              </div>
            </Tooltip>
            <Popup>
              <div style={{ fontSize: '12px' }}>
                <h4>{org.name}</h4>
                <p>Status: {org.status}</p>
                <p>Country: {org.country}</p>
                <button
                  type="button"
                  /** onClick={() => console.log('Clicked on org:', org)} * */
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
      </MapContainer>
    </div>
  );
}

export default EmbedInteractiveMap;
