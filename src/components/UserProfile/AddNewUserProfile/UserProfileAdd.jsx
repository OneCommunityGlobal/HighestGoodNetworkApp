import React, { Component } from 'react';
import { StickyContainer } from 'react-sticky';
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
  TabPane,
  TabContent,
  NavItem,
  NavLink,
  Nav,
} from 'reactstrap';
import DuplicateNamePopup from 'components/UserManagement/DuplicateNamePopup';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import './UserProfileAdd.scss';
import { createUser, resetPassword } from '../../../services/userProfileService';
import { toast } from 'react-toastify';
import TeamsTab from '../TeamsAndProjects/TeamsTab';
import ProjectsTab from '../TeamsAndProjects/ProjectsTab';
import { connect } from 'react-redux';
import { assign, get } from 'lodash';
import { getUserProfile, updateUserProfile, clearUserProfile } from '../../../actions/userProfile';
import {
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import { fetchAllProjects } from 'actions/projects';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import classnames from 'classnames';
import TimeZoneDropDown from '../TimeZoneDropDown';
import { getUserTimeZone } from 'services/timezoneApiService';
import hasPermission from 'utils/permissions';
import NewUserPopup from 'components/UserManagement/NewUserPopup';
import { boxStyle } from 'styles';
import WeeklySummaryOptions from './WeeklySummaryOptions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isValidGoogleDocsUrl, isValidUrl } from 'utils/checkValidURL';

const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
const DATE_PICKER_MIN_DATE = '01/01/2010';
const nextDay = new Date();
nextDay.setDate(nextDay.getDate()+1);

class AddUserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfiles: this.props.userProfiles,
      popupOpen: false,
      weeklyCommittedHours: 10,
      teams: [],
      projects: [],
      userProfile: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: null,
        weeklyCommittedHours: 10,
        collaborationPreference: 'Zoom',
        role: 'Volunteer',
        privacySettings: { blueSquares: true, email: true, phoneNumber: true },
        jobTitle: '',
        googleDoc: '',
        dropboxDoc: '',
        timeZone: '',
        location: '',
        showphone: true,
        weeklySummaryOption: 'Required',
        createdDate: nextDay,
      },
      formValid: {},
      formErrors: {
        firstName: 'First Name is required',
        lastName: 'Last Name is required',
        email: 'Email is required',
        phoneNumber: 'Phone Number is required',
      },
      location: '',
      timeZoneFilter: '',
      formSubmitted: false,
    };

    
    const { user } = this.props.auth;
    this.canAddDeleteEditOwners = user && user.role === 'Owner'
  }

  popupClose = () => {
    this.setState({
      popupOpen: false,
    });
  };

  componentDidMount() {
    this.state.showphone = true;
    this.onCreateNewUser();
  }
  
  
  render() {
    const { firstName, email, lastName, phoneNumber, role, jobTitle } = this.state.userProfile;
    const phoneNumberEntered =
      this.state.userProfile.phoneNumber === null ||
      this.state.userProfile.phoneNumber.length === 0;
    return (
      <StickyContainer>
        <DuplicateNamePopup
          open={this.state.popupOpen}
          popupClose={this.popupClose}
          onClose={this.props.closePopup}
          createUserProfile={this.createUserProfile}
        />
        <Container className="emp-profile">
          <Row>
            <Col md="12">
              <Form>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label>Name</Label>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={firstName}
                        onChange={this.handleUserProfile}
                        placeholder="First Name"
                        invalid={this.state.formErrors.firstName}
                      />
                      <FormFeedback>{this.state.formErrors.firstName}</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={lastName}
                        onChange={this.handleUserProfile}
                        placeholder="Last Name"
                        invalid={this.state.formErrors.lastName}
                      />
                      <FormFeedback>{this.state.formErrors.lastName}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 3, offset: 1 }} className="text-md-right my-2">
                    <Label>Job Title</Label>
                  </Col>
                  <Col md={{ size: 6 }}>
                    <FormGroup>
                      <Input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={this.handleUserProfile}
                        placeholder="Job Title"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label>Email</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={this.handleUserProfile}
                        placeholder="Email"
                        invalid={this.state.formErrors.email}
                      />
                      <FormFeedback>{this.state.formErrors.email}</FormFeedback>
                      <ToggleSwitch
                        switchType="email"
                        state={this.state.userProfile.privacySettings?.email}
                        handleUserProfile={this.handleUserProfile}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label>Phone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <PhoneInput
                        country="US"
                        regions={['america', 'europe', 'asia', 'oceania', 'africa']}
                        limitMaxLength="true"
                        value={phoneNumber}
                        onChange={phone => this.phoneChange(phone)}
                      />
                      {phoneNumberEntered && (
                        <div className="required-user-field">
                          {this.state.formErrors.phoneNumber}
                        </div>
                      )}
                      <ToggleSwitch
                        switchType="phone"
                        state={this.state.userProfile.privacySettings?.phoneNumber}
                        handleUserProfile={this.handleUserProfile}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label>Weekly Committed Hours</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="number"
                        name="weeklyCommittedHours"
                        id="weeklyCommittedHours"
                        value={this.state.userProfile.weeklyCommittedHours}
                        onChange={this.handleUserProfile}
                        onFocus={this.handleUserProfile}
                        placeholder="Weekly Committed Hours"
                        invalid={
                          this.state.formValid.weeklyCommittedHours === undefined
                            ? false
                            : !this.state.formValid.weeklyCommittedHours
                        }
                      />
                      <FormFeedback>{this.state.formErrors.weeklyCommittedHours}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label>Role</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="select"
                        name="role"
                        id="role"
                        defaultValue="Volunteer"
                        onChange={this.handleUserProfile}
                      >
                        {this.props.role.roles.map(({ roleName }) => {
                          if (roleName === 'Owner') return;
                          return <option value={roleName}>{roleName}</option>;
                        })}
                        {this.canAddDeleteEditOwners && <option value="Owner">Owner</option>}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className="weeklySummaryOptionsLabel">Weekly Summary Options</Label>
                  </Col>
                  <Col md="6">
                    <WeeklySummaryOptions handleUserProfile={this.handleUserProfile} />
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label>Video Call Preference</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="collaborationPreference"
                        id="collaborationPreference"
                        value={this.state.userProfile.collaborationPreference}
                        onChange={this.handleUserProfile}
                        placeholder="Skype, Zoom, etc."
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label>Admin Document</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="googleDoc"
                        id="googleDoc"
                        value={this.state.userProfile.googleDoc}
                        onChange={this.handleUserProfile}
                        placeholder="Google Doc"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label>Link to Media Files</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="dropboxDoc"
                        id="dropboxDoc"
                        value={this.state.userProfile.dropboxDoc}
                        onChange={this.handleUserProfile}
                        placeholder="DropBox Folder"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4, offset: 0 }} className="text-md-right my-2">
                    <Label>Location</Label>
                  </Col>
                  <Col md="6">
                    <Row>
                      <Col md="6">
                        <Input id="location" onChange={this.handleLocation} />
                      </Col>
                      <Col md="6">
                        <div className="w-100 pt-1 mb-2 mx-auto">
                          <Button
                            color="secondary"
                            block
                            size="sm"
                            onClick={this.onClickGetTimeZone}
                            style={boxStyle}
                          >
                            Get Time Zone
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 3, offset: 1 }} className="text-md-right my-2">
                    <Label>Time Zone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <TimeZoneDropDown
                        filter={this.state.timeZoneFilter}
                        onChange={this.handleUserProfile}
                        selected={'America/Los_Angeles'}
                        id="timeZone"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label>Start Date</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                    <div className="date-picker-item">                        
                      <DatePicker
                        selected={this.state.userProfile.createdDate}
                        minDate={new Date(DATE_PICKER_MIN_DATE)}
                        onChange={date => this.setState({ userProfile: {
                          ...this.state.userProfile,
                          createdDate: date,
                        }})}
                        className="form-control"
                      />
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <TabContent id="myTabContent">
                <TabPane>
                  <ProjectsTab
                    userProjects={this.state.projects}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={true}
                    role={this.props.auth.user.role}
                    edit
                  />
                </TabPane>
                <TabPane>
                  <TeamsTab
                    userTeams={this.state.teams}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onDeleteTeam={this.onDeleteTeam}
                    isUserAdmin={true}
                    role={this.props.auth.user.role}
                    edit
                    userProfile={this.state.userProfile}
                  />
                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Row>
            {/* <Col></Col> */}
            <Col md="12">
              <div className="w-50 pt-4 mx-auto">
                <Button
                  color="primary"
                  block
                  size="lg"
                  onClick={() => this.createUserProfile(false)}
                  style={boxStyle}
                >
                  Create
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </StickyContainer>
    );
  }

  onDeleteTeam = deletedTeamId => {
    const teams = [...this.state.teams];
    const filteredTeam = teams.filter(team => team._id !== deletedTeamId);

    this.setState({
      teams: filteredTeam,
    });
  };

  onDeleteProject = deletedProjectId => {
    const projects = [...this.state.projects];
    const _projects = projects.filter(project => project._id !== deletedProjectId);
    this.setState({
      projects: _projects,
    });
  };

  onAssignTeam = assignedTeam => {
    const teams = [...this.state.teams];
    teams.push(assignedTeam);
    this.setState({
      teams: teams,
    });
  };

  onAssignProject = assignedProject => {
    const projects = [...this.state.projects];
    projects.push(assignedProject);

    this.setState({
      projects: projects,
    });
  };

  onCreateNewUser = () => {
    this.props.fetchAllProjects();

    const initialUserProject = this.props.allProjects.projects.filter(
      ({ projectName }) => projectName === 'Orientation and Initial Setup',
    );

    this.setState({ projects: initialUserProject });
  };

  // Function to call TimeZoneService with location and key
  onClickGetTimeZone = () => {
    const location = this.state.location;
    const key = this.props.timeZoneKey;
    if (!location) {
      alert('Please enter valid location');
      return;
    }
    if (key) {
      getUserTimeZone(location, key)
        .then(response => {
          if (
            response.data.status.code === 200 &&
            response.data.results &&
            response.data.results.length
          ) {
            let timezone = response.data.results[0].annotations.timezone.name;
            this.setState({
              ...this.state,
              timeZoneFilter: timezone,
              userProfile: {
                ...this.state.userProfile,
                timeZone: timezone,
              },
            });
          } else {
            alert('Invalid location or ' + response.data.status.message);
          }
        })
        .catch(err => console.log(err));
    }
  };

  fieldsAreValid = () => {
    const firstLength = this.state.userProfile.firstName !== '';
    const lastLength = this.state.userProfile.lastName !== '';
    const phone = this.state.userProfile.phoneNumber;

    if (phone === null) {
      toast.error('Phone Number is required');
      return false;
    } else if (firstLength && lastLength && phone.length >= 9) {
      return true;
    } else {
      toast.error('Please fill all the required fields');
      return false;
    }
  };

  checkIfDuplicate = (firstName, lastName) => {
    let { userProfiles } = this.state.userProfiles;

    const duplicates = userProfiles.filter(user => {
      return (
        user.firstName.toLowerCase() === firstName.toLowerCase() &&
        user.lastName.toLowerCase() === lastName.toLowerCase()
      );
    });

    if (duplicates.length > 0) return true;
    else return false;
  };

  createUserProfile = allowsDuplicateName => {
    let that = this;
    const {
      firstName,
      email,
      lastName,
      phoneNumber,
      role,
      privacySettings,
      collaborationPreference,
      googleDoc,
      dropboxDoc,
      jobTitle,
      timeZone,
      location,
      weeklySummaryOption,
      createdDate,
    } = that.state.userProfile;

    const userData = {
      password: process.env.REACT_APP_DEF_PWD,
      role: role,
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      phoneNumber: phoneNumber,
      bio: '',
      weeklycommittedHours: that.state.userProfile.weeklyCommittedHours,
      weeklySummaryOption: weeklySummaryOption,
      personalLinks: [],
      adminLinks: [],
      teams: this.state.teams,
      projects: this.state.projects,
      email: email,
      privacySettings: privacySettings,
      collaborationPreference: collaborationPreference,
      timeZone: timeZone,
      location: location,
      allowsDuplicateName: allowsDuplicateName,
      createdDate: createdDate,
    };

    this.setState({ formSubmitted: true });

    if (googleDoc) {
      if (isValidGoogleDocsUrl(googleDoc)) {
        userData.adminLinks.push({ Name: 'Google Doc', Link: googleDoc });
      } else{
        toast.error('Invalid Google Doc link. Please provide a valid Google Doc URL.');
        this.setState({
          formValid: {
            ...that.state.formValid,
            googleDoc: false,
          },
          formErrors: {
            ...that.state.formErrors,
            googleDoc: 'Invalid Google Doc URL',
          },
        });
        return;
      }
    }
    if (dropboxDoc) {
      if (isValidUrl(dropboxDoc)) {
          userData.adminLinks.push({ Name: 'Media Folder', Link: dropboxDoc });
        } else {
          toast.error('Invalid DropBox link. Please provide a valid Drop Box URL.');
          this.setState({
            formValid: {
              ...that.state.formValid,
              dropboxDoc: false,
            },
            formErrors: {
              ...that.state.formErrors,
              dropboxDoc: 'Invalid Dropbox Link URL',
            },
          });
          return;
        }
    }
    if (this.fieldsAreValid()) {
      this.setState({ showphone: false });
      if (!email.match(patt)) {
        toast.error('Email is not valid. Please include @ followed by .com format');
      } else {
        createUser(userData)
          .then(res => {
            if (res.data.warning) {
              toast.warn(res.data.warning);
            } else if (
              this.checkIfDuplicate(userData.firstName, userData.lastName) &&
              !allowsDuplicateName
            ) {
              this.setState({
                popupOpen: true,
              });
              return;
            } else {
              toast.success('User profile created.');
              this.state.userProfile._id = res.data._id;
              if(this.state.teams.length > 0){
                this.state.teams.forEach((team) => {
                  this.props.addTeamMember(team._id, res.data._id, res.data.firstName, res.data.lastName)
                })
              }
            }
            this.props.userCreated();
          })
          .catch(err => {
            if (err.response?.data?.type) {
              switch (err.response.data.type) {
                case 'email':
                  this.setState({
                    formValid: {
                      ...that.state.formValid,
                      email: false,
                    },
                    formErrors: {
                      ...that.state.formErrors,
                      email: 'Email already exists',
                    },
                  });
                  break;
                case 'phoneNumber':
                  this.setState({
                    formValid: {
                      ...that.state.formValid,
                      phoneNumber: false,
                      showphone: false,
                    },
                    formErrors: {
                      ...that.state.formErrors,
                      phoneNumber: 'Phone number already exists',
                    },
                  });
                  break;
                case 'name':
                  if (
                    this.checkIfDuplicate(userData.firstName, userData.lastName) &&
                    !allowsDuplicateName
                  ) {
                    this.setState({
                      popupOpen: true,
                    });
                  }
                  break;
              }
            }
            toast.error(
              err.response?.data?.error ||
                'An unknown error occurred while attempting to create this user.',
            );
          });
      }
    }
  };

  handleImageUpload = async e => {
    e.preventDefault();

    const file = e.target.files[0];

    const allowedTypesString = 'image/png,image/jpeg, image/jpg';
    const allowedTypes = allowedTypesString.split(',');
    let isValid = true;
    let imageUploadError = '';
    if (!allowedTypes.includes(file.type)) {
      imageUploadError = `File type must be ${allowedTypesString}.`;
      isValid = false;

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      });
    }
    const filesizeKB = file.size / 1024;

    if (filesizeKB > 50) {
      imageUploadError = `\n The file you are trying to upload exceeds the maximum size of 50KB. You can either
                            choose a different file, or use an online file compressor.`;
      isValid = false;

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.setState({
        imageUploadError: '',
        userProfile: {
          ...this.state.userProfile,
          profilePic: reader.result,
        },
      });
    };
  };

  phoneChange = phone => {
    const { userProfile, formValid, formErrors } = this.state;
    this.setState({
      userProfile: {
        ...userProfile,
        phoneNumber: phone,
        showphone: false,
      },
      formValid: {
        ...formValid,
        phoneNumber: phone.length > 10,
        showphone: false,
      },
      formErrors: {
        ...formErrors,
        phoneNumber: phone.length > 10 ? '' : 'Please enter valid phone number',
      },
    });
  };

  handleLocation = e => {
    this.setState({ ...this.state, location: e.target.value });
    this.handleUserProfile(e);
  };

  handleUserProfile = event => {
    const { userProfile, formValid, formErrors } = this.state;

    switch (event.target.id) {
      case 'firstName':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value,
            // [event.target.id]: event.target.value.trim(),   removed trim to allow space in name field
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.length > 0,
          },
          formErrors: {
            ...formErrors,
            firstName: event.target.value.length > 0 ? '' : 'First Name required',
          },
        });
        break;
      case 'lastName':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value,
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.length > 0,
          },
          formErrors: {
            ...formErrors,
            lastName: event.target.value.length > 0 ? '' : 'Last Name required',
          },
        });
        break;
      case 'email':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.match(patt),
          },
          formErrors: {
            ...formErrors,
            email: event.target.value.match(patt) ? '' : 'Email is not valid',
          },
        });
        break;
      case 'location':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'timeZone':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'jobTitle':
        this.setState({
          ...this.state,
          userProfile: {
            ...this.state.userProfile,
            jobTitle: event.target.value,
          },
        });
        break;
      case 'weeklyCommittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
          formErrors: {
            ...formErrors,
            weeklyCommittedHours: !!event.target.value ? '' : 'Committed hours can not be empty',
          },
        });
        break;
      case 'weeklySummaryOption':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'collaborationPreference':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'role':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'googleDoc':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value,
          },
        });
        break;
      case 'dropboxDoc':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value,
          },
        });
        break;
      case 'emailPubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              email: !userProfile.privacySettings?.email,
            },
          },
        });
        break;
      case 'phonePubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              phoneNumber: !userProfile.privacySettings?.phoneNumber,
            },
          },
        });
        break;
      default:
        this.setState({
          ...userProfile,
        });
    }
  };
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProjects: state.userProjects,
  allProjects: get(state, 'allProjects'),
  allTeams: state,
  timeZoneKey: state.timeZoneAPI.userAPIKey,
  role: state.role,
  state,
});

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
  fetchAllProjects,
  hasPermission,
})(AddUserProfile);
