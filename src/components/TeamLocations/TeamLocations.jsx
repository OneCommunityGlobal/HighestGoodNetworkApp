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

  // Get an array of all users' non-null countries (some locations may not be associated with a country)
  const countries = userProfiles.map(user => user.location.country).filter(country => country);
  // Get the number of unique countries
  const totalUniqueCountries = [...new Set(countries)].length;
  // Filters out users that don't have locations specified
  const usersWithValidLocations = userProfiles.filter(profile => profile.location.raw);

  return (
    <>
      <div>Total Countries: {totalUniqueCountries}</div>
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
          {usersWithValidLocations.map(profile => {
            return (
              <CircleMarker
                center={[profile.location.coords.lat, profile.location.coords.lng]}
                key={profile._id}
                color={profile.isActive ? 'green' : 'gray'}
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
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </>
  );
};

export default TeamLocations;
