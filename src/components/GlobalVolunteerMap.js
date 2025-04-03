import React, { useReducer, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CircleMarker } from 'react-leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Volunteer color mapping based on status
const volunteerColors = {
  active: '#4CAF50', // Green
};


function HeatMap({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const heat = L.heatLayer(points, {
        radius: 20,
        blur: 20,
        maxZoom: 2,
        gradient: {
          0.4: '#00f',
          0.6: '#0f0',
          0.7: '#ff0',
          0.8: '#ffa500',
          1.0: '#f00',
        },
      }).addTo(map);

      return () => {
        map.removeLayer(heat);
      };
    }
  }, [points, map]);

  return null;
}

function MapComponent({ locations, isLoading, error }) {
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    setIsMapVisible(true);
    toast.info('This map displays only active volunteers.');
  }, []);

  const heatMapPoints = locations.map(location => [
    location._id.lat,
    location._id.lng,
    location.count,
  ]);

  const activeVolunteers = locations.filter(v => v.status === 'active');

  return (
    <div className="map-container">
      {isMapVisible && (
        <>
          {isLoading && <p>Loading...</p>}
          {error && (
            <div className="error-container">
              <p>Error: {error}</p>
              <button onClick={() => fetchUserLocations(dispatch, defaultStart, defaultEnd)}>Retry</button>
            </div>
          )}
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <HeatMap points={heatMapPoints} />
            {activeVolunteers.length > 0 &&
              activeVolunteers.map((volunteer, index) => (
                <CircleMarker
                  key={`active-${index}`}
                  center={[volunteer._id.lat, volunteer._id.lng]}
                  radius={8}
                  pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.8 }}
                />
              ))}
          </MapContainer>
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default MapComponent;
