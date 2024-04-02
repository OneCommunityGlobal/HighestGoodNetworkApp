import React, { useState } from 'react';
import {
  Container,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Row,
  Col,
  FormGroup,
  FormFeedback,
  Button,
} from 'reactstrap';
import RequirementModal from './requirementModal';
import httpService from 'services/httpService';
import { ENDPOINTS } from 'utils/URL';

const HomeCountryModal = ({ isOpen, toggle, setLocation,token}) => {
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
    httpService.post(ENDPOINTS.TIMEZONE_LOCATION(location),{token}).then(res => {
      if (res.status === 200) {
        const { currentLocation } = res.data;
        setLocationInput({
          ...currentLocation
        });
      }
    }).catch((err) => {
      setInputError(`An error occured: ${err.response.data}`);
    })
  };

  const handleYesClick = () => {
    setLocationAdded(true);
    setLocation(locationInput);
    setLocationInput(locationInitialState);
    setTimeout(()=>{toggle()},1000)
  };

  const handleNoClick = () => {
    setLocationRefused(true);
    setLocationInput(locationInitialState);
    setTimeout(()=>{toggle()},1000)
  };

  const reset = () =>{
    setLocationInput(locationInitialState);
    setLocationAdded(false);
    setLocationRefused(false); 
    setrequirementsBoxChecked(false);
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} onOpened={reset}>
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
          <Container>
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
          </Container>
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
