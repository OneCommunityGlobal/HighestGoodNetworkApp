import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import Loading from '~/components/common/Loading';

const volunteerColors = {
  active: '#4CAF50',
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
    return undefined;
  }, [points, map]);

  return null;
}

function MapComponent({ locations = [], isLoading, error }) {
  const heatMapPoints = (locations || []).map(location => [
    location._id.lat,
    location._id.lng,
    location.count,
  ]);

  const activeVolunteers = (locations || []).filter(v => v.status === 'active');

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ marginTop: '20px' }}>
      {error && (
        <div className="error-container">
          <p>Error: {error}</p>
          <button
            type="button"
            onClick={() => {
              /* Add retry logic here */
            }}
          >
            Retry
          </button>
        </div>
      )}
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <HeatMap points={heatMapPoints} />
        {activeVolunteers.length > 0 &&
          activeVolunteers.map(volunteer => (
            <CircleMarker
              key={`active-${volunteer._id.lat}-${volunteer._id.lng}`}
              center={[volunteer._id.lat, volunteer._id.lng]}
              radius={8}
              pathOptions={{
                color: volunteerColors.active,
                fillColor: volunteerColors.active,
                fillOpacity: 0.8,
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
}

export default MapComponent;
