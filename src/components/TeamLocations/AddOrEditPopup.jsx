import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import Input from 'components/common/Input';
import { useSelector, useDispatch } from 'react-redux';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';
import { createLocation, editLocation } from 'services/mapLocationsService';
import { getTimeZone } from 'actions/timezoneAPIActions';
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
  setUserProfiles,
  title,
  isAdd,
  isEdit,
  editProfile,
  submitText,
}) {
  const [locationData, setLocationData] = useState(initialLocationData);
  const [timeZone, setTimeZone] = useState('');
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    jobTitle: null,
    location: null,
  });
  
  const dispatch = useDispatch();

  const getCoordsHandler = () => {
    const location = locationData.location.userProvided;
    if (!location) {
      toast.error('Please enter valid location');
      return;
    }

    if (errors.location === 'Please get the coordinates of location') {
      setErrors(prev => ({ ...prev, location: null }));
    }

    dispatch(getTimeZone(location)).then(res => {
      if(!res.status) {
          setLocationData(prev => ({
            ...prev,
            location: res.currentLocation,
          }));
          setTimeZone(res.timezone);
      } else { 
        toast.error(`An error occurred : ${res.data}`);
      }
    }).catch(err => {
      console.log(err);
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
        onClose();
        toast.success('A person successfully added to a map!');
        setManuallyUserProfiles(prev => [...prev, { ...res.data, type: 'm_user' }]);
        setLocationData(newLocationObject);
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

  return (
    <Modal isOpen={open} toggle={onClose} className="modal-dialog modal-lg">
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
            <p className="mb-2">Location</p>
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
                style={boxStyle}
                className="px-0 w-50"
              >
                Get location
              </Button>
            </div>
            {errors.location && <div className="alert alert-danger mt-1">{errors.location}</div>}
          </div>
          <div className="text-center">
            <Button className="btn btn-primary mt-5" type="submit" color="primary" style={boxStyle}>
              {submitText}
            </Button>
          </div>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button style={boxStyle} color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AddOrEditPopup;
