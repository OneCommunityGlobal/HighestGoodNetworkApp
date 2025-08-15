import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
//import { Map, TileLayer } from 'react-leaflet'; // Changed: useMapEvents removed
import { MapContainer, TileLayer } from 'react-leaflet';
// AFTER
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { Button, Container } from 'reactstrap';
import './TeamLocations.css';

import { SEARCH } from '../../languages/en/ui';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from '../../styles.js';
import { ApiEndpoint, ENDPOINTS } from '../../utils/URL';
import AddOrEditPopup from './AddOrEditPopup';
import ListUsersPopUp from './ListUsersPopUp';
import MarkerPopup from './MarkerPopup';
import TeamLocationsTable from './TeamLocationsTable';

function TeamLocations() {
  const [userProfiles, setUserProfiles] = useState([]);
  const [manuallyAddedProfiles, setManuallyAddedProfiles] = useState([]);
  const [addNewIsOpen, setAddNewIsOpen] = useState(false);
  const [listIsOpen, setListIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [popupsOpen, setPopupsOpen] = useState(false);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [tableVisible, setTableVisible] = useState(false);
  const [markerPopupVisible, setMarkerPopupVisible] = useState(false);
  const role = useSelector(state => state.auth.user.role);
  const darkMode = useSelector(state => state.theme.darkMode);
  const isAbleToEdit = role === 'Owner';
  const mapRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function getUserProfiles() {
      try {
        const locations = (await axios.get(ENDPOINTS.ALL_MAP_LOCATIONS())).data;
        const users = locations.users.map(item => ({ ...item, type: 'user' })) || [];
        const mUsers = locations.mUsers.map(item => ({ ...item, type: 'm_user' })) || [];
        setUserProfiles(users);
        setManuallyAddedProfiles(mUsers);

        const allMapMarkers = [...users, ...mUsers].map(ele => ({
          ...ele,
          location: {
            ...ele.location,
            coords: {
              ...ele.location.coords,
              lat: randomLocationOffset(ele.location.coords.lat),
              lng: randomLocationOffset(ele.location.coords.lng),
            },
          },
        }));
        setMapMarkers(allMapMarkers);
      } catch (error) {
        toast.error(error.message);
      }
    }
    getUserProfiles();
  }, []);

  useEffect(() => {
    let coords = currentUser?.location.coords;
    if (coords) {
      // Note: handleFlyTo might need to be implemented or checked
      // For now, this logic remains as is.
    }
  }, [currentUser]);

  // We don't need the back to top button on this page
  useEffect(() => {
    const backToTopButton = document.querySelector('.top');
    backToTopButton.style.display = 'none';
    return () => {
      backToTopButton.style.display = 'block';
    };
  }, []);

  // New: Event handler for zoom start
  const handleZoomStart = () => {
    setMarkerPopupVisible(false);
  };

  // New: Event handler for zoom end
  const handleZoomEnd = () => {
    const map = mapRef.current;
    if (!map) return; // Guard clause in case ref is not ready

    // In react-leaflet v2, the Leaflet instance is in the .leafletElement property
    const currentZoom = map.leafletElement.getZoom();

    if (currentUser) {
      setMarkerPopupVisible(true);
      setPopupsOpen(false);
    }
    if (currentZoom >= 13 && !currentUser) {
      setPopupsOpen(true);
    } else {
      setPopupsOpen(false);
    }
  };

  const searchHandler = e => {
    setSearchText(e.target.value);
  };

  const removeLocation = async id => {
    try {
      const res = await axios.delete(`${ApiEndpoint}/mapLocations/${id}`);
      if (res.status === 200) {
        setManuallyAddedProfiles(prev => prev.filter(item => item._id !== id));
        toast.success(res.data.message);
      } else {
        throw new Error('Something went wrong. Try again later.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editHandler = profile => {
    setEditingUser(profile);
    setEditIsOpen(true);
  };

  const toggleListPopUp = () => {
    setListIsOpen(prev => !prev);
  };

  const addOrEditClose = () => {
    if (editIsOpen) {
      setEditIsOpen(false);
      setEditingUser(null);
    } else if (addNewIsOpen) {
      setAddNewIsOpen(false);
    }
  };

  const randomLocationOffset = c => {
    const randomOffset = (Math.random() - 0.5) * 2 * 0.05;
    return Number((Number(c) + randomOffset).toFixed(7));
  };

  const toggleTableVisibility = () => {
    if (tableVisible) {
      setCurrentUser(null);
      setTableVisible(false);
      setMarkerPopupVisible(false);

      if (mapRef.current.leafletElement.getZoom() >= 13) {
        setPopupsOpen(true);
      }
    } else {
      setTableVisible(true);
      setPopupsOpen(false);
    }
  };

  const countries = mapMarkers.map(user => user.location.country);
  const totalUniqueCountries = [...new Set(countries)].length;

  let filteredMarkers = mapMarkers;
  if (searchText) {
    filteredMarkers = mapMarkers.filter(
      item =>
        item.location.city?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.country?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  const markerPopups = filteredMarkers.map(profile => {
    let userName = getUserName(profile);

    return (
      <MarkerPopup
        key={profile._id}
        profile={profile}
        userName={userName}
        isAbleToEdit={isAbleToEdit}
        editHandler={editHandler}
        removeLocation={removeLocation}
        isOpen={popupsOpen}
        darkMode={darkMode}
      />
    );
  });

  return (
    <Container
      fluid
      className={`${darkMode ? 'bg-oxford-blue text-light dark-mode' : ''}`}
      style={{ minHeight: '100%', paddingBottom: '73px' }}
    >
      {isAbleToEdit && (
        <>
          <AddOrEditPopup
            open={editIsOpen || addNewIsOpen}
            onClose={addOrEditClose}
            setManuallyUserProfiles={setManuallyAddedProfiles}
            setUserProfiles={setUserProfiles}
            isEdit={editIsOpen && editingUser}
            editProfile={editingUser}
            isAdd={!editIsOpen && addNewIsOpen}
            title={editIsOpen && editingUser ? 'Edit User Profile' : 'Adding New User'}
            submitText={editIsOpen && editingUser ? 'Save Changes' : 'Save To Map'}
          />
          <ListUsersPopUp
            open={listIsOpen}
            onClose={() => setListIsOpen(false)}
            userProfiles={[...userProfiles, ...manuallyAddedProfiles]}
            removeUser={removeLocation}
            setEdit={editHandler}
          />
        </>
      )}
      <div className="py-2 d-flex justify-content-between flex-column flex-md-row">
        <div className="text-and-table-icon-container">
          <h5>Total Countries: {totalUniqueCountries}</h5>
          <button
            id="toggle-table-button"
            disabled={mapMarkers.length === 0}
            onClick={toggleTableVisibility}
          >
            <i
              className={`fa fa-table ${darkMode ? 'text-light' : 'text-dark'}`}
              aria-hidden="true"
            />
          </button>
        </div>
        {isAbleToEdit && (
          <div className="d-flex align-center">
            <div className="d-flex align-center pr-5 flex-column flex-md-row position-relative">
              <div className="input-group-prepend">
                <span className="input-group-text mr-2">{SEARCH}</span>
              </div>
              <div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Search"
                  placeholder="Search Text"
                  value={searchText}
                  onChange={searchHandler}
                />
              </div>
              {searchText && (
                <div className="position-absolute map-dropdown-table w-100">
                  <div
                    className="overflow-auto pr-3"
                    style={{ height: filteredMarkers.length > 4 ? '300px' : 'unset' }}
                  >
                    {filteredMarkers.length > 0 ? (
                      <table className="table table-bordered table-responsive-md">
                        <tbody>
                          {filteredMarkers.map(profile => {
                            let userName = '';
                            if (profile.firstName && profile.lastName) {
                              userName = `${profile.firstName} ${profile.lastName}`;
                            } else {
                              userName = profile.firstName || profile.lastName || '-';
                            }
                            return (
                              <tr key={profile._id}>
                                <td>{userName}</td>
                                <td>{`${profile.location.city ? `${profile.location.city},` : ''} ${
                                  profile.location.country
                                }`}</td>
                                <td>
                                  <div
                                    style={{
                                      textAlign: 'center',
                                      display: 'flex',
                                      minHeight: '100%',
                                      overflow: 'auto',
                                    }}
                                  >
                                    {profile.type === 'm_user' && (
                                      <Button
                                        color="danger"
                                        style={boxStyle}
                                        className="btn mr-1 btn-sm"
                                        onClick={() => removeLocation(profile._id)}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                    <Button
                                      color="Primary"
                                      className="btn btn-outline-success mr-1 btn-sm"
                                      onClick={() => editHandler(profile)}
                                      style={boxStyle}
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="p-5 text-center">No users found.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="d-flex align-center">
              <Button
                outline
                color="danger"
                className="btn btn-outline-error mr-1 btn-sm"
                style={darkMode ? boxStyleDark : boxStyle}
                onClick={toggleListPopUp}
              >
                Users list
              </Button>
              <Button
                outline
                color="primary"
                className="btn btn-outline-success mr-1 btn-sm"
                style={darkMode ? boxStyleDark : boxStyle}
                onClick={() => setAddNewIsOpen(true)}
              >
                Add person
              </Button>
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        <div>
          {tableVisible && (
            <TeamLocationsTable
              visible={tableVisible}
              mapMarkers={mapMarkers}
              setCurrentUser={setCurrentUser}
              darkMode={darkMode}
            />
          )}
        </div>
        <MapContainer
          id="map-container"
          center={[51.505, -0.09]}
          maxBounds={[
            [-90, -225],
            [90, 225],
          ]}
          maxBoundsViscosity={1.0}
          zoom={3}
          scrollWheelZoom
          style={{ border: '1px solid grey' }}
          ref={mapRef}
          // Changed: Replaced EventComponent with direct props
          onZoomStart={handleZoomStart}
          onZoomEnd={handleZoomEnd}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            minZoom={2}
            maxZoom={15}
          />
          <MarkerClusterGroup disableClusteringAtZoom={13} spiderfyOnMaxZoom={true} chunkedLoading>
            {tableVisible && currentUser ? (
              <MarkerPopup
                key={currentUser._id}
                profile={currentUser}
                userName={getUserName(currentUser)}
                isAbleToEdit={isAbleToEdit}
                editHandler={editHandler}
                removeLocation={removeLocation}
                isOpen={markerPopupVisible}
              />
            ) : (
              markerPopups
            )}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </Container>
  );
}

function getUserName(profile) {
  let userName = '';
  if (profile.firstName && profile.lastName) {
    userName = `${profile.firstName} ${profile.lastName[0]}.`;
  } else {
    userName = profile.firstName || `${profile.lastName ? `${profile.lastName[0]}.` : ''}`;
  }
  return userName;
}

// Deleted: The EventComponent function is no longer needed.

export default TeamLocations;
