import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Loading from '~/components/common/Loading';

const volunteerColors = {
  active: '#4CAF50',
};

const LIGHT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const LIGHT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const DARK_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>';

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
    return undefined;
  }, [points, map]);

  return null;
}

function GlobalVolunteerMap({ locations = [], isLoading, darkMode = false, error }) {
  const normalizedLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];

    return locations
      .map(location => {
        const lat = location?._id?.lat ?? location?.lat ?? location?.latitude;
        const lng = location?._id?.lng ?? location?.lng ?? location?.longitude;
        const count = Number(location?.count || 1);

        return {
          lat: Number(lat),
          lng: Number(lng),
          count,
        };
      })
      .filter(
        item =>
          !Number.isNaN(item.lat) &&
          !Number.isNaN(item.lng) &&
          item.lat >= -90 &&
          item.lat <= 90 &&
          item.lng >= -180 &&
          item.lng <= 180,
      );
  }, [locations]);

  const heatMapPoints = useMemo(
    () => normalizedLocations.map(location => [location.lat, location.lng, location.count]),
    [normalizedLocations],
  );

  const containerStyle = {
    height: '500px',
    border: `1px solid ${darkMode ? '#334155' : '#ddd'}`,
    borderRadius: '8px',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#e2e8f0' : '#333',
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '300px' }}
      >
        <div className="w-100">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="error-container text-center p-4 d-flex justify-content-center align-items-center"
        style={containerStyle}
      >
        <p className="m-0">Error loading map data</p>
      </div>
    );
  }

  if (!normalizedLocations.length) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={containerStyle}>
        <p className="m-0">No volunteer location data available</p>
      </div>
    );
  }

  return (
    <div className={`map-container ${darkMode ? 'dark-mode' : ''}`} style={{ marginTop: '20px' }}>
      {/* Dark theme styles for Leaflet attribution badge & controls */}
      {darkMode && (
        <style>{`
          .map-container.dark-mode .leaflet-control-attribution {
            background-color: #1e293b !important;
            color: #94a3b8 !important;
          }
          .map-container.dark-mode .leaflet-control-attribution a {
            color: #cbd5e1 !important;
          }
        `}</style>
      )}

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        scrollWheelZoom
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '8px',
          backgroundColor: darkMode ? '#1e293b' : '#f8f9fa',
        }}
      >
        <TileLayer
          key={darkMode ? 'dark-tiles' : 'light-tiles'}
          url={darkMode ? DARK_TILE_URL : LIGHT_TILE_URL}
          attribution={darkMode ? DARK_TILE_ATTRIBUTION : LIGHT_TILE_ATTRIBUTION}
        />
        <HeatMap points={heatMapPoints} />

        {normalizedLocations.map((location, index) => (
          <CircleMarker
            key={`${location.lat}-${location.lng}-${index}`}
            center={[location.lat, location.lng]}
            radius={Math.min(10, Math.max(4, location.count))}
            pathOptions={{
              color: volunteerColors.active,
              fillColor: volunteerColors.active,
              fillOpacity: 0.85,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

HeatMap.propTypes = {
  points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

GlobalVolunteerMap.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
      }),
      lat: PropTypes.number,
      lng: PropTypes.number,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      count: PropTypes.number,
      status: PropTypes.string,
    }),
  ),
  isLoading: PropTypes.bool,
  darkMode: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.bool]),
};

export default GlobalVolunteerMap;
