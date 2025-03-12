import { useState, useEffect, useRef } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import Input from 'components/common/Input';
import { createLocation, editLocation } from 'services/mapLocationsService';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import CustomInput from './CustomInput';

const initialLocationData = {
  firstName: '',
  lastName: '',
  jobTitle: '',
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
  setUserProfiles,
  title,
  isAdd,
  isEdit,
  editProfile,
  submitText,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [locationData, setLocationData] = useState(initialLocationData);
  const [timeZone, setTimeZone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    jobTitle: null,
    location: null,
  });

  const getCoordsHandler = () => {
    const location = locationData.location.userProvided;
    if (!location) {
      toast.error('Please enter valid location');
      return;
    }

    if (errors.location === 'Please get the coordinates of location') {
      setErrors(prev => ({ ...prev, location: null }));
    }

    axios
      .get(ENDPOINTS.TIMEZONE_LOCATION(location))
      .then(res => {
        if (res.status === 200) {
          const { timezone, currentLocation } = res.data;
          setLocationData(prev => ({
            ...prev,
            location: currentLocation,
          }));
          setTimeZone(timezone);
        }
      })
      .catch(err => {
        toast.error(`An error occurred : ${err.response.data}`);
      });
  };
  useEffect(() => {
    if (isEdit) {
      const priorData = {
        firstName: editProfile.firstName || 'Prior to HGN Data Collection',
        lastName: editProfile.lastName || 'Prior to HGN Data Collection',
        jobTitle: Array.isArray(editProfile.jobTitle)
          ? editProfile.jobTitle.join(' ')
          : editProfile.jobTitle || 'Prior to HGN Data Collection',
        location: editProfile.location,
        _id: editProfile._id,
        type: editProfile.type,
      };

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

    // check if fields are not empty
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

    const newLocationObject = {};

    // removing prior data titles
    Object.keys(locationData).forEach(key => {
      if (locationData[key] === 'Prior to HGN Data Collection' && key !== 'title') {
        newLocationObject[key] = '';
      } else {
        newLocationObject[key] = locationData[key];
      }
    });

    if (editProfile && editProfile.type === 'user') {
      newLocationObject.timeZone = timeZone;
    }

    try {
      if (isAdd) {
        const res = await createLocation(newLocationObject);
        if (!res) {
          throw new Error();
        }
        toast.success('A person successfully added to a map!');
        setManuallyUserProfiles(prev => [...prev, { ...res.data, type: 'm_user' }]);
        setLocationData(initialLocationData);
        setFormSubmitted(true);
      } else if (isEdit) {
        const res = await editLocation(newLocationObject);
        if (!res || res.status !== 200) {
          throw new Error();
        }
        if (res.data.type === 'm_user') {
          setManuallyUserProfiles(prev => {
            const filtered = prev.filter(item => item._id !== res.data._id);
            return [...filtered, res.data];
          });
        } else {
          setUserProfiles(prev => {
            const filtered = prev.filter(item => item._id !== res.data._id);
            return [...filtered, res.data];
          });
        }
        onClose();
        toast.success('User successfully edited!');
        setTimeZone('');
        setLocationData(initialLocationData);
      } else {
        return;
      }
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

  const firstNameRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (firstNameRef.current) {
          firstNameRef.current.focus();
        }
      }, 100);
      setFormSubmitted(false);
    }
  }, [open, formSubmitted]);

  return (
    <Modal
      isOpen={open}
      toggle={onClose}
      className={`modal-dialog modal-lg ${darkMode ? 'text-light dark-mode' : ''}`}
    >
      <ModalHeader
        className={darkMode ? 'bg-space-cadet' : ''}
        toggle={onClose}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        {title}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Form onSubmit={onSubmitHandler}>
          <CustomInput
            type="text"
            name="firstName"
            value={locationData.firstName}
            label="First Name"
            placeholder="Please enter a first name"
            onChange={locationDataHandler}
            required
            error={errors.firstName}
            ref={firstNameRef}
            darkMode={darkMode}
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
            darkMode={darkMode}
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
            darkMode={darkMode}
          />
          <div>
            <p className={`mb-2 ${darkMode ? 'text-azure font-weight-bold' : ''}`}>Location</p>
            <div id="location" className="d-flex justify-content-stretch gap-1">
              <div className="w-50 mr-1 position-relative">
                <input
                  type="text"
                  id="location"
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
                style={darkMode ? boxStyleDark : boxStyle}
                className="px-0 w-50"
              >
                Get location
              </Button>
            </div>
            {errors.location && <div className="alert alert-danger mt-1">{errors.location}</div>}
          </div>
          <div className="text-center">
            <Button
              className="btn btn-primary mt-5"
              type="submit"
              color="primary"
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {submitText}
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button style={darkMode ? boxStyleDark : boxStyle} color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddOrEditPopup;
