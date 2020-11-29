import React, { Component } from 'react';
import {
  Row,
  Label,
  Input,
  CardTitle,
  Col,
  Container,
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Badge,
  Collapse,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';


const Name = (props) => {
  const {
    userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid,
  } = props;
  const { firstName, lastName } = userProfile;
  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col md="3">
          <FormGroup>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              value={firstName}
                // className={styleProfile.profileText}
              onChange={handleUserProfile}
              placeholder="First Name"
              invalid={!formValid.firstName}
            />
            <FormFeedback>First Name Can't be null</FormFeedback>
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              value={lastName}
                // className={styleProfile.profileText}
              onChange={handleUserProfile}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
            <FormFeedback>Last Name Can't be Null</FormFeedback>
          </FormGroup>
        </Col>
      </React.Fragment>

    );
  }

  return (
    <React.Fragment>
      <Col md="6">
        <p>{`${firstName} ${lastName}`}</p>
      </Col>
    </React.Fragment>
  );
};


const Title = (props) => {
  const {
    userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid,
  } = props;
  const { jobTitle } = userProfile;

  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col md="6">
          <FormGroup>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              onChange={handleUserProfile}
              placeholder="Job Title"
            />
          </FormGroup>
        </Col>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Col md="6">
        <p>{`${jobTitle}`}</p>
      </Col>
    </React.Fragment>
  );
};

const Email = (props) => {
  const {
    userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid,
  } = props;
  const { email, privacySettings } = userProfile;

  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col md="6">
          <FormGroup>
            <ToggleSwitch
              switchType="email"
              state={privacySettings?.email}
              handleUserProfile={handleUserProfile}
            />

            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={handleUserProfile}
              placeholder="Email"
              invalid={!formValid.email}
            />
            <FormFeedback>Email is not Valid</FormFeedback>
          </FormGroup>
        </Col>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {privacySettings.email && (
        <Col md="6">
          <p>{email}</p>
        </Col>
      )}
    </React.Fragment>
  );
};
const formatPhoneNumber = (str) => {
  // Filter only numbers from the input
  const cleaned = `${str}`.replace(/\D/g, '');
  if (cleaned.length == 10) {
    // Domestic (USA)
    return [
      '( ',
      cleaned.substring(0, 3),
      ' ) ',
      cleaned.substring(3, 6),
      ' - ',
      cleaned.substring(6, 10),
    ].join('');
  }
  if (cleaned.length == 11) {
    // International
    return [
      '+',
      cleaned.substring(0, 1),
      '( ',
      cleaned.substring(1, 4),
      ' ) ',
      cleaned.substring(4, 7),
      ' - ',
      cleaned.substring(7, 11),
    ].join('');
  }
  // Unconventional
  return str;
};
const Phone = (props) => {
  const {
    userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid,
  } = props;
  const { phoneNumber, privacySettings } = userProfile;
  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col md="6">
          <FormGroup>
            <ToggleSwitch
              switchType="phone"
              state={privacySettings?.phoneNumber}
              handleUserProfile={handleUserProfile}
            />

            <Input
              type="number"
              name="phoneNumber"
              id="phoneNumber"
                // className={styleProfile.profileText}
              value={phoneNumber}
              onChange={handleUserProfile}
              placeholder="Phone"
            />
          </FormGroup>
        </Col>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {privacySettings.phoneNumber && (
        <Col md="6">
          <p>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      )}
    </React.Fragment>
  );
};


const BasicInformationTab = (props) => {
  const {
    userProfile,
    isUserAdmin,
    isUserSelf,
    handleUserProfile,
    formValid,
  } = props;

  return (
    <div data-testid="basic-info-tab">
      <Row>
        <Col md="6">
          <Label>Name</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-name"
            id="info-name"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Name
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col md="6">
          <Label>Title</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-title"
            id="info-title"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Title
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col md="6">
          <Label>Email</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-email"
            id="info-email"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Email
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col md="6">
          <Label>Phone</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-phone"
            id="info-phone"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Phone
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>

    </div>
  );
};
export default BasicInformationTab;
