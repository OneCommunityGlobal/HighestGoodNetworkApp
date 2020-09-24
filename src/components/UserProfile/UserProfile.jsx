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
import Loading from '../common/Loading';
import { orange, silverGray, warningRed } from '../../constants/colors';
import BlueSquare from './BlueSquares';
import Modal from './UserProfileModal';
import UserLinks from './UserLinks';
// import styleProfile from './UserProfile.module.scss';
import './UserProfile.scss';
import TeamView from './Teamsview';

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
    const { userProfile, isLoading, error, showModal } = this.state;

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

    return (
      <div>
        {showModal && (
          <Modal
            isOpen={this.state.showModal}
            closeModal={() => {
              this.setState({ showModal: false });
            }}
            modalMessage={this.state.modalMessage}
            modalTitle={this.state.modalTitle}
            type={this.state.type}
            updateLink={this.updateLink}
            updateBlueSquare={this.updateBlueSquare}
            linkType={this.state.linkType}
            userProfile={this.state.userProfile}
            id={this.state.id}
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
            <Col md="6">
              <div className="profile-head">
                <h5>{`${firstName} ${lastName}`}</h5>
                <h6>{jobTitle}</h6>
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
                      // style={{
                      //   fontWeight: 600,
                      //   border: 'none',
                      // }}
                    >
                      More Tabs
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
            </Col>
            <Col md="2">
              {canEdit && (
                <div className="profileEditButtonContainer">
                  <Link
                    to={`/userprofileedit/${this.state.userProfile._id}`}
                    className="profileEditButton"
                  >
                    <Button className="profileEditButton" aria-hidden="true">
                      {' '}
                      Edit
                    </Button>
                  </Link>
                </div>
              )}
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
                <p>BLUE SQAURES</p>
                <BlueSquare
                  isUserAdmin={false}
                  blueSquares={infringments}
                  handleBlueSquare={this.handleBlueSquare}
                />
              </div>
            </Col>
            <Col md="8">
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
                  <Row>
                    <Col md="6">
                      <Label>Email</Label>
                    </Col>
                    <Col md="6">
                      <p>{email}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <Label>Phone</Label>
                    </Col>
                    <Col md="6">
                      <p>{this.formatPhoneNumber(phoneNumber)}</p>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tabId="2" />
              </TabContent>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default UserProfile;
