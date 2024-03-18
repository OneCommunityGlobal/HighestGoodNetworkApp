import React, { Component } from 'react';
import {
  Row,
  Label,
  Input,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import moment from 'moment';
import { StickyContainer, Sticky } from 'react-sticky';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';

import classnames from 'classnames';
import Loading from '../../common/Loading';
import BlueSquare from '../BlueSquares';
import UserProfileModal from '../UserProfileModal';
import UserLinks from '../UserLinks';
import ToggleSwitch from './ToggleSwitch';
import SaveButton from './SaveButton';
import '../UserProfile.scss';
import './UserProfileEdit.scss';
import LinkModButton from './LinkModButton';
import ProjectsTab from '../TeamsAndProjects/ProjectsTab';
import TeamsTab from '../TeamsAndProjects/TeamsTab';
import hasPermission from '../../../utils/permissions';

import { connect } from 'react-redux';
import { permissions } from 'utils/constants';

const styleProfile = {};
class UserProfileEdit extends Component {
  state = {
    showWarning: false,
    isLoading: true,
    formValid: {
      firstName: true,
      lastName: true,
      email: true,
    },
    error: '',
    userProfile: {},
    firstNameError: '',
    lastNameError: '',
    imageUploadError: '',
    isValid: false,
    id: '',
    privacySettings: {
      email: true,
      phoneNumber: true,
      blueSquares: true,
    },
    selectedTeamId: 0,
    selectedTeam: '',
    activeTab: '1',
  };

  async componentDidMount() {
    this.props.getAllUserTeams();
    // this.props.getAllUserProfile();

    if (this.props.match) {
      const { userId } = this.props.match.params;
      await this.props.getUserProfile(userId);
      if (this.props.userProfile.firstName.length) {
        this.setState({ isLoading: false, userProfile: this.props.userProfile });
        if (this.props.userProfile.privacySettings) {
          this.setState({
            isLoading: false,
            userProfile: {
              ...this.props.userProfile,
            },
          });
        }
      }
    }
  }

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  };

  onDeleteTeam = deletedTeamId => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    const filteredTeam = _userProfile.teams.filter(team => team._id !== deletedTeamId);
    _userProfile.teams = filteredTeam;

    this.setState(
      {
        userProfile: _userProfile,
      },
      () => {
        this.saveChanges();
      },
    );
  };

  onDeleteProject = deletedProjectId => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    const filteredProject = _userProfile.projects.filter(
      project => project._id !== deletedProjectId,
    );
    _userProfile.projects = filteredProject;

    this.setState(
      {
        userProfile: _userProfile,
      },
      () => {
        this.saveChanges();
      },
    );
  };

  onAssignTeam = assignedTeam => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.teams) {
      _userProfile.teams.push(assignedTeam);
    } else {
      _userProfile.teams = [assignedTeam];
    }

    this.setState(
      {
        userProfile: _userProfile,
      },
      () => {
        this.saveChanges();
      },
    );
  };

  onAssignProject = assignedProject => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.projects) {
      _userProfile.projects.push(assignedProject);
    } else {
      _userProfile.projects = [assignedProject];
    }

    this.setState(
      {
        userProfile: _userProfile,
      },
      () => {
        this.saveChanges();
      },
    );
  };

  saveChanges = () => {
    this.props.updateUserProfile(this.state.userProfile);
  };

  handleUserProfile = event => {
    this.setState({
      showWarning: true,
    });
    const { userProfile, formValid } = this.state;
    const patt = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);
    switch (event.target.id) {
      case 'firstName':
        this.setState({
          userProfile: {
            ...userProfile,
            firstName: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            firstName: !!event.target.value,
          },
        });
        break;
      case 'lastName':
        this.setState({
          userProfile: {
            ...userProfile,
            lastName: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            lastName: !!event.target.value,
          },
        });
        break;
      case 'jobTitle':
        this.setState({
          userProfile: {
            ...userProfile,
            jobTitle: event.target.value,
          },
        });
        break;
      case 'email':
        this.setState({
          userProfile: {
            ...userProfile,
            email: event.target.value,
          },
          formValid: {
            ...formValid,
            email: patt.test(event.target.value),
          },
        });
        break;
      case 'phoneNumber':
        this.setState({
          userProfile: {
            ...userProfile,
            phoneNumber: event.target.value.trim(),
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
      case 'blueSquaresPubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              blueSquares: !userProfile.privacySettings?.blueSquares,
            },
          },
        });
        break;
      case 'totalCommittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            totalCommittedHours: event.target.value,
          },
        });
        break;
      case 'weeklyCommittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            weeklyCommittedHours: event.target.value,
          },
        });
        break;
      case 'collaborationPreference':
        this.setState({
          userProfile: {
            ...userProfile,
            collaborationPreference: event.target.value,
          },
        });
        break;
      default:
        this.setState({
          ...userProfile,
        });
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
      imageUploadError = `\nThe file you are trying to upload exceeds the maximum size of 50KB. You can either 
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

  handleTeam = (type, newTeam) => {
    const { userProfile } = this.state;
    switch (type) {
      case 'add':
        userProfile.teams.push(newTeam);
        this.setState({
          ...userProfile,
        });
        break;
      case 'delete':
        userProfile.teams = userProfile.teams.filter(team => team._id !== newTeam);
        this.setState({
          ...userProfile,
        });
        break;
      default:
        this.setState({
          ...userProfile,
        });
        break;
    }
  };

  handleNullState = kind => {
    switch (kind) {
      case 'settings':
        this.setState(() => ({
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            privacySettings: {
              email: true,
              phoneNumber: true,
              blueSquares: true,
            },
          },
        }));
        break;
      default:
        break;
    }
  };

  handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
    if (type === 'addBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type,
      });
    } else if (type === 'modBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type,
        id: blueSquareID,
      });
    } else if (type === 'viewBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type,
        id: blueSquareID,
      });
    } else if (blueSquareID === 'none') {
      this.setState({
        showModal: status,
        modalTitle: 'Save & Refresh',
        modalMessage: '',
        type,
      });
    }
  };

  updateBlueSquare = (id, dateStamp, summary, kind) => {
    if (kind === 'add') {
      const newBlueSquare = { date: dateStamp, description: summary };
      this.setState(prevState => ({
        showModal: false,
        userProfile: {
          ...this.state.userProfile,
          infringements: prevState.userProfile.infringements.concat(newBlueSquare),
        },
      }));
    } else if (kind === 'update') {
      this.setState(() => {
        const currentBlueSquares = this.state.userProfile.infringements;
        if (dateStamp != null) {
          currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp;
        }
        if (summary != null) {
          currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary;
        }
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringements: currentBlueSquares,
          },
        };
      });
    } else if (kind === 'delete') {
      this.setState(() => {
        const currentBlueSquares = this.state.userProfile.infringements.filter(blueSquare => {
          if (blueSquare._id !== id) {
            return blueSquare;
          }
        });
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringements: currentBlueSquares,
          },
        };
      });
    }
  };

  handleSaveError = message => {
    this.setState({
      showModal: true,
      modalMessage: 'Must save first.',
      modalTitle: `Error, ${message}`,
      type: 'message',
    });
  };

  handleSubmit = async event => {
    const { updateUserProfile, match } = this.props;
    const { userProfile, formValid } = this.state;
    const submitResult = await updateUserProfile(userProfile);
  };

  updateLink = (personalLinksUpdate, adminLinksUpdate) =>
    this.setState(() => ({
      showModal: false,
      userProfile: {
        ...this.state.userProfile,
        personalLinks: personalLinksUpdate,
        adminLinks: adminLinksUpdate,
      },
    }));

  handleLinkModel = (status = true, type = 'message', linkSection) => {
    if (type === 'addLink') {
      this.setState({
        showModal: status,
        modalTitle: 'Add a New Link',
        linkType: linkSection,
        type,
      });
    } else if (type === 'updateLink') {
      this.setState({
        showModal: status,
        modalTitle: 'Edit Links',
        linkType: linkSection,
        type,
      });
    }
  };

  // render drop down list of teams, or auto-fill team names...
  // fetch and display available teams
  // once team is selected, push userid & teamid with addTeamMember...

  // HOW TO UPDATE TEAM WITH NEW MEMBER  this.props.addTeamMember(this.state.selectedTeamId, user._id, user.firstName, user.lastName);

  addUserToTeam = () => {
    this.props.addTeamMember(
      this.state.selectedTeamId,
      this.user._id,
      this.user.firstName,
      this.user.lastName,
    );
  };

  render() {
    const { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined };
    const { userid: requestorId, role: requestorRole } = this.props.auth.user;
    const canPutUserProfile = this.props.hasPermission(permissions.userManagement.putUserProfile);
    const canAddDeleteEditOwners = this.props.hasPermission(permissions.userManagement.addDeleteEditOwners);

    const {
      userProfile,
      isLoading,
      showModal,
      modalMessage,
      modalTitle,
      type,
      linkType,
      id,
      formValid,
    } = this.state;
    const renderWarningCard = () => {
      const { showWarning } = this.state;
      if (showWarning) {
        return (
          <Sticky topOffset={0}>
            {({ style }) => (
              <h6
                id="warningCard"
                style={{
                  ...style,
                  // marginTop: '-20px',
                  display: 'block',
                  color: 'white',
                  backgroundColor: 'red',
                  border: '1px solid #a8a8a8',
                  textAlign: 'center',
                  opacity: '70%',
                  zIndex: '9',
                }}
              >
                Reminder: You must click &quot;Save Changes&quot; at the bottom of this page. If you
                don&apos;t, changes to your profile will not be saved.
              </h6>
            )}
          </Sticky>
        );
      }
    };
    const {
      firstName,
      lastName,
      email,
      profilePic,
      phoneNumber,
      jobTitle = '',
      personalLinks,
      adminLinks,
      infringements,
      privacySettings,
    } = userProfile;

    const isUserSelf = targetUserId === requestorId;
    let canEditFields;
    if (userProfile.role !== 'Owner') {
      canEditFields = canPutUserProfile || isUserSelf;
    } else {
      canEditFields = canAddDeleteEditOwners || isUserSelf;
    }

    const weeklyHoursReducer = (acc, val) =>
      acc + (parseInt(val.hours, 10) + parseInt(val.minutes, 10) / 60);

    if (isLoading === true) {
      return (
        <Container fluid>
          <Row className="text-center" data-test="loading">
            <Loading />
          </Row>
        </Container>
      );
    }

    if (!canEditFields) {
      return (
        <Col>
          <Row className={styleProfile.profileContainer}>
            <Label>Sorry, you do not have permission to edit this profile.</Label>
          </Row>
        </Col>
      );
    }

    return (
      <div>
        {showModal && (
          <UserProfileModal
            isOpen={showModal}
            closeModal={() => {
              this.setState({ showModal: false });
            }}
            modalMessage={modalMessage}
            modalTitle={modalTitle}
            type={type}
            updateLink={this.updateLink}
            updateBlueSquare={this.updateBlueSquare}
            linkType={linkType}
            userProfile={userProfile}
            id={id}
            handleLinkModel={this.handleLinkModel}
            handleSubmit={this.handleSubmit}
          />
        )}

        <StickyContainer>
          {renderWarningCard()}
          <Container className="emp-profile">
            <Row>
              <Col md="4" id="profileContainer">
                <div className="profile-img">
                  <Image
                    src={profilePic || '/defaultprofilepic.png'}
                    alt="Profile Picture"
                    roundedCircle
                    className="profilePicture"
                  />
                  <div className="file btn btn-lg btn-primary">
                    Change Photo
                    <Input
                      type="file"
                      name="newProfilePic"
                      id="newProfilePic"
                      onChange={this.handleImageUpload}
                      accept="image/png,image/jpeg, image/jpg"
                    />
                  </div>
                </div>
              </Col>
              <Col md="8">
                <div className="profile-head">
                  <h5>{`${firstName} ${lastName}`}</h5>
                  <h6>{jobTitle}</h6>
                </div>
                <div className="p-5 my-2 bg--cadet-blue text-light">
                  <div className="py-2 my-2"> </div>
                  <h3>Badges goes here...</h3>
                  <div className="py-2 my-2"> </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <div className="profile-work">
                  <p>LINKS</p>
                  <LinkModButton
                    updateLink={this.updateLink}
                    userProfile={userProfile}
                    role={requestorRole}
                  />
                  <UserLinks
                    linkSection="user"
                    links={personalLinks}
                    handleLinkModel={this.handleLinkModel}
                    role={requestorRole}
                  />
                  <UserLinks
                    linkSection="user"
                    links={adminLinks}
                    handleLinkModel={this.handleLinkModel}
                    role={requestorRole}
                  />
                  {/* <p>BLUE SQAURES</p> */}
                  <div className="blueSquare-toggle">
                    <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
                    <ToggleSwitch
                      style={{ display: 'inline-block' }}
                      switchType="bluesquares"
                      state={privacySettings?.blueSquares}
                      handleUserProfile={this.handleUserProfile}
                    />
                  </div>

                  <BlueSquare
                    blueSquares={infringements}
                    handleBlueSquare={this.handleBlueSquare}
                  />
                </div>
              </Col>
              <Col md="8">
                <div className="profile-tabs">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '1' }, 'nav-link')}
                        onClick={() => {
                          this.toggleTab('1');
                        }}
                      >
                        Basic Information
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '2' }, 'nav-link')}
                        onClick={() => {
                          this.toggleTab('2');
                        }}
                      >
                        Volunteering Times
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '3' }, 'nav-link')}
                        onClick={() => {
                          this.toggleTab('3');
                        }}
                      >
                        Teams
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '4' }, 'nav-link')}
                        onClick={() => {
                          this.toggleTab('4');
                        }}
                      >
                        Projects
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={classnames({ active: this.state.activeTab === '5' }, 'nav-link')}
                        onClick={() => {
                          this.toggleTab('6');
                        }}
                        data-testid="edit-history-tab"
                      >
                        Edit History
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
                <TabContent
                  activeTab={this.state.activeTab}
                  className="tab-content profile-tab"
                  id="myTabContent"
                  style={{ border: 0 }}
                >
                  <TabPane tabId="1">
                    <Form>
                      <Row>
                        <Col md="6">
                          <Label>Name</Label>
                        </Col>
                        <Col md="3">
                          <FormGroup>
                            <Input
                              type="text"
                              name="firstName"
                              id="firstName"
                              value={firstName}
                              className={styleProfile.profileText}
                              onChange={this.handleUserProfile}
                              placeholder="First Name"
                              invalid={!this.state.formValid.firstName}
                            />
                            <FormFeedback>First Name Can&apos;t be null</FormFeedback>
                          </FormGroup>
                        </Col>
                        <Col md="3">
                          <FormGroup>
                            <Input
                              type="text"
                              name="lastName"
                              id="lastName"
                              value={lastName}
                              className={styleProfile.profileText}
                              onChange={this.handleUserProfile}
                              placeholder="Last Name"
                              invalid={!this.state.formValid.lastName}
                            />
                            <FormFeedback>Last Name Can&apos;t be Null</FormFeedback>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <Label>Email</Label>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <ToggleSwitch
                              switchType="email"
                              state={userProfile.privacySettings?.email}
                              handleUserProfile={this.handleUserProfile}
                            />

                            <Input
                              type="email"
                              name="email"
                              id="email"
                              value={email}
                              onChange={this.handleUserProfile}
                              placeholder="Email"
                              invalid={!this.state.formValid.email}
                            />
                            <FormFeedback>Email is not Valid</FormFeedback>
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <Label>Phone</Label>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <ToggleSwitch
                              switchType="phone"
                              state={userProfile.privacySettings?.phoneNumber}
                              handleUserProfile={this.handleUserProfile}
                            />

                            <Input
                              type="number"
                              name="phoneNumber"
                              id="phoneNumber"
                              className={styleProfile.profileText}
                              value={phoneNumber}
                              onChange={this.handleUserProfile}
                              placeholder="Phone"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Row>
                        <Col md="6">
                          <Label>Video Call Preference</Label>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Input
                              type="text"
                              name="collaborationPreference"
                              id="collaborationPreference"
                              value={userProfile.collaborationPreference}
                              onChange={this.handleUserProfile}
                              placeholder="Skype, Zoom, etc."
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </Form>
                  </TabPane>
                  <TabPane tabId="2">
                    <Row>
                      <Col md="6">
                        <Label>Start Date</Label>
                      </Col>
                      <Col md="6">
                        <p>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <Label>End Date</Label>
                      </Col>
                      <Col md="6">
                        <p>Present</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <Label>Total Hours This Week</Label>
                      </Col>
                      <Col md="6">
                        <p>{this.props.timeEntries.weeks[0].reduce(weeklyHoursReducer, 0)}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <Label>Weekly Committed Hours </Label>
                      </Col>
                      <Col md="6">
                        <Input
                          type="number"
                          name="weeklyCommittedHours"
                          id="weeklyCommittedHours"
                          className={styleProfile.profileText}
                          value={userProfile.weeklyCommittedHours}
                          onChange={this.handleUserProfile}
                          placeholder="weeklyCommittedHours"
                          invalid={/*!canPutUserProfile*/ true}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <Label>Total Hours </Label>
                      </Col>
                      <Col md="6">
                        <Input
                          type="number"
                          name="totalCommittedHours"
                          id="totalCommittedHours"
                          className={styleProfile.profileText}
                          value={userProfile.totalCommittedHours}
                          onChange={this.handleUserProfile}
                          placeholder="totalCommittedHours"
                          invalid={!canPutUserProfile}
                        />
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tabId="3">
                    <TeamsTab
                      userTeams={this.state ? this.state.userProfile.teams : []}
                      teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                      onAssignTeam={this.onAssignTeam}
                      onDeleteTeam={this.onDeleteTeam}
                      role={requestorRole}
                      edit
                      userProfile={this.state ? this.state.userProfile : []}
                    />
                  </TabPane>
                  <TabPane tabId="4">
                    <ProjectsTab
                      userProjects={this.state ? this.state.userProfile.projects : []}
                      projectsData={this.props ? this.props.allProjects.projects : []}
                      onAssignProject={this.onAssignProject}
                      onDeleteProject={this.onDeleteProject}
                      role={requestorRole}
                      edit
                    />
                  </TabPane>
                </TabContent>
              </Col>

              {/* {allTeams.map(team => <div>{team.teamName}</div>)} */}
            </Row>
            <Row
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 10,
                margin: 5,
              }}
            >
              <SaveButton
                handleSubmit={this.handleSubmit}
                disabled={!formValid.firstName || !formValid.lastName || !formValid.email}
                userProfile={userProfile}
              />
              <Link
                to={`/userprofile/${this.state.userProfile._id}`}
                className="btn btn-outline-danger"
                style={{ display: 'flex', margin: 5 }}
              >
                Cancel
              </Link>
            </Row>
          </Container>
        </StickyContainer>
      </div>
    );
  }
}

export default connect(null, { hasPermission })(UserProfileEdit);
