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
import InfoModal from './InfoModal';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects';
import BasicInformationTab from './BaiscInformationTab/BasicInformationTab';
import VolunteeringTimeTab from './VolunteeringTimeTab/VolunteeringTimeTab';
import EditLinkButton from './UserProfileEdit/LinkModButton';
import SaveButton from './UserProfileEdit/SaveButton';
import UserLinkLayout from './UserLinkLayout';
import BlueSqaureLayout from './BlueSqaureLayout';
import TabToolTips from './ToolTips/TabToolTips';
import BasicToolTips from './ToolTips/BasicTabTips';
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
    infoModal: false,
    formValid: {
      firstName: true,
      lastName: true,
      email: true,
    },
    changed: false,
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
      // console.log('component on needs to update');

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

  handleImageUpload = async (e) => {
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
    // console.log(filesizeKB);

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
      // console.log(reader, file);

      this.setState({
        imageUploadError: '',
        userProfile: {
          ...this.state.userProfile,
          profilePic: reader.result,
        },
      });
    };
  };

  saveChanges = () => {
    this.props.updateUserProfile(
      this.props.match.params.userId,
      this.state.userProfile,
    );
  }

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
    // console.log('Handle Blue Square: ', kind, ' date:', dateStamp, ' summary:', summary)
    // const elem = document.getElementById('warningCard');
    // elem.style.display = 'block';

    if (kind === 'add') {
      const newBlueSquare = { date: dateStamp, description: summary };
      this.setState(prevState => ({
        showModal: false,
        userProfile: {
          ...this.state.userProfile,
          infringments: prevState.userProfile.infringments.concat(newBlueSquare),
        },
      }));
    } else if (kind === 'update') {
      this.setState(() => {
        const currentBlueSquares = this.state.userProfile.infringments;
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
            infringments: currentBlueSquares,
          },
        };
      });
    } else if (kind === 'delete') {
      this.setState(() => {
        const currentBlueSquares = this.state.userProfile.infringments.filter((blueSquare) => {
          if (blueSquare._id !== id) {
            return blueSquare;
          }
        });
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringments: currentBlueSquares,
          },
        };
      });
    }
  };

  handleSubmit = async (event) => {
    const { updateUserProfile, match } = this.props;
    const { userProfile, formValid } = this.state;
    const submitResult = await updateUserProfile(match.params.userId, userProfile);
    // console.log(submitResult);

    // if (submitResult === 200) {
    //   this.setState({
    //     showModal: true,
    //     modalMessage: 'Your Changes were saved successfully',
    //     modalTitle: 'Success',
    //     type: 'save',
    //   });
    //   const elem = document.getElementById('warningCard');
    //   // elem.style.display = 'none';
    // } else {
    //   this.setState({
    //     showModal: true,
    //     modalMessage: 'Please try again.',
    //     modalTitle: 'Error',
    //     type: 'save',
    //   });
    // }
  };

  toggleInfoModal = () => {
    this.setState({
      infoModal: !this.state.infoModal,
    });
  }

  toggleTab = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  };

  updateLink = (personalLinksUpdate, adminLinksUpdate) => this.setState(() => ({
    showModal: false,
    userProfile: {
      ...this.state.userProfile,
      personalLinks: personalLinksUpdate,
      adminLinks: adminLinksUpdate,
    },
  }));

  handleUserProfile = (event) => {
    this.setState({
      changed: true,
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
      case 'startDate':
        this.setState({
          userProfile: {
            ...userProfile,
            createdDate: event.target.value,
          },
        });
        break;
      case 'totalComittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            totalComittedHours: event.target.value,
          },
        });
        break;
      case 'weeklyComittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            weeklyComittedHours: event.target.value,
          },
        });
        break;
      default:
        this.setState({
          ...userProfile,
        });
    }
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
      infoModal,
      formValid,
    } = this.state;

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

    if (isLoading && !this.props.isAddNewUser) {
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
        <TabToolTips />
        <BasicToolTips />
        <InfoModal isOpen={infoModal} toggle={this.toggleInfoModal} />
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
                {canEdit ? (
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
                ) : null}
              </div>

            </Col>
            <Col md="8">
              <div className="profile-head">
                <h5 style={{ display: 'inline-block', marginRight: 10 }}>{`${firstName} ${lastName}`}</h5>
                <i
                  data-toggle="tooltip"
                  data-placement="right"
                  title="Click for more information"
                  style={{ fontSize: 24, cursor: 'pointer' }}
                  aria-hidden="true"
                  className="fa fa-info-circle"
                  onClick={this.toggleInfoModal}
                />
                <h6>{jobTitle}</h6>
                <p className="proile-rating">
                  From :
                  {' '}
                  <span>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</span>
                  {'   '}
                  To:
                  {' '}
                  <span>N/A</span>
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
                <UserLinkLayout
                  isUserAdmin={isUserAdmin}
                  isUserSelf={isUserSelf}
                  userProfile={userProfile}
                  updateLink={this.updateLink}
                  handleLinkModel={this.handleLinkModel}
                />
                <BlueSqaureLayout
                  userProfile={userProfile}
                  handleUserProfile={this.handleUserProfile}
                  handleSaveError={this.handleSaveError}
                  handleBlueSquare={this.handleBlueSquare}
                  isUserAdmin={isUserAdmin}
                  isUserSelf={isUserSelf}
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
                      id="nabLink-basic"
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
                      id="nabLink-time"
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
                      id="nabLink-teams"
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
                      id="nabLink-projects"
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
                  <BasicInformationTab
                    userProfile={userProfile}
                    isUserAdmin={isUserAdmin}
                    isUserSelf={isUserSelf}
                    handleUserProfile={this.handleUserProfile}
                    formValid={this.state.formValid}
                  />
                </TabPane>
                <TabPane tabId="2">
                  <VolunteeringTimeTab
                    userProfile={userProfile}
                    isUserAdmin={isUserAdmin}
                    isUserSelf={isUserSelf}
                    handleUserProfile={this.handleUserProfile}
                    timeEntries={this.props.timeEntries}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <TeamsTab
                    userTeams={this.state ? this.state.userProfile.teams : []}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onDeleteteam={this.onDeleteTeam}
                    isUserAdmin={isUserAdmin}
                    edit={isUserAdmin}
                  />
                </TabPane>
                <TabPane tabId="4">
                  <ProjectsTab
                    userProjects={this.state ? this.state.userProfile.projects : []}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={isUserAdmin}
                    edit={isUserAdmin}
                  />

                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Row>
            <Col sm={{ size: 'auto', offset: 3 }}>
              <SaveButton
                handleSubmit={this.handleSubmit}
                disabled={(!formValid.firstName || !formValid.lastName || !formValid.email) || !this.state.changed}
                userProfile={userProfile}
              />
            </Col>
            <Col sm={{ size: 'auto', offset: 1 }}>
              {canEdit && (
                <div className="profileEditButtonContainer">
                  <Link to={`/updatepassword/${this.state.userProfile._id}`}>
                    <Button>
                      {' '}
                      Update Password
                    </Button>
                  </Link>
                </div>
              )}
            </Col>
            <Col sm={{ size: 'auto', offset: 1 }}>
              <Link
                to={`/userprofile/${this.state.userProfile._id}`}
                className="btn btn-outline-danger"
                style={{ display: 'flex', margin: 5 }}
              >
                Cancel
              </Link>
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
