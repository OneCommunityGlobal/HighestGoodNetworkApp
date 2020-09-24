import React, { Component } from 'react';
import {
  Row,
  Label,
  Input,
  CardTitle,
  Col,
  Container,
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Badge,
  Collapse,
  Alert,
} from 'reactstrap';
import { StickyContainer, Sticky } from 'react-sticky';
import Image from 'react-bootstrap/Image';
import { Link } from 'react-router-dom';
import Loading from '../../common/Loading';

import { orange, warningRed } from '../../../constants/colors';
import BlueSquare from '../BlueSquares';
import Modal from '../UserProfileModal';
import UserLinks from '../UserLinks';
import ToggleSwitch from './ToggleSwitch';

// import styleProfile from '../UserProfile.module.scss';

import styleEdit from './UserProfileEdit.module.scss';

import TeamView from '../Teamsview';

const styleProfile = {};
class EditProfile extends Component {
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

    console.log('edit profile, component did mount, props: ', this.props);
    console.log('edit profile, state:', this.state);
  }

  handleUserProfile = (event) => {
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
      default:
        this.setState({
          ...userProfile,
        });
    }
  };

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
    console.log(filesizeKB);

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
      console.log(reader, file);

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
        userProfile.teams = userProfile.teams.filter((team) => team._id !== newTeam);
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

  handleNullState = (kind) => {
    console.log('before handle def:', this.state.userProfile);

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
    // console.log('Handle Blue Square: ', kind, ' date:', dateStamp, ' summary:', summary)
    const elem = document.getElementById('warningCard');
    elem.style.display = 'block';

    if (kind === 'add') {
      const newBlueSquare = { date: dateStamp, description: summary };
      this.setState((prevState) => ({
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
          currentBlueSquares.find((blueSquare) => blueSquare._id === id).date = dateStamp;
        }
        if (summary != null) {
          currentBlueSquares.find((blueSquare) => blueSquare._id === id).description = summary;
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

  handleSaveError = (message) => {
    this.setState({
      showModal: true,
      modalMessage: 'Must save first.',
      modalTitle: `Error, ${message}`,
      type: 'message',
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { updateUserProfile, match } = this.props;
    const { userProfile, formValid } = this.state;
    const submitResult = await updateUserProfile(match.params.userId, userProfile);
    console.log(submitResult);

    if (submitResult === 200) {
      this.setState({
        showModal: true,
        modalMessage: 'Your Changes were saved successfully',
        modalTitle: 'Success',
        type: 'save',
      });
      const elem = document.getElementById('warningCard');
      elem.style.display = 'none';
    } else {
      this.setState({
        showModal: true,
        modalMessage: 'Please try again.',
        modalTitle: 'Error',
        type: 'save',
      });
    }
  };

  updateLink = (personalLinksUpdate, adminLinksUpdate) => {
    const elem = document.getElementById('warningCard');
    elem.style.display = 'block';

    return this.setState(() => ({
      showModal: false,
      userProfile: {
        ...this.state.userProfile,
        personalLinks: personalLinksUpdate,
        adminLinks: adminLinksUpdate,
      },
    }));
  };

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

  modLinkButton = (canEditFields, isUserAdmin) => {
    if (canEditFields) {
      let user = 'user';
      if (isUserAdmin) {
        user = 'admin';
      }
      return (
        <button
          type="button"
          className={styleEdit.modLinkButton}
          onClick={() => {
            this.handleLinkModel(true, 'updateLink', user);
          }}
        >
          <i className="fa fa-wrench fa-lg" aria-hidden="true">
            {' '}
          </i>
        </button>
      );
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
    const { allTeams, fetching } = this.props.state.allTeamsData;

    // console.log('allteams...', allTeams)

    const { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined };
    const { userid: requestorId, role: requestorRole } = this.props.auth.user;

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
              <h7
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
                Reminder: You must click "Save Changes" at the bottom of this page. If you don't,
                changes to your profile will not be saved.
              </h7>
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
      infringments,
      privacySettings,
    } = userProfile;

    const isUserSelf = targetUserId === requestorId;
    const isUserAdmin = requestorRole === 'Administrator';
    const canEditFields = isUserAdmin || isUserSelf;

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
            <Label>Sorry, you do not have permison to edit this profile.</Label>
          </Row>
        </Col>
      );
    }

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

        <Col>
          <StickyContainer>
            {renderWarningCard()}
            <Row className={styleProfile.profileContainer}>
              <div className={styleProfile.whoSection}>
                <Label
                  for="newProfilePic"
                  htmlFor="newProfilePic"
                  className={styleEdit.profileEditTitleCenter}
                >
                  Change Profile Picture
                </Label>
                <Input
                  type="file"
                  name="newProfilePic"
                  id="newProfilePic"
                  style={{ visibility: 'hidden', width: 0, height: 0 }}
                  onChange={this.handleImageUpload}
                  accept="image/png,image/jpeg, image/jpg"
                />
                <div>
                  <Image
                    src={profilePic || '/defaultprofilepic.png'}
                    alt="Profile Picture"
                    roundedCircle
                    className="profilePicture"
                  />
                </div>
                <div className={styleEdit.inputSections}>
                  <Form>
                    <FormGroup>
                      <Label className={styleEdit.profileEditTitle}>Name:</Label>
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
                      <FormFeedback>First Name Can't be null</FormFeedback>
                    </FormGroup>
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
                      <FormFeedback>Last Name Can't be Null</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                      <Label className={styleEdit.profileEditTitle}>Title:</Label>
                      <Input
                        type="title"
                        name="jobTitle"
                        id="jobTitle"
                        value={jobTitle}
                        className={styleProfile.profileText}
                        onChange={this.handleUserProfile}
                        placeholder="Job Title"
                      />

                      <ToggleSwitch
                        switchType="bluesquares"
                        state={privacySettings?.blueSquares}
                        handleUserProfile={this.handleUserProfile}
                      />
                    </FormGroup>
                  </Form>
                  <BlueSquare
                    isUserAdmin={isUserAdmin}
                    blueSquares={infringments}
                    handleBlueSquare={this.handleBlueSquare}
                    handleSaveError={this.handleSaveError}
                  />
                  <br />
                </div>
              </div>
              <div className={styleEdit.detailEditSection}>
                <div className={styleEdit.inputSections}>
                  <Form>
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
                        className={styleProfile.profileText}
                        value={email}
                        onChange={this.handleUserProfile}
                        placeholder="Email"
                        invalid={!this.state.formValid.email}
                      />
                      <FormFeedback>Email is not Valid</FormFeedback>
                    </FormGroup>
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
                  </Form>
                  <div>
                    <div className={styleProfile.linkIconSection}>
                      <div className={styleProfile.icon}>
                        <i className="fa fa-link" aria-hidden="true" />
                      </div>
                    </div>

                    <div className={styleProfile.profileLinks}>
                      {this.modLinkButton(canEditFields, isUserAdmin)}
                      <UserLinks
                        linkSection="admin"
                        links={adminLinks}
                        handleLinkModel={this.handleLinkModel}
                        isUserAdmin={isUserAdmin}
                      />
                    </div>

                    <div className={styleProfile.profileLinks}>
                      <UserLinks
                        linkSection="user"
                        links={personalLinks}
                        handleLinkModel={this.handleLinkModel}
                        isUserAdmin={isUserAdmin}
                      />
                    </div>
                  </div>
                </div>
                <Label className={styleEdit.profileEditTitle}>Teams:</Label>
                <div className={styleEdit.teamsView}>
                  <TeamView
                    teamsdata={userProfile.teams}
                    edit
                    allTeams={allTeams}
                    handleTeam={this.handleTeam}
                  />
                </div>
              </div>

              {/* {allTeams.map(team => <div>{team.teamName}</div>)} */}

              <div className={styleEdit.profileViewButtonContainer}>
                <Link
                  to={`/userprofile/${this.state.userProfile._id}`}
                  className={styleEdit.profileViewButton}
                >
                  <i className="fa fa-eye fa-lg" aria-hidden="true">
                    {' '}
                    View
                  </i>
                </Link>
              </div>
            </Row>
            <Row
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 10,
                margin: 5,
              }}
            >
              <Button
                outline
                color="primary"
                onClick={this.handleSubmit}
                style={{ display: 'flex', margin: 5 }}
                disabled={!formValid.firstName || !formValid.lastName || !formValid.email}
              >
                Save Changes
              </Button>
              <Button
                outline
                color="danger"
                onClick={() => window.location.reload()}
                style={{ display: 'flex', margin: 5 }}
              >
                Cancel
              </Button>
            </Row>
          </StickyContainer>
        </Col>
      </div>
    );
  }
}

export default EditProfile;
