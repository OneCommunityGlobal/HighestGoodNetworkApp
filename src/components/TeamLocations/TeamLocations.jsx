import React from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import mockAPIResponse from './mockData';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import './TeamLocations.css';

const TeamLocations = () => {
  const [userProfiles, setUserProfiles] = useState([]);

  useEffect(() => {
    async function getUserProfiles() {
      const users = mockAPIResponse; // await axios.get(ENDPOINTS.USER_PROFILES);
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
          if (profile.location.raw) {
            return (
              <CircleMarker
                center={[profile.location.coords.lat, profile.location.coords.lng]}
                key={profile._id}
              >
                <Popup>
                  <div>
                    <div>{`Name: ${profile.firstName} ${profile.lastName}`}</div>
                    <div>{`Title: ${profile.jobTitle}`}</div>
                    <div>{`Location: ${profile.location.raw}`}</div>
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
