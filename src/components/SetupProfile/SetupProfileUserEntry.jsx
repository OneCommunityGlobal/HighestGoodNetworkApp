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
  InputGroupAddon,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import TimeZoneDropDown from '../UserProfile/TimeZoneDropDown';
import ToggleSwitch from '../UserProfile/UserProfileEdit/ToggleSwitch';
import logo from '../../assets/images/logo.png';
import { ENDPOINTS } from 'utils/URL';
import httpService from 'services/httpService';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { getUserTimeZone } from '../../services/timezoneApiService';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { tokenKey } from '../../config.json';
import { setCurrentUser } from '../../actions/authActions';

const SetupProfileUserEntry = ({ token }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  const containSpecialCar = RegExp(/[!@#$%^&*(),.?":{}|<>]/);
  const containCap = RegExp(/[A-Z]/);
  const [APIkey, setAPIkey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: null,
    weeklyCommittedHours: 10,
    collaborationPreference: 'Zoom',
    privacySettings: { email: true, phoneNumber: true },
    jobTitle: '',
    timeZone: '',
    location: '',
    timeZoneFilter: '',
    token,
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    weeklyCommittedHours: '',
    collaborationPreference: '',
    jobTitle: '',
    timeZone: '',
    location: '',
    timeZoneFilter: '',
  });

  useEffect(() => {
    httpService.post(ENDPOINTS.TIMEZONE_KEY_BY_TOKEN(), { token }).then(response => {
      setAPIkey(response.data.userAPIKey);
    });
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  const getTimeZone = () => {
    if (!userProfile.location) {
      alert('Please enter valid location');
      return;
    }
    if (!APIkey) {
      console.log('Geocoding API missing');
      return;
    }

    getUserTimeZone(userProfile.location, APIkey)
      .then(response => {
        if (
          response.data.status.code === 200 &&
          response.data.results &&
          response.data.results.length
        ) {
          let timezone = response.data.results[0].annotations.timezone.name;

          setUserProfile(prevProfile => ({
            ...prevProfile,
            timeZoneFilter: timezone,
            timeZone: timezone,
          }));
        } else {
          alert('Invalid location or ' + response.data.status.message);
        }
      })
      .catch(err => console.log(err));
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    console.log('clicked');
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

    // Validate password

    if (userProfile.password.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password: 'Password is required',
      }));
    } else if (userProfile.password.trim().length < 8) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password: 'Password must be at least 8 characters long',
      }));
    } else if (
      !containCap.test(userProfile.password.trim()) &&
      !containSpecialCar.test(userProfile.password.trim())
    ) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password:
          'Password must contain special characters [!@#$%^&*(),.?":{}|<>] and capital letters.',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password: '',
      }));
    }

    // Validate confirm password

    if (userProfile.confirmPassword.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: 'Confirm password is required',
      }));
    } else if (userProfile.password.trim() !== userProfile.confirmPassword.trim()) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: 'Password confirmation does not match',
      }));
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: '',
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

    // if (userProfile.timeZoneFilter.trim() === '') {
    //   setFormErrors(prevErrors => ({
    //     ...prevErrors,
    //     timeZoneFilter: 'Set time zone is required',
    //   }));
    // } else {
    //   setFormErrors(prevErrors => ({
    //     ...prevErrors,
    //     timeZoneFilter: '',
    //   }));
    // }

    // Submit the form if there are no errors
    if (Object.values(formErrors).some(err => err === '')) {
      console.log('run');
      console.log(userProfile);
      httpService
        .post(ENDPOINTS.SETUP_NEW_USER_PROFILE(), userProfile)
        .then(response => {
          if (response.status === 200) {
            localStorage.setItem(tokenKey, response.data.token);
            httpService.setjwt(response.data.token);
            const decoded = jwtDecode(response.data.token);
            dispatch(setCurrentUser(decoded));
            history.push('/dashboard');
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
                  <Label>Password</Label>
                </Col>
                <Col md="3">
                  <InputGroup>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={userProfile.password}
                      onChange={e => {
                        handleChange(e);
                      }}
                      placeholder="Enter your password"
                      autoComplete="off"
                      invalid={formErrors.password !== ''}
                    />

                    <InputGroupAddon addonType="append">
                      <InputGroupText
                        id="showPassword"
                        onClick={togglePasswordVisibility}
                        style={{ backgroundColor: '#f5f5f5' }}
                      >
                        {showPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <FormFeedback>{formErrors.password}</FormFeedback>
                  </InputGroup>
                </Col>
                <Col md="3">
                  <InputGroup>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={userProfile.confirmPassword}
                      onChange={e => {
                        handleChange(e);
                      }}
                      placeholder="Confirm your password"
                      autoComplete="off"
                      invalid={formErrors.confirmPassword !== ''}
                    />

                    <InputGroupAddon addonType="append">
                      <InputGroupText
                        id="showConfirmPassword"
                        onClick={toggleConfirmPasswordVisibility}
                        style={{ backgroundColor: '#f5f5f5' }}
                      >
                        {showConfirmPassword ? (
                          <FontAwesomeIcon icon={faEyeSlash} />
                        ) : (
                          <FontAwesomeIcon icon={faEye} />
                        )}
                      </InputGroupText>
                    </InputGroupAddon>
                    <FormFeedback>{formErrors.confirmPassword}</FormFeedback>
                  </InputGroup>
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
                      <Button color="secondary " block size="md" onClick={getTimeZone}>
                        Get Time Zone
                      </Button>
                      <Input
                        style={{
                          display: 'none',
                        }}
                        invalid={formErrors.timeZoneFilter !== ''}
                      />
                      <FormFeedback>{formErrors.timeZoneFilter}</FormFeedback>
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
                      filter={userProfile.timeZoneFilter}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={{ size: 6, offset: 2 }}>
                  <div className="alert alert-info text-center">
                    Clicking the "Submit" button redirects you to your personalized profile
                    dashboard.
                  </div>
                </Col>
              </Row>

              <Row className="mt-1 mb-3">
                <Col md="12">
                  <Row>
                    <Col md="4" className="pl-4">
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
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SetupProfileUserEntry;
