import React, { useState, useEffect } from 'react';
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
import { ENDPOINTS } from 'utils/URL';
import httpService from 'services/httpService';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
const SetupProfileUserEntry = ({ token }) => {
  const history = useHistory();
  const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  const [APIkey, setAPIkey] = useState('');
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    weeklyCommittedHours: 10,
    collaborationPreference: 'Zoom',
    privacySettings: { email: true, phoneNumber: true },
    jobTitle: '',
    timeZone: '',
    location: '',
    getTimeZone: '',
    token,
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    weeklyCommittedHours: '',
    collaborationPreference: '',
    jobTitle: '',
    timeZone: '',
    location: '',
    getTimeZone: '',
  });

  useEffect(() => {
    httpService.post(ENDPOINTS.TIMEZONE_KEY_BY_TOKEN(), { token }).then(response => {
      setAPIkey(response.data.userAPIKey);
    });
  }, []);

  const handleChange = event => {
    const { id, value } = event.target;
    setUserProfile(prevProfile => ({
      ...prevProfile,
      [id]: value,
    }));
  };

  const handleToggle = event => {
    const { id } = event.target;
    const key = id === 'emailPubliclyAccessible' ? 'email' : 'phoneNumber';
    setUserProfile(prevProfile => ({
      ...prevProfile,
      privacySettings: { ...prevProfile.privacySettings, [key]: !prevProfile.privacySettings[key] },
    }));
  };

  const phoneChange = phone => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      phoneNumber: phone,
    }));
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    // Validate firstName
    if (userProfile.firstName.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: 'First Name is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: '',
      }));
    }

    // jobtitle firstName
    if (userProfile.firstName.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: 'First Name is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: '',
      }));
    }

    // Validate lastName
    if (userProfile.lastName.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        lastName: 'Last Name is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        lastName: '',
      }));
    }

    // Validate email

    if (userProfile.email.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        email: 'Email is required',
      }));
    } else if (!patt.test(userProfile.email)) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        email: 'Email is not valid',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        email: '',
      }));
    }

    // Validate phone

    if (userProfile.phoneNumber === null || userProfile.phoneNumber.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        phoneNumber: 'Phone is required',
      }));
    } else if (userProfile.phoneNumber.trim().length < 10) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        phoneNumber: 'Phone is not valid',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        phoneNumber: '',
      }));
    }

    // Validate jobtitle

    if (userProfile.jobTitle.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        jobTitle: 'Job Title is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        jobTitle: '',
      }));
    }

    // Validate Weekly Committed Hours

    if (userProfile.weeklyCommittedHours === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        weeklyCommittedHours: 'Weekly Committed Hours can not be empty',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        weeklyCommittedHours: '',
      }));
    }

    // Validate Video Call Preference

    if (userProfile.collaborationPreference.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        collaborationPreference: 'Video Call Preference can not be empty',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        collaborationPreference: '',
      }));
    }

    // Validate Location

    console.log;

    if (userProfile.location.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: 'Location is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: '',
      }));
    }

    // Validate get time zone

    console.log;

    if (userProfile.getTimeZone.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        getTimeZone: 'Set time zone is required',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: '',
      }));
    }

    // Submit the form if there are no errors
    if (Object.values(formErrors).every(error => error === '')) {
      httpService
        .post(ENDPOINTS.SETUP_NEW_USER_PROFILE(), userProfile)
        .then(response => {
          if (response.status === 200) {
            history.push('/login');
            toast.success(`Congratulations! Your account has been successfully created.`);
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

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
                    <Input
                      type="text"
                      name="firstName"
                      id="firstName"
                      placeholder="First Name"
                      value={userProfile.firstName}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.firstName !== ''}
                    />
                    <FormFeedback>{formErrors.firstName}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Input
                      type="text"
                      name="lastName"
                      id="lastName"
                      placeholder="Last Name"
                      value={userProfile.lastName}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.lastName !== ''}
                    />
                    <FormFeedback>{formErrors.lastName}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Job Title</Label>
                </Col>
                <Col md={{ size: 6 }}>
                  <FormGroup>
                    <Input
                      type="text"
                      name="jobTitle"
                      id="jobTitle"
                      placeholder="Job Title"
                      value={userProfile.jobTitle}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.jobTitle !== ''}
                    />
                    <FormFeedback>{formErrors.jobTitle}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Email</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email"
                      value={userProfile.email}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.email !== ''}
                    />
                    <FormFeedback>{formErrors.email}</FormFeedback>
                    <ToggleSwitch
                      switchType="email"
                      state={userProfile.privacySettings.email}
                      handleUserProfile={e => {
                        handleToggle(e);
                      }}
                    />
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
                      value={userProfile.phoneNumber}
                      onChange={phone => phoneChange(phone)}
                    />
                    <Input
                      style={{
                        display: 'none',
                      }}
                      invalid={formErrors.phoneNumber !== ''}
                    />
                    <FormFeedback>{formErrors.phoneNumber}</FormFeedback>
                  </FormGroup>
                  <ToggleSwitch
                    switchType="phone"
                    state={userProfile.privacySettings.phoneNumber}
                    handleUserProfile={e => {
                      handleToggle(e);
                    }}
                  />
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
                      value={userProfile.weeklyCommittedHours}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.weeklyCommittedHours !== ''}
                    />
                    <FormFeedback>{formErrors.weeklyCommittedHours}</FormFeedback>
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
                      value={userProfile.collaborationPreference}
                      onChange={e => {
                        handleChange(e);
                      }}
                      invalid={formErrors.collaborationPreference !== ''}
                    />
                    <FormFeedback>{formErrors.collaborationPreference}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>Location</Label>
                </Col>

                <Col md="6 pr-0">
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Input
                          type="text"
                          name="location"
                          id="location"
                          placeholder="Location"
                          value={userProfile.location}
                          onChange={e => {
                            handleChange(e);
                          }}
                          invalid={formErrors.location !== ''}
                        />
                        <FormFeedback>{formErrors.location}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md="6 pr-0">
                      <Button color="secondary " block size="md">
                        Get Time Zone
                      </Button>
                      <Input
                        style={{
                          display: 'none',
                        }}
                        invalid={formErrors.getTimeZone !== ''}
                      />
                      <FormFeedback>{formErrors.getTimeZone}</FormFeedback>
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
                    <TimeZoneDropDown
                      selected={'America/Los_Angeles'}
                      id="timeZone"
                      onChange={e => handleChange(e)}
                    />
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
                <Button
                  className="btn btn-content p-2 pl-4 pr-4"
                  color="primary"
                  onClick={e => handleFormSubmit(e)}
                >
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
