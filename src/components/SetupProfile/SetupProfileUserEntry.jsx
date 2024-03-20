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
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupText,
  UncontrolledTooltip,
} from 'reactstrap';
import PhoneInput from 'react-phone-input-2';
import TimeZoneDropDown from '../UserProfile/TimeZoneDropDown';
import logo from '../../assets/images/logo.png';
import { ENDPOINTS } from 'utils/URL';
import httpService from 'services/httpService';
import { useHistory } from 'react-router-dom';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { tokenKey } from '../../config.json';
import { setCurrentUser } from '../../actions/authActions';
import HomeCountryModal from './homeCountryModal';
import ProfilePictureModal from './profilePictureModal';
import DeleteHoumeCountryModal from './deleteHomeCountryModal';
import  collaborationOptions  from './collaborationSuggestionData' ;
import Image from 'react-bootstrap/Image';
import 'react-phone-input-2/lib/style.css';
import './SetupProfileUserEntry.css';

const SetupProfileUserEntry = ({ token, userEmail }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const containSpecialCar = RegExp(/[!@#$%^&*(),.?":{}|<>]/);
  const containCap = RegExp(/[A-Z]/);
  const containLow = RegExp(/[a-z]/);
  const containNumb = RegExp(/\d/);
  const containOnlyLetters = RegExp(/^[a-zA-Z\s]+$/);
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
    timeZone: 'America/Los_Angeles',
    location: {
      userProvided: '',
      coords: { lat: '', lng: '' },
      country: '',
      city: '',
    },
    timeZoneFilter: 'America/Los_Angeles',
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
  const [totalCountryCount, setTotalCountryCount] = useState('');
  const [deleteHoumeCountryModal, setDeleteHoumeCountryModal] = useState(false);

  const [collaborationSuggestionOpen, setCollaborationSuggestionOpen] = useState(false);
  const [collaborationSuggestions, setCollaborationSuggestions] = useState([]);
  

  const pictureInputRef = useRef(null);

  const numberToWords = n => {
    if (n < 0) return false;
    const single_digit = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
    ];
    const double_digit = [
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const below_hundred = [
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];
    if (n === 0) return 'Zero';
    function translate(n) {
      let word = '';
      if (n < 10) {
        word = single_digit[n] + ' ';
      } else if (n < 20) {
        word = double_digit[n - 10] + ' ';
      } else if (n < 100) {
        let rem = translate(n % 10);
        word = below_hundred[(n - (n % 10)) / 10 - 2] + ' ' + rem;
      } else if (n < 1000) {
        word = single_digit[Math.trunc(n / 100)] + ' Hundred ' + translate(n % 100);
      } else if (n < 1000000) {
        word = translate(parseInt(n / 1000)).trim() + ' Thousand ' + translate(n % 1000);
      } else if (n < 1000000000) {
        word = translate(parseInt(n / 1000000)).trim() + ' Million ' + translate(n % 1000000);
      } else {
        word = translate(parseInt(n / 1000000000)).trim() + ' Billion ' + translate(n % 1000000000);
      }
      return word;
    }
    const result = translate(n);
    return result.trim();
  };


  useEffect(() => {
    httpService.get(ENDPOINTS.GET_TOTAL_COUNTRY_COUNT()).then(response => {
      const total = numberToWords(Number(response.data.CountryCount));
      setTotalCountryCount(total);
    });
  }, []);

  const togglecollaborationSuggestionDropdown = () => {
    setCollaborationSuggestionOpen(!collaborationSuggestionOpen);
  };

  const setCollaborationSuggestionsData = e => {
    const value = e.target.value;
    if (value.length < 1) {
      setCollaborationSuggestionOpen(false);
      return;
    }
    const filteredSuggestions = collaborationOptions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(value.toLowerCase()),
    );

    setCollaborationSuggestions(filteredSuggestions);
    setCollaborationSuggestionOpen(true);
  };

  const handleCollaborationSuggestionClick = suggestion => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      collaborationPreference: suggestion,
    }));
    setCollaborationSuggestionOpen(false);
  };

  const toggleHomecountryModal = () => {
    sethomecountryModalOpen(prev => !prev);
  };

  const toggleDeleteHoumeCountryModal = () => {
    setDeleteHoumeCountryModal(prev => !prev);
  };

  const toggleProfilePictureModal = () => {
    setprofilePictureModalOpen(prev => !prev);
  };

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
        pictureInputRef.current.value = null;
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
        pictureInputRef.current.value = null;
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
    setFormErrors(prevErrors => ({
      ...prevErrors,
      location: '',
    }));

    const location = userProfile.location.userProvided;
    if (!location) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: 'Please enter valid location',
      }));
      return;
    }

    httpService.post(ENDPOINTS.TIMEZONE_LOCATION(location),{token}).then(response => {
      if(response.status === 200) {
        const { timezone, currentLocation } = response.data;
        setUserProfile(prevProfile => ({
          ...prevProfile,
          timeZoneFilter: timezone,
          timeZone: timezone,
          location: currentLocation
        }));
      }
    }).catch(err => {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        location: 'Invalid location',
      }));
      alert(`An error occurred : ${err.response.data}`);
     })
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
    } else if (!containOnlyLetters.test(userProfile.firstName.trim())) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        firstName: 'Please enter a valid first name',
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
    } else if (!containOnlyLetters.test(userProfile.lastName.trim())) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        lastName: 'Please enter a valid last name',
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
    } else if (!containOnlyLetters.test(userProfile.jobTitle.trim())) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        jobTitle: 'Please enter a valid job title',
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
    }else if (!containOnlyLetters.test(userProfile.jobTitle.trim())) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        jobTitle: 'Please enter a valid job title',
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
      if (key === 'city') {
        continue;
      }
      if (typeof homecountryLocation[key] === 'string' && homecountryLocation[key].trim() === '') {
        return false;
      }
    }
    return true;
  };

  const capitalizeString = (s) => {
    
    const words = s.split(' ');
  
    const capitalizedWords = words.map(word => {
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return '';
      }
    });
  
    const capitalizedString = capitalizedWords.join(' ');
  
    return capitalizedString;
  }

  const handleFormSubmit = e => {
    e.preventDefault();

    const isDataValid = validateFormData();
    const homeCoutryDataExists = areAllHomecountryValuesFilled();
    if (isDataValid) {

      const data = {
        firstName: capitalizeString(userProfile.firstName.trim()),
        lastName: capitalizeString(userProfile.lastName.trim()),
        password: userProfile.password.trim(),
        email: userProfile.email.trim().toLowerCase(),
        phoneNumber: userProfile.phoneNumber,
        weeklycommittedHours: Number(userProfile.weeklyCommittedHours.trim()),
        collaborationPreference: capitalizeString(userProfile.collaborationPreference.trim()),
        privacySettings: {
          email: true,
          phoneNumber: true,
        },
        jobTitle: capitalizeString(userProfile.jobTitle.trim()),
        timeZone: userProfile.timeZone.trim(),
        location: {
          ...userProfile.location,
          userProvided: capitalizeString(userProfile.location.userProvided.trim()),
        }, 
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
          if (error?.response?.data === 'email already in use') {
            setFormErrors(prevErrors => ({
              ...prevErrors,
              email: 'This email is already in use, Please contact your manager',
            }));
          }
          console.log(error?.response);
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
      <Container id="profile-setup-user-entry-form-container">
        <Form id="profile-setup-user-entry-form">
          <Row>
            <Col md="3" className="text-md-right pb-3">
              <Image
                src={userProfile.profilePicture || '/Portrait_Placeholder.png'}
                alt=""
                id="profile-picture"
              />
            </Col>
            <Col md="8" id="add-profile-picture-col">
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
            <Col md="4"></Col>
          </Row>
          <Row>
            <Col md="3" className="text-md-right">
              <Label>
                Name<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="4">
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
            <Col md="4">
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
            <Col md="3" className="text-md-right">
              <Label>
                Password<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="4">
              <InputGroup id="password-input-group">
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
            <Col md="4">
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
          <Row className="mt-3">
            <Col md="3" className="text-md-right">
              <Label>
                Job Title<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="8">
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
            <Col md="3" className="text-md-right">
              <Label>
                Email/Phone<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="4">
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
            <Col md="4">
              <FormGroup>
                <PhoneInput
                  country="US"
                  regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                  limitMaxLength="true"
                  value={userProfile.phoneNumber}
                  onChange={phone => phoneChange(phone)}
                  inputStyle={{ height: 'auto', width: '100%', fontSize: 'inherit' }}
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
            <Col md="3" className="text-md-right">
              <Label>
                Video Call Preference<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="8">
              <FormGroup>
                <Input
                  type="text"
                  name="collaborationPreference"
                  id="collaborationPreference"
                  placeholder="Skype, Zoom, etc."
                  value={userProfile.collaborationPreference}
                  onChange={e => {
                    handleChange(e);
                    setCollaborationSuggestionsData(e);
                  }}
                  invalid={formErrors.collaborationPreference !== ''}
                />
                <InputGroupAddon addonType="append">
                  <Dropdown
                    isOpen={collaborationSuggestionOpen}
                    toggle={togglecollaborationSuggestionDropdown}
                    style={{ width: '100%'}}
                    
                  >
                    <DropdownToggle tag={'span'}></DropdownToggle>
                    {collaborationSuggestions.length > 0 && (
                      <DropdownMenu id="collaboration-suggestion-dd" direction="down">
                        {collaborationSuggestions.map((suggestion, index) => (
                          <DropdownItem
                            key={index}
                            onClick={() => handleCollaborationSuggestionClick(suggestion.name)}
                            className="collaboration-suggestion-dd-item"
                          >
                            <img className='collaboration-suggestion-dd-item-logo' src={suggestion.logo}/>  
                            <p>{suggestion.name}</p>
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    )}
                  </Dropdown>
                </InputGroupAddon>
                <FormFeedback>{formErrors.collaborationPreference}</FormFeedback>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col md="3" className="text-md-right">
              <Label className="w-100  text-wrap">
                Home Country Option
                <i className="fa fa-info-circle ml-1" id="countryRep" />
                <UncontrolledTooltip placement="right" target="countryRep" id="coutry-rep-tooltip">
                  <p className="alert alert-info" id="country-rep-info">
                    One Community is a global effort and international team that has had volunteers
                    volunteering from and/or representing <b>{totalCountryCount}</b> different
                    countries around the world. Complete this field if you are currently residing in
                    a country other than your own and wish to be represented on our global
                    contributors map with your birth country instead of your current city and/or
                    country.
                  </p>
                </UncontrolledTooltip>
              </Label>
            </Col>
            <Col md="8">
              <Button
                color="secondary "
                block
                size="md"
                id="setup-rofile-entry-hc-btn"
                onClick={toggleHomecountryModal}
              >
                Enter and Represent a Country Other Than Your Current Residence
              </Button>
              <HomeCountryModal
                isOpen={homecountryModalOpen}
                toggle={toggleHomecountryModal}
                setLocation={setHomecountryLocation}
                token={token}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md="3" className="text-md-right">
              <Label>
                Location<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="4">
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
            <Col md="4">
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
          <Row>
            <Col md="3" className="text-md-right">
              <Label>
                Time Zone<span style={{ color: 'red' }}>*</span>
              </Label>
            </Col>
            <Col md="8">
              <FormGroup>
                <TimeZoneDropDown
                  id="timeZone"
                  onChange={e => handleChange(e)}
                  filter={userProfile.timeZoneFilter}
                />
              </FormGroup>
            </Col>
          </Row>
          {homecountryLocation?.country && (
            <Row>
              <Col md={{ size: 8, offset: 3 }}>
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                  <p style={{ textAlign: 'center', margin: '0px' }}>
                    Thank you for choosing to represent your home country, you’ll be shown (with
                    just your first name and last initial) on our world map as representing
                    <b>
                      {homecountryLocation?.city ? ` ${homecountryLocation?.city}, ` : ' '}
                      {homecountryLocation?.country}
                    </b>
                    .
                  </p>
                  <button type="button" className="close" onClick={toggleDeleteHoumeCountryModal}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </Col>
            </Row>
          )}
          <DeleteHoumeCountryModal
            isOpen={deleteHoumeCountryModal}
            toggle={toggleDeleteHoumeCountryModal}
            setLocation={setHomecountryLocation}
          />
          <Row>
            <Col md={{ size: 8, offset: 3 }}>
              <div className="alert alert-info text-center">
                Clicking the Submit button redirects you to your personalized profile dashboard.
              </div>
            </Col>
          </Row>

          <Row className="mt-1 mb-3">
            <Col md={{ size: 2, offset: 3 }}>
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
        </Form>
      </Container>
    </div>
  );
};

export default SetupProfileUserEntry;
