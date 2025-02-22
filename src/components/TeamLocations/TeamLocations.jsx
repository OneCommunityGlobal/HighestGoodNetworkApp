import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Button, Container, Spinner } from 'reactstrap';
import './TeamLocations.css';

import { SEARCH } from 'languages/en/ui';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
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
  const [mapMarkers,setMapMarkers] = useState([])
  const [tableVisible, setTableVisible] = useState(false);
  const [markerPopupVisible, setMarkerPopupVisible] = useState(false);
  const role = useSelector(state => state.auth.user.role);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [loading, setLoading] = useState(true);  // State variable for loading spinner


  const isAbleToEdit = role === 'Owner';
  const mapRef = useRef(null); 
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function getUserProfiles() {
      try {
        const locations = (await axios.get(ENDPOINTS.ALL_MAP_LOCATIONS())).data;
        const users = locations.users.map(item => ({ ...item, type: 'user' })) || [];
        const mUsers = locations.mUsers.map(item => ({ ...item, type: 'm_user' })) || [];

        setUserProfiles(users);
        setManuallyAddedProfiles(mUsers);
        const allMapMarkers = [...users, ...mUsers];
        const allMapMarkersOffset = allMapMarkers.map(ele =>({
          ...ele,
          location: {
              ...ele.location,
              coords: {
                  ...ele.location.coords,
                  lat: randomLocationOffset(ele.location.coords.lat), 
                  lng: randomLocationOffset(ele.location.coords.lng),
              },
          },
      }))
        setMapMarkers(allMapMarkersOffset);
        setLoading(false);  // Set loading to false after data is loaded
      } catch (error) {
        toast.error(error.message);
        setLoading(false);  // Set loading to false if there's an error
      }
    }
    getUserProfiles();
  }, []);

  useEffect(() => {
    let coords = currentUser?.location.coords;
    if (coords) {
      handleFlyTo(coords.lat, coords.lng);
    }
  }, [currentUser])

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
    const newLongitude = Number(c) + randomOffset;

    const modifiedLongitude = Number(newLongitude.toFixed(7));
    return modifiedLongitude;
  };

  const toggleTableVisibility = () => {
    if (tableVisible) {
      setCurrentUser(null);
      setTableVisible(false);
      setMarkerPopupVisible(false);

      if (mapRef.current.getZoom() >= 13) {
        setPopupsOpen(true);
      }
    } 
    else {
      setTableVisible(true);
      setPopupsOpen(false);
    }
  }

  // Get an array of all users' non-null countries (some locations may not be associated with a country)
  // Get the number of unique countries

  
  const countries = mapMarkers.map(user => user.location.country);
  const totalUniqueCountries = [...new Set(countries)].length;
  let filteredMapMarkers = mapMarkers;
  if (searchText) {
    filteredMapMarkers = filteredMapMarkers.filter(
      item =>
        item.location.city?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.location.country?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.lastName?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }
  let dropdown = false;
  const noUsersFound = 'No users found.';
  const isEditing = editIsOpen && editingUser;
  if (searchText) {
    dropdown = true;
  }

  const handleFlyTo = (latitude, longitude) => {
    mapRef?.current.flyTo([latitude, longitude], 13, {
      animate: true, 
      duration: 3.0
    });
  } 

  const markerPopups = filteredMapMarkers.map(profile => {
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
        darkMode={darkMode} />
    );
  });

  return (
    <Container fluid className={`${darkMode ? 'bg-oxford-blue text-light team-locations-container dark-mode' : ''}`} style={{minHeight: "100%", paddingBottom: "73px"}}>
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
            title={isEditing ? 'Edit User Profile' : 'Adding New User'}
            submitText={isEditing ? 'Save Changes' : 'Save To Map'}
          />
          <ListUsersPopUp
            open={listIsOpen}
            onClose={() => setListIsOpen(false)}
            userProfiles={[...userProfiles, ...manuallyAddedProfiles]}
            removeUser={removeLocation}
            setEdit={editHandler}
          />
        </>
      ) }
      <div className="py-2 d-flex justify-content-between flex-column flex-md-row">
        <div className='text-and-table-icon-container'>
          <h5>Total Countries: {totalUniqueCountries}</h5>
          <button id='toggle-table-button' disabled={filteredMapMarkers.length == 0} onClick={toggleTableVisibility}>
            <i className={`fa fa-table ${darkMode ? 'text-light' : 'text-dark'}`} aria-hidden="true"
