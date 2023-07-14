import React from 'react';
import {
  Container,
  Row,
  Col,
  Input,
  FormFeedback,
  FormGroup,
  Form,
  Label,
  Button,
} from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import TimeZoneDropDown from '../UserProfile/TimeZoneDropDown';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import logo from '../../assets/images/logo.png';
const SetupProfileUserEntry = () => {
  return (
    <div className="profile-setup-user-entry-container">
      <div className="profile-setup-user-entry-header">
        <img src={logo} alt="logo" className="profile-setup-user-entry-logo" />
      </div>
      <div className="alert alert-info text-center">
        Welcome to the One Community Highest Good Network! To create your account, please provide
        all the requested information below.
      </div>
      <Container fluid className="profile-setup-user-entry-form-container">
        <Row>
          <Col md="12">
            <Form>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Name</Label>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Input type="text" name="firstName" id="firstName" placeholder="First Name" />
                    <FormFeedback></FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Input type="text" name="lastName" id="lastName" placeholder="Last Name" />
                    <FormFeedback></FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Job Title</Label>
                </Col>
                <Col md={{ size: 6 }}>
                  <FormGroup>
                    <Input type="text" name="jobTitle" id="jobTitle" placeholder="Job Title" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Email</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input type="email" name="email" id="email" placeholder="Email" />
                    <FormFeedback></FormFeedback>
                    <ToggleSwitch switchType="email" />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Phone</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <PhoneInput
                      country="US"
                      regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                      limitMaxLength="true"
                    />
                  </FormGroup>
                  <ToggleSwitch switchType="phone" />
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Weekly Committed Hours</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="number"
                      name="weeklyCommittedHours"
                      id="weeklyCommittedHours"
                      placeholder="Weekly Committed Hours"
                    />
                    <FormFeedback></FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Video Call Preference</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="text"
                      name="collaborationPreference"
                      id="collaborationPreference"
                      placeholder="Skype, Zoom, etc."
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Location</Label>
                </Col>
                <Col md="6">
                  <Row>
                    <Col md="6">
                      <Input id="location" />
                    </Col>
                    <Col md="6">
                      <div className="w-100 pt-1 mb-2 mx-auto">
                        <Button color="secondary" block size="sm">
                          Get Time Zone
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Time Zone</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <TimeZoneDropDown selected={'America/Los_Angeles'} id="timeZone" />
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md="12">
            <Row>
              <Col md="4">
                <Button className="btn btn-content p-2 pl-4 pr-4" color="primary">
                  Submit
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SetupProfileUserEntry;
