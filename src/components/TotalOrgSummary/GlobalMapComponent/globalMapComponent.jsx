// eslint-disable-next-line no-unused-vars
import React, { useReducer, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  try {
    const response = await axios.get(ENDPOINTS.TOTAL_ORG_SUMMARY(startDate, endDate));
    dispatch({ type: 'FETCH_SUCCESS', payload: response.data.userLocations });
  } catch (error) {
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

      // Cleanup function to remove the heat layer when the component unmounts or dependencies change
      return () => {
        map.removeLayer(heat);
      };
    }

    // If no points are present, return nothing explicitly
    return undefined;
  }, [points, map]);

  return null;
}

function MapComponent({ startDate, endDate }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { userLocations, loading, error } = state;
  const [isMapVisible, setIsMapVisible] = useState(false);

  useEffect(() => {
    fetchUserLocations(dispatch, startDate, endDate);
  }, [startDate, endDate]);

  const toggleMapVisibility = () => {
    const nextMapVisibility = !isMapVisible;
    setIsMapVisible(nextMapVisibility);
    if (nextMapVisibility) {
      toast.info('This map displays only active volunteers.');
    }
  };

  useEffect(() => {
    toggleMapVisibility();
  }, []); // Automatically triggers map visibility when component mounts

  const heatMapPoints = userLocations.map(location => [
    location._id.lat,
    location._id.lng,
    location.count, // Assuming 'count' represents the number of volunteers
  ]);

  return (
    <div>
      {isMapVisible && (
        <div>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          <MapContainer
            center={[37.7749, -122.4194]}
            zoom={5}
            style={{ height: '100vh', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <HeatMap points={heatMapPoints} />
          </MapContainer>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default MapComponent;
