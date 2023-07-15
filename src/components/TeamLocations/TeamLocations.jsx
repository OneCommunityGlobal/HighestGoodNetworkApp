import React from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { getUserTimeZone } from 'services/timezoneApiService';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import './TeamLocations.css';
const TeamLocations = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const geocodeAPIKey = useSelector(state => state.timeZoneAPI.userAPIKey);

  useEffect(() => {
    if (!localStorage.getItem('teamLocations')) {
      localStorage.setItem('teamLocations', '{}');
    }
    async function getUserProfiles() {
      const users = await axios.get(ENDPOINTS.USER_PROFILES);
      const cachedLocations = JSON.parse(localStorage.getItem('teamLocations', '{}'));
      for (let i = 0; i < users.data.length; i++) {
        if (users.data[i].location === '' || !users.data[i].location) {
          continue;
        }
        if (users.data[i].location in cachedLocations) {
          users.data[i].locationLatLng = cachedLocations[users.data[i].location];
        } else {
          const response = await getUserTimeZone(users.data[i].location, geocodeAPIKey);
          if (response.data.total_results) {
            users.data[i].locationLatLng = response.data.results[0].geometry;
            cachedLocations[users.data[i].location] = response.data.results[0].geometry;
          } else {
            users.data[i].locationLatLng = null;
            cachedLocations[users.data[i].location] = null;
          }
        }
      }
      localStorage.setItem('teamLocations', JSON.stringify(cachedLocations));
      setUserProfiles(users.data);
    }
    getUserProfiles();
  }, []);

  // We don't need the back to top button on this page
  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    backToTopButton.style.display = 'none';
    return () => {
      backToTopButton.style.display = 'block';
    };
  }, []);

  return (
    <MapContainer
      center={[51.505, -0.09]}
      maxBounds={[
        [-90, -225],
        [90, 225],
      ]}
      maxBoundsViscosity={1.0}
      zoom={3}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        minZoom={2}
        maxZoom={15}
      />
      <MarkerClusterGroup chunkedLoading>
        {userProfiles.map(profile => {
          if (profile.locationLatLng) {
            return (
              <CircleMarker
                center={[profile.locationLatLng.lat, profile.locationLatLng.lng]}
                key={profile._id}
              >
                <Popup>
                  <div>
                    <div>{`Name: ${profile.firstName} ${profile.lastName}`}</div>
                    <div>{`Title: ${profile.jobTitle}`}</div>
                    <div>{`Location: ${profile.location}`}</div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default TeamLocations;
