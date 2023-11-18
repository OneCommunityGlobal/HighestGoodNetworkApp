import React, { useState, useEffect, useRef } from 'react';
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
  UncontrolledTooltip,
} from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import TimeZoneDropDown from '../UserProfile/TimeZoneDropDown';
import logo from '../../assets/images/logo.png';
import { ENDPOINTS } from 'utils/URL';
import httpService from 'services/httpService';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import getUserTimeZone from '../../services/timezoneApiService';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { tokenKey } from '../../config.json';
import { setCurrentUser } from '../../actions/authActions';
import RequirementModal from './requirementModal';
import HomeCountryModal from './homeCountryModal';
import ProfilePictureModal from './profilePictureModal';
import Image from 'react-bootstrap/Image';
import './SetupProfileUserEntry.css';

const SetupProfileUserEntry = ({ token, userEmail }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const containSpecialCar = RegExp(/[!@#$%^&*(),.?":{}|<>]/);
  const containCap = RegExp(/[A-Z]/);
  const containLow = RegExp(/[a-z]/);
  const containNumb = RegExp(/\d/);
  const [APIkey, setAPIkey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    email: userEmail,
    phoneNumber: null,
    weeklyCommittedHours: '10',
    collaborationPreference: 'Zoom',
    jobTitle: '',
    timeZone: '',
    location: {
      userProvided: '',
      coords: { lat: '', lng: '' },
      country: '',
      city: '',
    },
    timeZoneFilter: '',
    token,
    profilePicture: '',
  });
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    email: '',
    phoneNumber: '',
    collaborationPreference: '',
    jobTitle: '',
    timeZone: '',
    location: '',
    timeZoneFilterClicked: 'false',
  });
  const [requirementModalOpen, setRequirementModalOpen] = useState(false);
  const [requirementModalError, setrequirementModalError] = useState('');
  const [requirementsBoxChecked, setrequirementsBoxChecked] = useState(false);
  const [homecountryModalOpen, sethomecountryModalOpen] = useState(false);
  const [homecountryLocation, setHomecountryLocation] = useState({
    userProvided: '',
    coords: { lat: '', lng: '' },
    country: '',
    city: '',
  });
  const [profilePictureModalOpen, setprofilePictureModalOpen] = useState(false);
  const [profilePictureModalError, setprofilePictureModalError] = useState({
    message: '',
    type: '',
  });
  const pictureInputRef = useRef(null);

  //  get the timezone API key using the setup token
  useEffect(() => {
    httpService.post(ENDPOINTS.TIMEZONE_KEY_BY_TOKEN(), { token }).then(response => {
      setAPIkey(response.data.userAPIKey);
    });
  }, []);

  const toggleRequirementModal = () => {
    setrequirementModalError('');
    setRequirementModalOpen(prev => !prev);
  };

  const toggleHomecountryModal = () => {
    if (requirementsBoxChecked) {
      sethomecountryModalOpen(prev => !prev);
    } else {
      setrequirementModalError('You need to read and accept the requirements first');
    }
  };

  const toggleProfilePictureModal = () => {
    setprofilePictureModalOpen(prev => !prev);
  };

  const handleRequirementsBoxChecked = () => setrequirementsBoxChecked(!requirementsBoxChecked);

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

  const handleLocation = event => {
    const { id, value } = event.target;
    setUserProfile(prevProfile => ({
      ...prevProfile,
      [id]: {
        ...prevProfile.location,
        userProvided: value,
      },
    }));
  };

  const handleProfilePictureClick = () => {
    pictureInputRef.current.click();
  };

  const handleProfilePictureUpload = e => {
    
    const pictureFile = e.target.files[0];
    if (typeof pictureFile !== 'undefined') {
      const PictureSizeInKB = pictureFile.size / 1024;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!allowedTypes.includes(pictureFile.type)) {
        setprofilePictureModalError(prev => ({
          ...prev,
          message: 'File type not permitted. Allowed types are png, jpeg and jpg',
          type: 'fileType',
        }));
        setprofilePictureModalOpen(true);
        pictureInputRef.current.value = null
        return;
      }

      if (PictureSizeInKB > 50) {
        setprofilePictureModalError(prev => ({
          ...prev,
          message: `The file you are trying to upload exceeds the maximum size of 50KB. You can either
          choose a different file, or use an online file compressor.`,
          type: 'size',
        }));
        setprofilePictureModalOpen(true);
        pictureInputRef.current.value = null
        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(pictureFile);
      fileReader.onloadend = () => {
        setUserProfile(prevProfile => ({
          ...prevProfile,
          profilePicture: fileReader.result,
        }));
      };
    }
  };

  const phoneChange = phone => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      phoneNumber: phone,
    }));
  };

  const getTimeZone = () => {
    setFormErrors(prevErrors => ({
      ...prevErrors,
      timeZoneFilterClicked: '',
    }));
    const location = userProfile.location.userProvided;
    if (!location) {
      alert('Please enter valid location');
      return;
    }
    if (!APIkey) {
      console.log('Geocoding API key missing');
      return;
    }
    getUserTimeZone(location, APIkey)
      .then(response => {
        if (
          response.data.status.code === 200 &&
          response.data.results &&
          response.data.results.length
        ) {
          let timezone = response.data.results[0].annotations.timezone.name;
          let currentLocation = {
            userProvided: location,
            coords: {
              lat: response.data.results[0].geometry.lat,
              lng: response.data.results[0].geometry.lng,
            },
            country: response.data.results[0].components.country,
            city: response.data.results[0].components.city,
          };
          setUserProfile(prevProfile => ({
            ...prevProfile,
            timeZoneFilter: timezone,
            timeZone: timezone,
            location: currentLocation,
          }));
        } else {
          alert('Invalid location or ' + response.data.status.message);
        }
      })
      .catch(err => console.log(err));
  };

  const validateFormData = () => {
    // Validate firstName
    let isDataValid = true;
    if (userProfile.firstName.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: 'First Name is required',
      }));
      isDataValid = false;
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
      isDataValid = false;
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        lastName: '',
      }));
    }

    // Validate phone

    if (userProfile.phoneNumber === null || userProfile.phoneNumber.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        phoneNumber: 'Phone is required',
      }));
      isDataValid = false;
    } else if (userProfile.phoneNumber.trim().length < 10) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        phoneNumber: 'Phone is not valid',
      }));
      isDataValid = false;
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
      isDataValid = false;
    } else if (userProfile.password.trim().length < 8) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password: 'Password must be at least 8 characters long',
      }));
      isDataValid = false;
    } else if (
      !containCap.test(userProfile.password.trim()) ||
      !containSpecialCar.test(userProfile.password.trim()) ||
      !containLow.test(userProfile.password.trim()) ||
      !containNumb.test(userProfile.password.trim())
    ) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        password:
          'Password must contain special characters [!@#$%^&*(),.?":{}|<>], Uppercase, Lowercase and Number.',
      }));
      isDataValid = false;
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
      isDataValid = false;
    } else if (userProfile.password.trim() !== userProfile.confirmPassword.trim()) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: 'Password confirmation does not match',
      }));
      isDataValid = false;
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
      isDataValid = false;
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        jobTitle: '',
      }));
    }

    // Validate Video Call Preference

    if (userProfile.collaborationPreference.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        collaborationPreference: 'Video Call Preference can not be empty',
      }));
      isDataValid = false;
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        collaborationPreference: '',
      }));
    }

    // Validate Location

    if (userProfile.location.userProvided.trim() === '') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: 'Location is required',
      }));
      isDataValid = false;
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: '',
      }));
    }

    // Validate get time zone

    if (formErrors.timeZoneFilterClicked === 'false') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        timeZoneFilter: 'Set time zone is required',
      }));
      isDataValid = false;
    } else {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        timeZoneFilter: '',
      }));
    }

    return isDataValid;
  };

  const areAllHomecountryValuesFilled = () => {
    for (const key in homecountryLocation) {
      if (typeof homecountryLocation[key] === 'string' && homecountryLocation[key].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = e => {
    e.preventDefault();

    const isDataValid = validateFormData();
    const homeCoutryDataExists = areAllHomecountryValuesFilled();
    if (isDataValid) {
      const data = {
        firstName: userProfile.firstName.trim(),
        lastName: userProfile.lastName.trim(),
        password: userProfile.password.trim(),
        email: userProfile.email.trim().toLowerCase(),
        phoneNumber: userProfile.phoneNumber,
        weeklycommittedHours: Number(userProfile.weeklyCommittedHours.trim()),
        collaborationPreference: userProfile.collaborationPreference.trim(),
        privacySettings: {
          email: true,
          phoneNumber: true,
        },
        jobTitle: userProfile.jobTitle.trim(),
        timeZone: userProfile.timeZone.trim(),
        location: userProfile.location,
        token,
        homeCountry: homeCoutryDataExists ? homecountryLocation : userProfile.location,
        profilePicture: userProfile.profilePicture,
      };

      httpService
        .post(ENDPOINTS.SETUP_NEW_USER_PROFILE(), data)
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
          if (error.response.data === 'email already in use') {
            setFormErrors(prevErrors => ({
              ...prevErrors,
              email: 'This email is already in use, Please contact your manager',
            }));
            console.log('in akwkejkwer');
          }
          console.log(error.response);
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
                <Col md="2" className="text-md-right my-2 pb-1">
                  <Image
                    src={userProfile.profilePicture || '/Portrait_Placeholder.png'}
                    alt=""
                    id="profile-picture"
                  />
                </Col>
                <Col md="3" id="add-profile-picture-col">
                  <input
                    style={{ display: 'none' }}
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    ref={pictureInputRef}
                    onChange={handleProfilePictureUpload}
                    accept="image/png,image/jpeg, image/jpg"
                  />
                  <Button
                    className="btn btn-secondary btn-md btn-block"
                    id="add-profile-picture-btn"
                    onClick={handleProfilePictureClick}
                  >
                    add profile picture
                  </Button>
                  <ProfilePictureModal
                    isOpen={profilePictureModalOpen}
                    toggle={toggleProfilePictureModal}
                    error={profilePictureModalError}
                  />
                </Col>
                <Col md="3"></Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>
                    Name<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                  <Label>
                    Password<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                  <Label>
                    Job Title<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                  <Label>
                    Email/Phone<span style={{ color: 'red' }}>*</span>
                  </Label>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email"
                      value={userProfile.email}
                      readOnly={true}
                      invalid={formErrors.email !== ''}
                    />
                    <FormFeedback>{formErrors.email}</FormFeedback>
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <PhoneInput
                      country="US"
                      regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                      limitMaxLength="true"
                      value={userProfile.phoneNumber}
                      onChange={phone => phoneChange(phone)}
                      inputStyle={{ width: '100%' }}
                    />
                    <Input
                      style={{
                        display: 'none',
                      }}
                      invalid={formErrors.phoneNumber !== ''}
                    />
                    <FormFeedback>{formErrors.phoneNumber}</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>
                    Video Call Preference<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                  <Label>
                    Location<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                          value={userProfile.location.userProvided}
                          onChange={e => {
                            handleLocation(e);
                          }}
                          invalid={formErrors.location !== ''}
                        />
                        <FormFeedback>{formErrors.location}</FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col md="6 pr-0">
                      <Button
                        color="secondary "
                        block
                        size="md"
                        onClick={getTimeZone}
                        id="setup-rofile-entry-tz-btn"
                      >
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
                <Col md="2" className="text-md-right">
                  <Label className="w-100  text-wrap">
                    Do you represent a country other than your current residence?
                    <i className="fa fa-info-circle ml-1" id="countryRep" />
                    <UncontrolledTooltip
                      placement="right"
                      target="countryRep"
                      id="coutry-rep-tooltip"
                    >
                      <p className="alert alert-info" id="country-rep-info">
                        One Community is a global effort and international team that has had
                        volunteers volunteering from and/or representing 60 countries around the
                        world. Complete this field if you are currently residing in a country other
                        than your own and wish to be represented on our global contributors map with
                        your birth country instead of your current country or residence.
                      </p>
                    </UncontrolledTooltip>
                  </Label>
                </Col>

                <Col md="6 pr-0">
                  <Row>
                    <Col md="6">
                      <Button
                        color="secondary "
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
                    <Col md="6 pr-0">
                      <Button
                        color="secondary "
                        block
                        size="md"
                        id="setup-rofile-entry-hc-btn"
                        onClick={toggleHomecountryModal}
                      >
                        Set Home Country
                      </Button>
                      <HomeCountryModal
                        isOpen={homecountryModalOpen}
                        toggle={toggleHomecountryModal}
                        apiKey={APIkey}
                        setLocation={setHomecountryLocation}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col md="2" className="text-md-right my-2">
                  <Label>
                    Time Zone<span style={{ color: 'red' }}>*</span>
                  </Label>
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
                    Clicking the Submit button redirects you to your personalized profile dashboard.
                  </div>
                </Col>
              </Row>
              <Row className="mt-1 mb-3">
                <Col md="12">
                  <Row>
                    <Col md="4" className="pl-4">
                      <Button
                        type="submit"
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
