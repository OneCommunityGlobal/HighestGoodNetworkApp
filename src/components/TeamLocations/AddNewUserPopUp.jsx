import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Row,
  Col,
  Form,
} from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from 'utils/URL';
import Input from 'components/common/Input';
import { getUserTimeZone } from 'services/timezoneApiService';
import { useSelector } from 'react-redux';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';
import { createLocation } from 'services/mapLocationsService';
const initialLocationData = {
  firstName: 'Prior to HGN Data Collection',
  lastName: 'Prior to HGN Data Collection',
  jobTitle: 'Prior to HGN Data Collection',
  location: {
    userProvided: '',
    coords: {
      lat: '',
      lng: '',
    },
  },
};
function AddNewUserPopUp({ onClose, open, handleSaveLocation, setUserProfiles }) {
  const [locationData, setLocationData] = useState(initialLocationData);
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    jobTitle: null,
    location: null,
  });
  const key = useSelector(state => state.timeZoneAPI.userAPIKey);

  const getCoordsHandler = () => {
    const location = locationData.location.userProvided;
    if (!location) {
      alert('Please enter valid location');
      return;
    }
    if (!key) {
      alert("Timezone key doesn't exist");
      return;
    }
    if (errors.location === 'Please get the coordinates of location') {
      errors.location = null;
    }

    if (key) {
      getUserTimeZone(location, key)
        .then(response => {
          if (
            response.data.status.code === 200 &&
            response.data.results &&
            response.data.results.length
          ) {
            let currentLocation = {
              userProvided: location,
              coords: {
                lat: response.data.results[0].geometry.lat,
                lng: response.data.results[0].geometry.lng,
              },
              country: response.data.results[0].components.country || '',
              city: response.data.results[0].components.city || '',
            };
            setLocationData(prev => ({
              ...prev,
              location: currentLocation,
            }));
          } else {
            alert('Invalid location or ' + response.data.status.message);
          }
        })
        .catch(err => console.log(err));
    }
  };

  const closePopup = () => {
    onClose();
  };

  const locationDataHandler = e => {
    const { value, name } = e.target;
    if (name === 'location') {
      setLocationData(prev => ({
        ...prev,
        [name]: {
          userProvided: value,
          coords: { lat: '', lng: '' },
        },
      }));
    } else {
      setLocationData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };
  const onSubmitHandler = async e => {
    e.preventDefault();
    const currentErrors = {};
    Object.keys(locationData).forEach(item => {
      if (item === 'location') {
        if (!locationData.location.coords.lat || !locationData.location.coords.lng) {
          currentErrors[item] = 'Please get the coordinates of location';
        } else if (!locationData.location.userProvided.trim()) {
          currentErrors[item] = 'Please provide valid information';
        }
      } else if (item !== 'location' && (!locationData[item] || !locationData[item].trim())) {
        currentErrors[item] = 'Please provide valid information';
      }
    });

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }

    try {
      const res = await createLocation(locationData);
      if(!res) {
        throw new Error()
      }
      onClose();
      toast.success('A person successfully added to a map!');
      setUserProfiles(prev => ([...prev, {...locationData, canBeRemoved: true}]))  
      setLocationData(initialLocationData);
    } catch (err) {
      onClose();
      toast.error(err.message);
    }
  };

  let locationValue = locationData.location.userProvided;

  if (locationData.location.city) {
    locationValue = `${locationData.location.city}, `;
  }
  if (locationData.location.country) {
    if (locationData.location.city) {
      locationValue += `${locationData.location.country}`;
    } else {
      locationValue = `${locationData.location.country}`;
    }
  }

  return (
    <Modal isOpen={open} toggle={closePopup} className={'modal-dialog modal-lg'}>
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Add New User Location
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={onSubmitHandler}>
          <Input
            type="text"
            name="firstName"
            value={locationData.firstName}
            label="First Name"
            placeholder="Please enter a first name"
            onChange={locationDataHandler}
            required
            error={errors.firstName}
          />
          <Input
            type="text"
            name="lastName"
            value={locationData.lastName}
            label="Last Name"
            placeholder="Please enter a last name"
            onChange={locationDataHandler}
            required
            error={errors.lastName}
          />

          <Input
            type="text"
            name="jobTitle"
            value={locationData.jobTitle}
            label="Job Title"
            placeholder="Please enter user job title"
            onChange={locationDataHandler}
            required
            error={errors.jobTitle}
          />
          <div>
            <label htmlFor="location">Location</label>
            <div id="location" className="d-flex justify-content-stretch gap-1">
              <div className="w-50 mr-1 position-relative">
                <input
                  type="text"
                  name="location"
                  value={locationValue}
                  placeholder="Please enter user location"
                  onChange={locationDataHandler}
                  required
                  className="form-control"
                />
                {locationData.location.coords.lat && locationData.location.coords.lng && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '3%',
                      top: '20%',
                      color: '#32a518',
                      cursor: 'default',
                    }}
                  >
                    <strong>✓</strong>
                  </div>
                )}
              </div>

              <Button
                color="secondary"
                onClick={getCoordsHandler}
                style={boxStyle}
                className="px-0 w-50"
              >
                Get location
              </Button>
            </div>
            {errors.location && <div className="alert alert-danger mt-1">{errors.location}</div>}
          </div>
          <div className="text-center">
            <Button
              onClick={handleSaveLocation}
              className="btn btn-primary mt-5"
              type="submit"
              color="primary"
            >
              Save to Map
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddNewUserPopUp;
