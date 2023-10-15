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
import { createLocation, editLocation } from 'services/mapLocationsService';
import { useEffect } from 'react';
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
function AddOrEditPopup({
  onClose,
  open,
  setManuallyUserProfiles,
  title,
  isAdd,
  isEdit,
  editProfile,
  submitText,
}) {
  const [locationData, setLocationData] = useState(initialLocationData);
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    jobTitle: null,
    location: null,
  });
  const key = useSelector(state => state.timeZoneAPI.userAPIKey);

  const getCoordsHandler = async () => {
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
      setErrors(prev => ({ ...prev, location: null }));
    }

    if (key) {
      try {
        const res = await getUserTimeZone(location, key);
        if (
          res.data.status.code === 200 &&
          res.data.results &&
          res.data.results.length
        ) {
          let currentLocation = {
            userProvided: location,
            coords: {
              lat: res.data.results[0].geometry.lat,
              lng: res.data.results[0].geometry.lng,
            },
            country: res.data.results[0].components.country || '',
            city: res.data.results[0].components.city || '',
          };
          setLocationData(prev => ({
            ...prev,
            location: currentLocation,
          }));
        } else if(res.data.status.code !== 200) {
          throw new Error('Something went wrong with a request')
        } else {
          throw new Error('Invalid location')
        }
      } catch(err) {
        toast.error(err.message);
      }

    }
  };
  useEffect(() => {
    if (isEdit) {
      const priorData = {
        firstName: editProfile.firstName,
        lastName: editProfile.lastName,
        jobTitle: Array.isArray(editProfile.jobTitle) ? editProfile.jobTitle.join(' ') : editProfile.jobTitle,
        location: editProfile.location,
        type: editProfile.type
      };
      for (let key in priorData) {
        if (!priorData[key]) {
          priorData[key] = 'Prior to HGN Data Collection';
        }
      }
      setLocationData(priorData);
    } else {
      setLocationData(initialLocationData);
    }
  }, [open]);

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
      locationData[item] = Array.isArray(item) ? item.join(' ') : locationData[item];
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

    if (isAdd) {
      try {
        const res = await createLocation(locationData);
        if (!res) {
          throw new Error();
        }
        onClose();
        toast.success('A person successfully added to a map!');
        setManuallyUserProfiles(prev => [
          ...prev,
          {
            firstName:
              locationData.firstName !== 'Prior to HGN Data Collection'
                ? locationData.firstName
                : '',
            lastName:
              locationData.lastName !== 'Prior to HGN Data Collection' ? locationData.lastName : '',
            jobTitle:
              locationData.jobTitle !== 'Prior to HGN Data Collection' ? locationData.jobTitle : '',
            location: locationData.location,
          },
        ]);
        setLocationData(initialLocationData);
      } catch (err) {
        onClose();
        toast.error(err.message);
      }
    } else if (isEdit) {
      const res = await editLocation(locationData);
      if (!res || res.status !== 200) {
        throw new Error();
      }
      onClose();
      toast.success('User successfully edited!');
    } else {
      return;
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
    <Modal isOpen={open} toggle={onClose} className={'modal-dialog modal-lg'}>
      <ModalHeader toggle={onClose} cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}>
        {title}
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
            <Button className="btn btn-primary mt-5" type="submit" color="primary">
              {submitText}
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddOrEditPopup;