/>
          </button>
        </div>
        {isAbleToEdit ? (
          <div className="d-flex align-center">
            <div className="d-flex align-center pr-5 flex-column flex-md-row  position-relative">
              <div className="input-group-prepend">
                <span className="input-group-text">{SEARCH}</span>
              </div>
              <div>
                <input
                  type="text"
                  className="form-control"
                  aria-label="Search"
                  placeholder="Search by Location"
                  value={searchText}
                  onChange={searchHandler}
                />
              </div>
              {dropdown && (
                <div className="position-absolute map-dropdown-table">
                  <div
                    className="overflow-auto pr-3"
                    style={{ height: '300px' }}
                  >
                    {filteredMapMarkers.length > 0 ? (
                      <table className={`table table-bordered table-responsive-md ${darkMode ? 'text-light bg-yinmn-blue' : ''}`}>
                        <tbody>
                          {filteredMapMarkers.map(profile => {
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
                                    {profile.type === 'm_user' ? (
                                      <Button
                                        color="danger"
                                        style={boxStyle}
                                        className="btn mr-1 btn-sm"
                                        onClick={() => removeLocation(profile._id)}
                                      >
                                        Remove
                                      </Button>
                                    ) : null}
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
                      <p className="p-5 text-center">{noUsersFound}</p>
                    )}
                  </div>
                </div>
              ) }
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
        ) : null}
      </div>
      <div style={{position: 'relative'}}>
      
      <div>{tableVisible && <TeamLocationsTable visible={tableVisible} filteredMapMarkers={filteredMapMarkers} setCurrentUser={setCurrentUser} darkMode={darkMode} />}</div>
      {loading? (
           <div animation="border" size="md" className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
           <Spinner animation="border" size="lg" />
         </div>
        ):
      (
      <MapContainer 
        id='map-container'
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
      >
        <EventComponent setPopupsOpen={setPopupsOpen} currentUser={currentUser} setMarkerPopupVisible={setMarkerPopupVisible}  />
        
          
           
           
          
          <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          minZoom={2}
          maxZoom={15} />
         
        <MarkerClusterGroup disableClusteringAtZoom={13} spiderfyOnMaxZoom={true} chunkedLoading>
          {tableVisible && currentUser ?  
          
          <MarkerPopup
            key={currentUser._id}
            profile={currentUser}
            userName={getUserName(currentUser)}
            isAbleToEdit={isAbleToEdit}
            editHandler={editHandler}
            removeLocation={removeLocation}
            isOpen={markerPopupVisible}
            darkMode={darkMode} /> 
            
            : markerPopups }
        </MarkerClusterGroup>
      </MapContainer>
      )}
      </div>
    </Container>
  );
}

function getUserName(profile) {
  let userName = '';
  if (profile.firstName && profile.lastName) {
    userName = `${profile.firstName} ${`${profile.lastName[0]}.`}`;
  } else {
    userName =
      profile.firstName || `${profile.lastName ? `${profile.lastName[0]}.` : ''}`;
  }
  return userName;
}

function EventComponent({ setPopupsOpen, currentUser, setMarkerPopupVisible }) {

  const map = useMapEvents({
    zoomend() {
      if (currentUser) {
        setMarkerPopupVisible(true);
        setPopupsOpen(false);
      }
      if (map.getZoom() >= 13 && !currentUser) {
        setPopupsOpen(true);
      } else {
        setPopupsOpen(false);
      }
    }, 
    
    zoomstart() {
      setMarkerPopupVisible(false);
    }
  })
  return null;
}

export default TeamLocations;