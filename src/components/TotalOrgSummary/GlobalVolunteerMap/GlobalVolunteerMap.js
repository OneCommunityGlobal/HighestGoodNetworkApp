import React, { useReducer, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { CircleMarker } from 'react-leaflet';
import 'leaflet.heat'
import L from 'leaflet';
import 'leaflet.heat'; // Make sure you have this installed: `npm install leaflet.heat`
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Volunteer color mapping based on status
const volunteerColors = {
  active: '#4CAF50',       // Green
};


const initialState = {
  userLocations: [],
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, userLocations: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const fetchUserLocations = async (dispatch, startDate, endDate) => {
  dispatch({ type: 'FETCH_INIT' });

  // Build the URL manually to avoid sending undefined comparison dates
  const baseUrl = ENDPOINTS.TOTAL_ORG_SUMMARY(startDate, endDate);
  const url = new URL(baseUrl, window.location.origin); // Use base if ENDPOINT returns path only

  // Ensure startDate and endDate are valid
  if (startDate) url.searchParams.set("startDate", startDate);
  if (endDate) url.searchParams.set("endDate", endDate);

  try {
    const response = await axios.get(url.toString());
    dispatch({ type: 'FETCH_SUCCESS', payload: response.data.userLocations });
  } catch (error) {
    console.error("Error fetching volunteer locations:", error.response?.data || error.message);
    dispatch({ type: 'FETCH_FAILURE', payload: error.message });
  }
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

function MapComponent({ startDate, endDate }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { userLocations, loading, error } = state;
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Provide default values if not passed
  const defaultStart = startDate || '2023-01-01';
  const defaultEnd = endDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchUserLocations(dispatch, defaultStart, defaultEnd);
  }, [defaultStart, defaultEnd]);

  useEffect(() => {
    setIsMapVisible(true);
    toast.info('This map displays only active volunteers.');
  }, []);

  const heatMapPoints = userLocations.map(location => [
    location._id.lat,
    location._id.lng,
    location.count,
  ]);
  
  // Separate volunteers by status
const activeVolunteers = userLocations.filter(v => v.status === 'active');


  return (
    <div>
      {isMapVisible && (
        <>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
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
            {/* Active Volunteers - Green */}
{activeVolunteers.map((volunteer, index) => (
  <CircleMarker
    key={`active-${index}`}
    center={[volunteer._id.lat, volunteer._id.lng]}
    radius={8}
    pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.8 }}
  >
  </CircleMarker>
))}

          </MapContainer>
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default MapComponent;
