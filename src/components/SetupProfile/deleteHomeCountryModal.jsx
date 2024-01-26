import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Button } from 'reactstrap';

const DeleteHoumeCountryModal = ({ isOpen, toggle, setLocation }) => {
  const locationInitialState = {
    userProvided: '',
    coords: { lat: '', lng: '' },
    country: '',
    city: '',
  };
  const [locationKept, setLocationKept] = useState(false);
  const [locationRemoved, setLocationRemoved] = useState(false);

  const handleNoClick = () => {
    setLocationKept(true);
  };

  const handleYesClick = () => {
    setLocationRemoved(true);
    setLocation(locationInitialState);
  };

  const reset = ()=>{
    setLocationKept(false);
    setLocationRemoved(false);
  } 

  return (
    <Modal isOpen={isOpen} toggle={toggle} onOpened={reset}>
      <ModalHeader toggle={toggle}></ModalHeader>
      {!locationKept && !locationRemoved && (
        <>
          <ModalBody>
            <Row>
              <Col>
                <p className="text-center m-0 pl-3 pr-3">
                  Are you sure? One Community is a global effort and it brings us great joy to see
                  and share the diversity of people and countries that are making what we do
                  possible.
                </p>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="justify-content-start">
            <Row>
              <Col>
                <Button color="primary" className="mb-2 w-100" onClick={handleYesClick}>
                  Yes, Just Use My Location Info
                </Button>
                <Button color="secondary" className="mb-2 w-100" onClick={handleNoClick}>
                  No, I Changed My Mind and Would Like to Keep My Home Country/City
                </Button>
              </Col>
            </Row>
          </ModalFooter>
        </>
      )}
      {locationKept && (
        <>
          <ModalBody>
            <Row>
              <Col>
                <p className="text-center m-0 pl-3 pr-3">
                  Wonderful, thank you! Locations are added to the Team Locations Map once a person
                  has completed 10 or more volunteer hours.
                </p>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="mb-2 w-100" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </>
      )}
      {locationRemoved && (
        <>
          <ModalBody>
            <Row>
              <Col>
                <p className="text-center m-0 pl-3 pr-3">
                  Home city/country removed, we’re sorry you’ve changed your mind..
                </p>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" className="mb-2 w-100" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
};

export default DeleteHoumeCountryModal;
