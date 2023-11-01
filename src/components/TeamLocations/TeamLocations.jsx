import React from 'react';
import axios from 'axios';
import { ApiEndpoint, ENDPOINTS } from '../../utils/URL';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import './TeamLocations.css';
import { Button, Container } from 'reactstrap';

import { boxStyle } from 'styles';
import AddOrEditPopup from './AddOrEditPopup';
import { toast } from 'react-toastify';
import RemoveUserPopUp from './RemoveUserPopUp';
import { SEARCH } from 'languages/en/ui';
import { useSelector } from 'react-redux';

const TeamLocations = () => {
  const [userProfiles, setUserProfiles] = useState([]);
  const [manuallyAddedProfiles, setManuallyAddedProfiles] = useState([]);
  const [addNewIsOpen, setAddNewIsOpen] = useState(false);
  const [removeIsOpen, setRemoveIsOpen] = useState(false);
  const [editIsOpen, setEditIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const role = useSelector(state => state.userProfile.role);

  const isAbleToEdit = role === 'Owner';

  useEffect(() => {
    async function getUserProfiles() {
      try {
        const locations = (await axios.get(ENDPOINTS.ALL_MAP_LOCATIONS())).data;
        const users = locations.users.map(item => ({ ...item, type: 'user' })) || [];
        const m_users = locations.m_users.map(item => ({ ...item, type: 'm_user' })) || [];

        setUserProfiles(users);
        setManuallyAddedProfiles(m_users);
      } catch (error) {
        toast.error(error.message);
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

  const searchHandler = e => {
    setSearchText(e.target.value);
  };
  const removeLocation = async (id, name) => {
    const confirm = window.confirm(`Are you sure you want to remove ${name} from the map?`);

    if (!confirm) return;

    try {
      const res = await axios.delete(`${ApiEndpoint}/mapLocations/${id}`);
      if (res.status === 200) {
        console.log(manuallyAddedProfiles);
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
  const toggleRemovePopUp = () => {
    setRemoveIsOpen(prev => !prev);
  };

  const addOrEditClose = () => {
    if (editIsOpen) {
      setEditIsOpen(false);
      setEditingUser(null);
    } else if (addNewIsOpen) {
      setAddNewIsOpen(false);
    }
  };
  // Get an array of all users' non-null countries (some locations may not be associated with a country)
  const countries = userProfiles.map(user => user.location.country).filter(country => country);
  // Get the number of unique countries
  const totalUniqueCountries = [...new Set(countries)].length;

  let mapMarkers = [...userProfiles, ...manuallyAddedProfiles];
  if (searchText) {
    mapMarkers = mapMarkers.filter(
      (item, i) =>
        item.location.city?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.country?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }
  let dropdown = false;
  let noUsersFound = 'No users found.';
  if (searchText) {
    dropdown = true;
  }
  return (
    <>
      <Container fluid className="mb-4">
        {isAbleToEdit ? (
          <>
            <AddOrEditPopup
              open={editIsOpen || addNewIsOpen}
              onClose={addOrEditClose}
              setManuallyUserProfiles={setManuallyAddedProfiles}
              setUserProfiles={setUserProfiles}
              isEdit={editIsOpen && editingUser}
              editProfile={editingUser}
              isAdd={!editIsOpen && addNewIsOpen}
              title={
                editIsOpen && editingUser
                  ? 'Edit User Profile'
                  : addNewIsOpen
                  ? 'Adding New User'
                  : ''
              }
              submitText={
                editIsOpen && editingUser ? 'Save Changes' : addNewIsOpen ? 'Save To Map' : ''
              }
            />
            <RemoveUserPopUp
              open={removeIsOpen}
              onClose={() => setRemoveIsOpen(false)}
              userProfiles={[...userProfiles, ...manuallyAddedProfiles]}
              removeUser={removeLocation}
              setEdit={editHandler}
            />
          </>
        ) : (
          <></>
        )}

        <div className={'py-2 d-flex justify-content-between flex-column flex-md-row'}>
          <h5>Total Countries: {totalUniqueCountries}</h5>
          {isAbleToEdit ? (
            <div className={'d-flex align-center'}>
              <div className="d-flex align-center pr-5 flex-column flex-md-row  position-relative">
                <div className="input-group-prepend">
                  <span className="input-group-text">{SEARCH}</span>
                </div>
                <div>
                  <input
                    autoFocus
                    type="text"
                    className="form-control"
                    aria-label="Search"
                    placeholder="Search Text"
                    value={searchText}
                    onChange={searchHandler}
                  />
                </div>
                {dropdown ? (
                  <div className="position-absolute map-dropdown-table w-100">
                    <div
                      className="overflow-auto pr-3"
                      style={{ height: mapMarkers.length > 4 ? '300px' : 'unset' }}
                    >
                      {mapMarkers.length > 0 ? (
                        <table className="table table-bordered table-responsive-md">
                          <tbody>
                            {mapMarkers.map(profile => {
                              let userName = '';
                              if (profile.firstName && profile.lastName) {
                                userName = `${profile.firstName} ${profile.lastName}`;
                              } else {
                                userName = profile.firstName || profile.lastName || '-';
                              }
                              return (
                                <>
                                  <tr key={profile._id}>
                                    <td>{userName}</td>
                                    <td>{`${
                                      profile.location.city ? profile.location.city + ',' : ''
                                    } ${profile.location.country}`}</td>
                                    <td>
                                      <div
                                        style={{
                                          textAlign: 'center',
                                          display: 'flex',
                                          minHeight: '100%',
                                          overflow: 'auto',
                                        }}
                                      >
                                        {profile.type === 'm_user' ? (
                                          <Button
                                            color="danger"
                                            style={boxStyle}
                                            className="btn mr-1 btn-sm"
                                            onClick={() => removeLocation(profile._id, userName)}
                                          >
                                            Remove
                                          </Button>
                                        ) : (
                                          <></>
                                        )}
                                        <Button
                                          color="Primary"
                                          className="btn btn-outline-success mr-1 btn-sm"
                                          onClick={() => editHandler(profile)}
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p className="p-5 text-center">{noUsersFound}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <div className="d-flex align-center">
                <Button
                  outline
                  color="danger"
                  className={'btn btn-outline-error mr-1 btn-sm'}
                  style={{ ...boxStyle }}
                  onClick={toggleRemovePopUp}
                >
                  Users list
                </Button>
                <Button
                  outline
                  color="primary"
                  className={'btn btn-outline-success mr-1 btn-sm'}
                  style={{ ...boxStyle }}
                  onClick={() => setAddNewIsOpen(true)}
                >
                  Add person
                </Button>
              </div>
            </div>
          ) : (
            <></>
          )}
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
            {mapMarkers.map(profile => {
              let userName = '';
              if (profile.firstName && profile.lastName) {
                userName = `${profile.firstName} ${`${profile.lastName[0]}.`}`;
              } else {
                userName =
                  profile.firstName || `${profile.lastName ? `${profile.lastName[0]}.` : ''}`;
              }

              return (
                <CircleMarker
                  center={[profile.location.coords.lat, profile.location.coords.lng]}
                  key={profile._id}
                  color={profile.isActive ? 'green' : 'gray'}
                >
                  <Popup>
                    <div>
                      {profile.title && profile.title}
                      {userName && <div>Name: {userName}</div>}
                      {profile.jobTitle && <div>{`Title: ${profile.jobTitle}`}</div>}
                      <div>
                        {`Location: ${profile.location.city || profile.location.userProvided}`}
                      </div>
                      {isAbleToEdit ? (
                        <div className="mt-3">
                          <Button
                            color="Primary"
                            className="btn btn-outline-success mr-1 btn-sm"
                            onClick={() => editHandler(profile)}
                          >
                            Edit
                          </Button>
                          {profile.type === 'm_user' && profile._id ? (
                            <Button
                              color="danger"
                              className="btn btn-outline-error mr-1 btn-sm"
                              onClick={() => removeLocation(profile._id, userName)}
                            >
                              Remove
                            </Button>
                          ) : (
                            <></>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
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
