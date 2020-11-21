import React from 'react';
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

const Name = () => {

};

const EditForm = (props) => {
  const {
    userProfile,
    isUserAdmin,
    isUserSelf,
    handleUserProfile,
    formValid,
  } = props;
  const {
    firstName,
    lastName,
    phoneNumber,
    privacySettings,
    email,
    jobTitle,
  } = userProfile;
  return (
    <div>

      <Row>
        <Col md="6">
          <Label>Name</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            id="info-name"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
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
      </Row>
      <Row>
        <Col md="6">
          <Label>Title</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            id="info-email"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
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
      </Row>
      <Row>
        <Col md="6">
          <Label>Email</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            id="info-email"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
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
      </Row>
      <Row>
        <Col md="6">
          <Label>Phone</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            id="info-phone"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
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
      </Row>

    </div>
  );
};

export default EditForm;
