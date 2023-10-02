import React from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import './TeamLocations.css';
import { Button, Container } from 'reactstrap';

import { boxStyle } from 'styles';
import AddNewUserPopUp from './AddNewUserPopUp';
import { toast } from 'react-toastify';
const priorText = 'Prior to HGN Data Collection';

const TeamLocations = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function getUserProfiles() {
      try {
        const users = await axios.get(ENDPOINTS.USER_PROFILES);
        const validUsers = users.data
          .filter(item => item.location?.country)
          .map(item => ({ ...item, lastName: `${item.lastName[0]}.` }));
        const addedLocations = await axios.get(ENDPOINTS.ALL_MAP_LOCATIONS());

        const others = addedLocations.data.map(item => ({...item, canBeRemoved: true}))
        setUserProfiles([...validUsers, ...others]);
      } catch (error) {
        toast.error(error.message)
      }
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
  const usersWithValidLocations = userProfiles.filter(profile => profile.location.userProvided);
  return (
    <>
      <Container fluid className="mb-4">
        <AddNewUserPopUp
          open={isOpen}
          onClose={() => setIsOpen(false)}
          handleSaveLocation={() => {}}
          setUserProfiles={setUserProfiles}
        />
        <div className={'py-2 d-flex justify-content-between'}>
          <h5>Total Countries: {totalUniqueCountries}</h5>
          <Button
            outline
            color="primary"
            className={'btn btn-outline-success mr-1 btn-sm'}
            style={{ ...boxStyle }}
            onClick={() => setIsOpen(true)}
          >
            Add person
          </Button>
        </div>
        <MapContainer
          center={[51.505, -0.09]}
          maxBounds={[
            [-90, -225],
            [90, 225],
          ]}
          maxBoundsViscosity={1.0}
          zoom={3}
          scrollWheelZoom={true}
          style={{ border: '1px solid grey' }}
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
                      {profile.firstName !== priorText && profile.lastName !== priorText ? (
                        <div>{`Name: ${profile.firstName} ${profile.lastName}`}</div>
                      ) : (
                        <div>{priorText}</div>
                      )}
                      {profile.jobTitle !== priorText && <div>{`Title: ${profile.jobTitle}`}</div>}
                      <div>{`Location: ${profile.location.userProvided}`}</div>
                      {profile.canBeRemoved ? <Button>Remove</Button> : ''}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </Container>
    </>
  );
};

export default TeamLocations;
