import React, { Component } from 'react';
import {
  Row,
  Label,
  Input,
  Badge,
  Col,
  Container,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';
import Loading from '../common/Loading';
import { orange, silverGray, warningRed } from '../../constants/colors';
import BlueSquare from './BlueSquares';
import Modal from './UserProfileModal';
import UserLinks from './UserLinks';
// import styleProfile from './UserProfile.module.scss';
import './UserProfile.scss';
import TeamsTab from './TeamsAndProjects/TeamsTab';
import ProjectsTab from './TeamsAndProjects/ProjectsTab';

import TeamView from './Teamsview';
import UserTeamProjectContainer from './TeamsAndProjects/UserTeamProjectContainer';

import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects';

// const styleProfile = {};
class UserProfile extends Component {
  state = {
    isLoading: true,
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
    createdDate: '',
    activeTab: '1',
  };

  async componentDidMount() {
    if (this.props.match) {
      const { userId } = this.props.match.params;
      await this.props.getUserProfile(userId);
      await this.props.getUserTeamMembers(userId);
      if (!this.props.userProfile.privacySettings) {
        this.setState({
          isLoading: false,
          userProfile: {
            ...this.props.userProfile,
            privacySettings: {
              email: true,
              phoneNumber: true,
              blueSquares: true,
            },
          },
        });
      } else {
        this.setState({
          isLoading: false,
          userProfile: this.props.userProfile,
        });
      }
    }
    this.props.getAllUserTeams();
    this.props.fetchAllProjects();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.match !== prevProps.match) {
      console.log('component on needs to update');

      const { userId } = this.props.match.params;
      await this.props.getUserProfile(userId);

      if (this.props.userProfile === '404') {
        this.setState({
          isLoading: false,
        });
      } else {
        await this.props.getUserTeamMembers(userId);
        if (this.props.userProfile.firstName.length) {
          if (!this.props.userProfile.privacySettings) {
            this.setState({
              isLoading: false,
              userProfile: {
                ...this.props.userProfile,
                privacySettings: {
                  email: true,
                  phoneNumber: true,
                  blueSquares: true,
                },
              },
            });
          } else {
            this.setState({
              isLoading: false,
              userProfile: this.props.userProfile,
            });
          }
        }
      }
    }
  }

  onDeleteTeam = (deletedTeamId) => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    const filteredTeam = _userProfile.teams.filter(team => team._id !== deletedTeamId);
    _userProfile.teams = filteredTeam;

    this.setState({
      userProfile: _userProfile,
    }, () => { this.saveChanges(); });
  }

  onDeleteProject = (deletedProjectId) => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    const filteredProject = _userProfile.projects.filter(project => project._id !== deletedProjectId);
    _userProfile.projects = filteredProject;

    this.setState({
      userProfile: _userProfile,
    }, () => { this.saveChanges(); });
  }

  onAssignTeam = (assignedTeam) => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.teams) {
      _userProfile.teams.push(assignedTeam);
    } else {
      _userProfile.teams = [assignedTeam];
    }

    this.setState({
      userProfile: _userProfile,
    }, () => { this.saveChanges(); });
  }

  onAssignProject = (assignedProject) => {
    const _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.projects) {
      _userProfile.projects.push(assignedProject);
    } else {
      _userProfile.projects = [assignedProject];
    }

    this.setState({
      userProfile: _userProfile,
    }, () => { this.saveChanges(); });
  }

  saveChanges = () => {
    this.props.updateUserProfile(
      this.props.match.params.userId,
      this.state.userProfile,
    );
  }

  handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
    if (type === 'viewBlueSquare') {
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

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  };

  formatPhoneNumber = (str) => {
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

  render() {
    const {
      userProfile,
      linkType,
      id,
      isLoading,
      error,
      showModal,
      type,
      modalMessage,
      modalTitle,
    } = this.state;
    // debugger;
    // const { userProfile, isLoading, error, showModal } = this.state;
    // let { allTeams } = this.props.allTeams.allTeamsData;
    // let { projects } = this.props.allProjects.projects;
    // console.log(projects);

    const {
      firstName,
      lastName,
      email,
      profilePic,
      phoneNumber,
      jobTitle = '',
      personalLinks,
      adminLinks,
      infringments,
      privacySettings,
      teams,
    } = userProfile;

    console.log('user profile:', userProfile.teams);

    if (isLoading) {
      return (
        <Container fluid>
          <Row className="text-center" data-test="loading">
            <Loading />
          </Row>
        </Container>
      );
    }

    const { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined };

    const { userid: requestorId, role: requestorRole } = this.props.auth.user;

    const isUserSelf = targetUserId === requestorId;
    const isUserAdmin = requestorRole === 'Administrator';
    const canEdit = isUserAdmin || isUserSelf;
    const weeklyHoursReducer = (acc, val) => acc + (parseInt(val.hours, 10) + parseInt(val.minutes, 10) / 60);
    // (parseInt(a.minutes, 10) + parseInt(b.minutes, 10)) / 60;

    return (
      <div>
        {showModal && (
          <Modal
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
            isUserAdmin={isUserAdmin}
            handleLinkModel={this.handleLinkModel}
          />
        )}
        <Container className="emp-profile">
          <Row>
            <Col md="4" id="profileContainer">
              {/* <div className={styleProfile.whoSection}> */}
              <div className="profile-img">
                <Image
                  src={profilePic || '/defaultprofilepic.png'}
                  alt="Profile Picture"
                  roundedCircle
                  className="profilePicture"
                />
              </div>
              {/* </div> */}
            </Col>
            <Col md="8">
              <div className="profile-head">
                <h5>{`${firstName} ${lastName}`}</h5>
                <h6>{jobTitle}</h6>
                <p className="proile-rating">
                  From :
                  {' '}
                  <span>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</span>
                  {'   '}
                  To:
                  {' '}
                  <span>Present</span>
                </p>
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
                <UserLinks
                  linkSection="user"
                  links={personalLinks}
                  handleLinkModel={this.handleLinkModel}
                  isUserAdmin={isUserAdmin}
                />
                <UserLinks
                  linkSection="user"
                  links={adminLinks}
                  handleLinkModel={this.handleLinkModel}
                  isUserAdmin={isUserAdmin}
                />
                {privacySettings.blueSquares && (
                  <div>
                    <p>BLUE SQAURES</p>
                    <BlueSquare
                      isUserAdmin={false}
                      blueSquares={infringments}
                      handleBlueSquare={this.handleBlueSquare}
                    />
                  </div>
                )}
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
                    >
                      More Tabs
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
                  <Row>
                    <Col md="6">
                      <Label>Name</Label>
                    </Col>
                    <Col md="6">
                      <p>{`${firstName} ${lastName}`}</p>
                    </Col>
                  </Row>
                  {privacySettings.email && (
                    <Row>
                      <Col md="6">
                        <Label>Email</Label>
                      </Col>
                      <Col md="6">
                        <p>{email}</p>
                      </Col>
                    </Row>
                  )}
                  {privacySettings.phoneNumber && (
                    <Row>
                      <Col md="6">
                        <Label>Phone</Label>
                      </Col>
                      <Col md="6">
                        <p>{this.formatPhoneNumber(phoneNumber)}</p>
                      </Col>
                    </Row>
                  )}
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
                      <Label>Weekly Commited Hours </Label>
                    </Col>
                    <Col md="6">
                      <p>{userProfile.weeklyComittedHours}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <Label>Total Hours </Label>
                    </Col>
                    <Col md="6">
                      <p>{userProfile.totalComittedHours}</p>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId="3">
                  <TeamsTab
                    userTeams={this.state ? this.state.userProfile.teams : []}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onDeleteteam={this.onDeleteTeam}
                    isUserAdmin={isUserAdmin}
                    edit={false}
                  />
                </TabPane>
                <TabPane tabId="4">
                  <ProjectsTab
                    userProjects={this.state ? this.state.userProfile.projects : []}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={isUserAdmin}
                    edit={false}
                  />

                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Row>
            <Col sm="12" md={{ size: 4, offset: 4 }}>
              {canEdit && (
                <div className="profileEditButtonContainer">
                  <Link to={`/userprofileedit/${this.state.userProfile._id}`}>
                    <Button className="profileEditButton" color="primary" aria-hidden="true">
                      {' '}
                      Edit
                    </Button>
                  </Link>
                </div>
              )}
            </Col>
          </Row>
        </Container>
        {/* </Row>
          </Col>

        </div>

        <div >

          <UserTeamProjectContainer
            userTeams={this.state ? this.state.userProfile.teams : []}
            userProjects={this.state ? this.state.userProfile.projects : []}
            teamsData={this.props ? this.props.allTeams.allTeamsData : []}
            projectsData={this.props ? this.props.allProjects.projects : []}
            onAssignTeam={this.onAssignTeam}
            onAssignProject={this.onAssignProject}
            onDeleteteam={this.onDeleteTeam}
            onDeleteProject={this.onDeleteProject}
            isUserAdmin={isUserAdmin} />

        </div> */}

      </div>
    );
  }
}

export default UserProfile;
