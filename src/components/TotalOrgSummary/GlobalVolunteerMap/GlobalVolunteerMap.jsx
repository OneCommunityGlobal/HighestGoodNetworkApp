/* eslint-disable react/no-array-index-key */
import { useEffect, useMemo } from 'react';
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
    if (!map || !points.length) return undefined;

    const heatLayer = L.heatLayer(points, {
      radius: 20,
      blur: 20,
      maxZoom: 4,
      gradient: {
        0.2: '#00f',
        0.4: '#0f0',
        0.6: '#ff0',
        0.8: '#ffa500',
        1.0: '#f00',
      },
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

function GlobalVolunteerMap({ locations = [], isLoading, error }) {
  /**
   * Normalize backend response safely
   */
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

  /**
   * Build heatmap points
   */
  const heatMapPoints = useMemo(
    () => normalizedLocations.map(location => [location.lat, location.lng, location.count]),
    [normalizedLocations],
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center p-4">
        <p>Error loading map data</p>
      </div>
    );
  }

  if (!normalizedLocations.length) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          height: '500px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <p>No volunteer location data available</p>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ marginTop: '20px' }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '8px',
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
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
              fillOpacity: 0.7,
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default GlobalVolunteerMap;
