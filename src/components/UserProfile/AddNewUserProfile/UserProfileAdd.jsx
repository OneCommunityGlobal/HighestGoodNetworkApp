import React, { Component, useState } from 'react';
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
} from 'reactstrap';
import CommonInput from 'components/common/Input';
import DuplicateNamePopup from 'components/UserManagement/DuplicateNamePopup';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import './UserProfileAdd.scss';
import { createUser } from '../../../services/userProfileService';
import { toast } from 'react-toastify';
import TeamsTab from '../TeamsAndProjects/TeamsTab';
import ProjectsTab from '../TeamsAndProjects/ProjectsTab';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { getUserProfile, clearUserProfile } from '../../../actions/userProfile';
import {
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction';

import { fetchAllProjects } from 'actions/projects';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import TimeZoneDropDown from '../TimeZoneDropDown';
import hasPermission from 'utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import WeeklySummaryOptions from './WeeklySummaryOptions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { isValidGoogleDocsUrl, isValidMediaUrl } from 'utils/checkValidURL';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
const DATE_PICKER_MIN_DATE = '01/01/2010';

class UserProfileAdd extends Component {
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
        location: {
          userProvided: '',
          coords: { lat: '', lng: '' },
          country: '',
          city: '',
        },
        showphone: true,
        weeklySummaryOption: 'Required',
        createdDate: new Date(),
        actualEmail: '',
        actualPassword: '',
        startDate: new Date(),
        actualConfirmedPassword: '',
      },
      formValid: {},
      formErrors: {
        firstName: 'First Name is required',
        lastName: 'Last Name is required',
        email: 'Email is required',
        phoneNumber: 'Phone Number is required',
        actualEmail: 'Actual Email is required',
        actualPassword: 'Actual Password is required',
        actualConfirmedPassword: 'Actual Confirmed Password is required',
        jobTitle: 'Job Title is required',
      },
      timeZoneFilter: '',
      formSubmitted: false,
      teamCode: '',
      codeValid: false,
      inputAutoComplete: [],
      inputAutoStatus: null,
      isLoading: false,
    };

    const { user } = this.props.auth;
    this.canAddDeleteEditOwners = user && user.role === 'Owner';
  }

  popupClose = () => {
    this.setState({
      popupOpen: false,
    });
  };

  setCodeValid = isValid => {
    this.setState({
      codeValid: isValid,
    });
  };

  componentDidMount() {
    this.state.showphone = true;
    this.onCreateNewUser();
    this.fetchTeamCodeAllUsers(); 
  }

  // Replace fetchTeamCodeAllUsers with a method that dispatches getAllTeamCode
  fetchTeamCodeAllUsers = async() => {
    const url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();
    try {
      this.setState({isLoading:true})
     
      const response = await axios.get(url);
      const stringWithValue = response.data.map(item => item.teamCode).filter(Boolean);
      const stringNoRepeat = stringWithValue
        .map(item => item)
        .filter((item, index, array) => array.indexOf(item) === index);
      this.setState({inputAutoComplete:stringNoRepeat})
      
      this.setState({inputAutoStatus:response.status})
      this.setState({isLoading:false})
      
    } catch (error) {
      console.log(error);
      this.setState({isLoading:false})
      toast.error(`It was not possible to retrieve the team codes. 
      Please try again by clicking the icon inside the input auto complete.`);
    }
  };

  render() {
    const {
      firstName,
      email,
      lastName,
      phoneNumber,
      role,
      actualEmail,
      actualPassword,
      actualConfirmedPassword,
      jobTitle,
    } = this.state.userProfile;

    const darkMode = this.props.darkMode;

    const fontColor = darkMode ? 'text-light' : '';
    const fontWeight = darkMode ? 'font-weight-bold' : '';

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
        <Container className={`emp-profile add-new-user ${darkMode ? 'bg-yinmn-blue' : ''}`}>
          <Row>
            <Col md="12">
              <Form>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label className={fontColor} >Name <span style={{ color: 'red' }}>*</span> </Label>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="First Name"
                        invalid={!!(this.state.formSubmitted && this.state.formErrors.firstName)}
                      />
                       {this.state.formSubmitted && this.state.formErrors.firstName && (
    <FormFeedback className={fontWeight}>
      {this.state.formErrors.firstName}
    </FormFeedback>
  )}
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="Last Name"
                        invalid={!!(this.state.formSubmitted && this.state.formErrors.lastName)}
                      />
                      {this.state.formSubmitted && this.state.formErrors.lastName && (
    <FormFeedback className={fontWeight}>
      {this.state.formErrors.lastName}
    </FormFeedback>
  )}
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 3, offset: 1 }} className="text-md-right my-2">
                    <Label className={fontColor}>Job Title <span style={{ color: 'red' }}>*</span> </Label>
                  </Col>
                  <Col md={{ size: 6 }}>
                    <FormGroup>
                      <Input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="Job Title"
                        invalid={!!(this.state.formSubmitted && this.state.formErrors.jobTitle)}
                      />
                      {this.state.formSubmitted && this.state.formErrors.jobTitle && (
    <FormFeedback className={fontWeight}>
      {this.state.formErrors.jobTitle}
    </FormFeedback>)}
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label className={fontColor}>Email <span style={{ color: 'red' }}>*</span> </Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="Email"
                        invalid={!!(this.state.formSubmitted && this.state.formErrors.email)}
                      />
                      {this.state.formSubmitted && this.state.formErrors.email && (
    <FormFeedback className={fontWeight}>
      {this.state.formErrors.email}
    </FormFeedback>)}
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
                    <Label className={fontColor}>Phone <span style={{ color: 'red' }}>*</span> </Label>
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
                      {phoneNumberEntered && this.state.formSubmitted && (
                        <div className={`required-user-field ${fontWeight}`}>
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
                    <Label className={fontColor}>Weekly Committed Hours <span style={{ color: 'red' }}>*</span></Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="number"
                        name="weeklyCommittedHours"
                        min={0}
                        max={168}
                        id="weeklyCommittedHours"
                        value={this.state.userProfile.weeklyCommittedHours}
                        onChange={(e) => this.handleUserProfile(e)}
                        onKeyDown={event => {
                          if (event.key === 'Backspace' || event.key === 'Delete') {
                            this.setState({
                              userProfile: {
                                ...this.state.userProfile,
                                [event.target.id]: "",
                              },
                              formValid: {
                                ...this.state.formValid,
                                [event.target.id]: false,
                              },
                              formErrors: {
                                ...this.state.formErrors,
                                weeklyCommittedHours: 'Committed hours can not be empty',
                              },
                            });
                          }
                        }}
                        placeholder="Weekly Committed Hours"
                        invalid={
                          this.state.formValid.weeklyCommittedHours === undefined
                            ? false
                            : !this.state.formValid.weeklyCommittedHours
                        }
                      />
                      <FormFeedback className={fontWeight}>{this.state.formErrors.weeklyCommittedHours}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                    <Label className={fontColor}>Role</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="select"
                        name="role"
                        id="role"
                        defaultValue="Volunteer"
                        onChange={(e) => this.handleUserProfile(e)}
                      >
                        {this.props.role.roles.map(({ roleName }, index) => {
                          if (roleName === 'Owner') return;
                          return (
                            <option value={roleName} key={index}>
                              {roleName}
                            </option>
                          );
                        })}
                        {this.canAddDeleteEditOwners && <option value="Owner">Owner</option>}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                {(role === 'Administrator' || role === 'Owner') && (
                  <>
                    <Row className="user-add-row">
                      <Col md={{ size: 2, offset: 2 }} className="text-md-right my-2">
                        <Label className={fontColor}>Actual Email</Label>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Input
                            type="actualEmail"
                            name="actualEmail"
                            id="actualEmail"
                            value={actualEmail}
                            onChange={(e) => this.handleUserProfile(e)}
                            placeholder="Actual Email"
                            invalid={!!this.state.formErrors.actualEmail}
                          />
                          <FormFeedback className={fontWeight}>{this.state.formErrors.actualEmail}</FormFeedback>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="user-add-row">
                      <Col md={{ size: 4 }} className="text-md-right my-2">
                        <Label className={fontColor}>Actual Password</Label>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <CommonInput
                            type="password"
                            name="actualPassword"
                            id="actualPassword"
                            value={actualPassword}
                            onChange={(e) => this.handleUserProfile(e)}
                            placeholder="Actual Password"
                            invalid={!!this.state.formErrors.actualPassword ? this.state.formErrors.actualPassword : ""}
                            className="d-flex justify-start items-start"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="user-add-row">
                      <Col md={{ size: 4 }} className="text-md-right my-2">
                        <Label className={fontColor}>Confirm Actual Password</Label>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <CommonInput
                            type="password"
                            name="actualConfirmedPassword"
                            id="actualConfirmedPassword"
                            value={actualConfirmedPassword}
                            onChange={(e) => this.handleUserProfile(e)}
                            placeholder="Confirm Actual Password"
                            invalid={actualPassword !== actualConfirmedPassword ? "Passwords do not match" : ""}
                            className="d-flex justify-start items-start"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </>
                )}
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className={`weeklySummaryOptionsLabel ${fontColor}`}>Weekly Summary Options</Label>
                  </Col>
                  <Col md="6">
                    <WeeklySummaryOptions handleUserProfile={this.handleUserProfile} />
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className={fontColor}>Video Call Preference</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="collaborationPreference"
                        id="collaborationPreference"
                        value={this.state.userProfile.collaborationPreference}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="Skype, Zoom, etc."
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className={fontColor}>Admin Document</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="googleDoc"
                        id="googleDoc"
                        value={this.state.userProfile.googleDoc}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="Google Doc"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className={fontColor}>Link to Media Files</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="dropboxDoc"
                        id="dropboxDoc"
                        value={this.state.userProfile.dropboxDoc}
                        onChange={(e) => this.handleUserProfile(e)}
                        placeholder="DropBox Folder"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4, offset: 0 }} className="text-md-right my-2">
                    <Label className={fontColor}>Location</Label>
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
                            style={darkMode ? {} : boxStyle}
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
                    <Label className={fontColor}>Time Zone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <TimeZoneDropDown
                        filter={this.state.timeZoneFilter}
                        onChange={(e) => this.handleUserProfile(e)}
                        selected={'America/Los_Angeles'}
                        id="timeZone"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="user-add-row">
                  <Col md={{ size: 4 }} className="text-md-right my-2">
                    <Label className={fontColor}>Start Date</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <div className="date-picker-item">
                        <DatePicker
                          selected={this.state.userProfile.startDate}
                          minDate={new Date()}
                          onChange={date =>
                            this.setState({
                              userProfile: {
                                ...this.state.userProfile,
                                startDate: date == '' || date == null ? new Date() : date,
                              },
                            })
                          }
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
              <TabContent id="myTabContent" className={darkMode ? 'bg-yinmn-blue border-0' : ''}>
                <TabPane>
                  <ProjectsTab
                    userProjects={this.state.projects}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={true}
                    role={this.props.auth.user.role}
                    edit
                    darkMode={darkMode}
                  />
                </TabPane>
                <TabPane>
                  <TeamsTab
                    userTeams={this.state.teams}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onAssignTeamCode={this.onAssignTeamCode}
                    onDeleteTeam={this.onDeleteTeam}
                    isUserAdmin={true}
                    role={this.props.auth.user.role}
                    teamCode={this.state.teamCode}
                    canEditTeamCode={true}
                    codeValid={this.state.codeValid}
                    setCodeValid={this.setCodeValid}
                    edit
                    darkMode={darkMode}
                    inputAutoComplete={this.state.inputAutoComplete}
                    inputAutoStatus={this.state.inputAutoStatus}
                    isLoading={this.state.isLoading}
                    fetchTeamCodeAllUsers={this.fetchTeamCodeAllUsers}
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
                  data-testid="create-userProfile"
                  onClick={() => this.createUserProfile(false)}
                  style={darkMode ? boxStyleDark : boxStyle}
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

  onAssignTeamCode = value => {
    this.setState({
      teamCode: value,
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

  // Function to call TimeZoneService with location 
  onClickGetTimeZone = () => {
    const location = this.state.userProfile.location.userProvided;

    if (!location) {
      alert('Please enter valid location');
      return;
    }

    axios.get(ENDPOINTS.TIMEZONE_LOCATION(location)).then(res => {
      if(res.status === 200) {
        const { timezone, currentLocation } = res.data;
        this.setState({
          ...this.state,
          timeZoneFilter: timezone,
          userProfile: {
            ...this.state.userProfile,
            location: currentLocation,
            timeZone: timezone,
          },
        });
      }
    }).catch(err => {
      toast.error(`An error occurred : ${err.response.data}`);
    });
  };

  fieldsAreValid = () => {
    const firstLength = this.state.userProfile.firstName !== '';
    const lastLength = this.state.userProfile.lastName !== '';
    const phone = this.state.userProfile.phoneNumber;
    
    if (phone === null) {
      toast.error('Phone Number is required');
      return false;
    } else if (this.state.teamCode && !this.state.codeValid) {
      toast.error('Team Code is invalid');
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
      actualEmail,
      actualPassword,
      startDate,
      actualConfirmedPassword
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
      teamCode: this.state.teamCode,
      actualEmail: actualEmail,
      actualPassword: actualPassword,
      startDate: startDate,
    };

    this.setState({ formSubmitted: true });

    if (actualPassword != actualConfirmedPassword) {
      toast.error('Your passwords do not match!');
      return;
    }

    if (googleDoc) {
      if (isValidGoogleDocsUrl(googleDoc)) {
        userData.adminLinks.push({ Name: 'Google Doc', Link: googleDoc.trim() });
      } else {
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
      if (isValidMediaUrl(dropboxDoc)) {
        userData.adminLinks.push({ Name: 'Media Folder', Link: dropboxDoc.trim() });
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
              if (this.state.teams.length > 0) {
                this.state.teams.forEach(team => {
                  this.props.addTeamMember(
                    team._id,
                    res.data._id,
                    res.data.firstName,
                    res.data.lastName,
                  );
                });
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
                case 'credentials':
                  this.setState({
                    formValid: {
                      ...that.state.formValid,
                      email: false,
                    },
                    formErrors: {
                      ...that.state.formErrors,
                      actualEmail: 'Actual email or password may be incorrect',
                      actualPassword: 'Actual email or password may be incorrect',
                    },
                  });
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
    this.setState({
      ...this.state,
      userProfile: {
        ...this.state.userProfile,
        location: { ...this.state.location, userProvided: e.target.value },
      },
    });
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
            [event.target.id]: event.target.value
              .trim()
              .replace(/[A-Z]/g, char => char.toLowerCase()),
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
            [event.target.id]: { ...userProfile.location, userProvided: event.target.value.trim() },
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
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.length > 0,
          },
          formErrors: {
            ...formErrors,
            jobTitle: event.target.value.length > 0 ? '' : 'Job Title is required',
          },
        });
        break;
      case 'weeklyCommittedHours':
        let val = Number(event.target.value);
        if (val > 168) {
          val = 168
        } else if (val < 0) {
          val = 0
        } 
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: val.toString(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: true,
          },
          formErrors: {
            ...formErrors,
            weeklyCommittedHours: '',
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
      case 'actualEmail':
        this.setState({
          userProfile: {
            ...userProfile,
            actualEmail: event.target.value,
          },
          formErrors: {
            ...formErrors,
            actualEmail: event.target.value.match(patt) ? '' : 'Actual Email is not valid',
          },
        });
        break;
      case 'actualPassword':
        this.setState({
          userProfile: {
            ...userProfile,
            actualPassword: event.target.value,
          },
          formErrors: {
            ...formErrors,
            actualPassword: event.target.value.length > 0 ? '' : 'Actual Password is required',
          },
        });
        break;
      case 'actualConfirmedPassword':
        this.setState({
          userProfile: {
            ...userProfile,
            actualConfirmedPassword: event.target.value,
          },
          formErrors: {
            ...formErrors,
            actualConfirmedPassword: event.target.value.length > 0 ? '' : 'Actual Confirmed Password is required',
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
  role: state.role,
  state,
});


export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
  fetchAllProjects,
  hasPermission,
})(UserProfileAdd);
