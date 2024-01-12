import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  Input,
  Row,
  Col,
  FormGroup,
  FormFeedback,
  Button,
} from 'reactstrap';
import getUserTimeZone from '../../services/timezoneApiService';
import RequirementModal from './requirementModal';

const HomeCountryModal = ({ isOpen, toggle, apiKey, setLocation }) => {
  const [inputError, setInputError] = useState('');
  const locationInitialState = {
    userProvided: '',
    coords: { lat: '', lng: '' },
    country: '',
    city: '',
  };
  const [locationInput, setLocationInput] = useState(locationInitialState);
  const [locationAdded, setLocationAdded] = useState(false);
  const [locationRefused, setLocationRefused] = useState(false); 
  const [requirementsBoxChecked, setrequirementsBoxChecked] = useState(false);
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [requirementModalError, setrequirementModalError] = useState('');

  const handleLocationChange = event => {
    const { value } = event.target;
    setLocationInput(prev => ({
      ...prev,
      userProvided: value,
    }));
  };

  const toggleRequirementModal = () => {
    setrequirementModalError('');
    setRequirementModalOpen(prev => !prev);
  };

  const handleRequirementsBoxChecked = () => setrequirementsBoxChecked(!requirementsBoxChecked);

  const getTimeZone = () => {
    if(!requirementsBoxChecked){
      setrequirementModalError('You need to read and accept the requirements first')
      return;
    }
    setInputError('');
    setLocationRefused(false);
    setLocationAdded(false);
    const location = locationInput.userProvided;
    if (!location) {
      setInputError('Please enter valid location');
      return;
    }
    if (!apiKey) {
      setInputError('Geocoding API key missing');
      return;
    }
    getUserTimeZone(location, apiKey)
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
            country: response.data.results[0].components.country,
            city: response.data.results[0].components.city || '',
          };
          setLocationInput({
            ...currentLocation,
          });
        } else {
          setInputError('Invalid location or ' + response.data.status.message);
        }
      })
      .catch(err => console.log(err));
  };

  const handleYesClick = () => {
    setLocationAdded(true);
    setLocation(locationInput);
    setLocationInput(locationInitialState);
  };

  const handleNoClick = () => {
    setLocationRefused(true);
    setLocationInput(locationInitialState);
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Set Home City and/or Country</ModalHeader>
      <ModalBody>
        <Row className='mb-3'>
          <Col md="12">
            <Button
              color="primary"
              block
              size="md"
              id="setup-rofile-entry-rr-btn"
              onClick={toggleRequirementModal}
            >
              Read The Requirements
            </Button>
            <Input
              style={{
                display: 'none',
              }}
              invalid={requirementModalError !== ''}
            />
            <FormFeedback>{requirementModalError}</FormFeedback>
            <RequirementModal
              isOpen={requirementModalOpen}
              toggle={toggleRequirementModal}
              handleCheckbox={handleRequirementsBoxChecked}
              isChecked={requirementsBoxChecked}
            />
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <FormGroup>
              <Input
                type="text"
                name="location"
                id="location"
                placeholder="Location"
                value={locationInput.userProvided}
                onChange={e => {
                  handleLocationChange(e);
                }}
                invalid={inputError !== ''}
              />
              <FormFeedback>{inputError}</FormFeedback>
            </FormGroup>
          </Col>
          <Col md="6">
            <Button color="secondary " block size="md" onClick={getTimeZone}>
              Confirm Location
            </Button>
          </Col>
        </Row>
      </ModalBody>
      {locationInput?.country && (
        <ModalFooter className="justify-content-start">
          <Row>
            <Col>
              <p>
                {' '}
                {`Do you want to represent ${
                  locationInput?.city ? `${locationInput?.city}, ` : ''
                } ${locationInput?.country} ?`}{' '}
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button color="primary" className="mr-2" onClick={handleYesClick}>
                Yes
              </Button>
              <Button color="danger" onClick={handleNoClick}>
                No
              </Button>
            </Col>
          </Row>
        </ModalFooter>
      )}
      {locationAdded && (
        <ModalFooter className="justify-content-start">
          <div className="alert alert-info text-center w-100">Thank you!</div>
        </ModalFooter>
      )}
      {locationRefused && (
        <ModalFooter className="justify-content-start">
          <div className="alert alert-info text-center w-100">No problem, thank you!</div>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default HomeCountryModal;
