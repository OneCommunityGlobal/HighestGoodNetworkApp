import React, { Component } from "react";
import Loading from "../common/Loading";

import { Row, Label, Input, Badge, Col, Container, Button } from "reactstrap";
import Image from "react-bootstrap/Image";
import { orange, silverGray, warningRed } from "../../constants/colors";
import BlueSquare from "./BlueSquares";
import Modal from "./UserProfileModal";
import UserLinks from "./UserLinks";
import FourOFour from "./FourOFour";

import styleProfile from "./UserProfile.module.scss";

import { Link } from 'react-router-dom';
import UserTeamProjectContainer from "./TeamsAndProjects/UserTeamProjectContainer";


class UserProfile extends Component {

  state = {
    isLoading: true,
    error: "",
    userProfile: {},
    firstNameError: "",
    lastNameError: "",
    imageUploadError: "",
    isValid: false,
    id: "",
    privacySettings: {
      email: true,
      phoneNumber: true,
      blueSquares: true
    }
  };

  async componentDidMount() {
    if (this.props.match) {
      let userId = this.props.match.params.userId;
      await this.props.getUserProfile(userId);
      if (this.props.userProfile === '404') {
        this.setState({
          isLoading: false
        })
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
                  blueSquares: true
                }
              }
            });
          } else {
            this.setState({
              isLoading: false,
              userProfile: this.props.userProfile
            });
          }
        }
      }
    }
    this.props.getAllUserTeams();
    this.props.fetchAllProjects();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.match !== prevProps.match) {
      console.log('component needs to update')

      let userId = this.props.match.params.userId;
      await this.props.getUserProfile(userId);

      if (this.props.userProfile === '404') {
        this.setState({
          isLoading: false
        })
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
                  blueSquares: true
                }
              }
            });
          } else {
            this.setState({
              isLoading: false,
              userProfile: this.props.userProfile
            });
          }
        }
      }
    }
  }

  handleBlueSquare = (status = true, type = "message", blueSquareID = "") => {
    if (type === "viewBlueSquare") {
      this.setState({
        showModal: status,
        modalTitle: "Blue Square",
        type: type,
        id: blueSquareID,
      });
    } else if (blueSquareID === "none") {
      this.setState({
        showModal: status,
        modalTitle: "Save & Refresh",
        modalMessage: "",
        type: type,
      });
    }
  };

  formatPhoneNumber = (str) => {
    // Filter only numbers from the input
    let cleaned = ("" + str).replace(/\D/g, "");
    if (cleaned.length == 10) {
      // Domestic (USA)
      return [
        "( ",
        cleaned.substring(0, 3),
        " ) ",
        cleaned.substring(3, 6),
        " - ",
        cleaned.substring(6, 10),
      ].join("");
    } else if (cleaned.length == 11) {
      // International
      return [
        "+",
        cleaned.substring(0, 1),
        "( ",
        cleaned.substring(1, 4),
        " ) ",
        cleaned.substring(4, 7),
        " - ",
        cleaned.substring(7, 11),
      ].join("");
    }
    // Unconventional
    return str;
  };

  render() {
    debugger;
    const { userProfile, isLoading, error, showModal } = this.state;
    // let { allTeams } = this.props.allTeams.allTeamsData;
    // let { projects } = this.props.allProjects.projects;
    // console.log(projects);

    let {
      firstName,
      lastName,
      email,
      profilePic,
      phoneNumber,
      jobTitle = "",
      personalLinks,
      adminLinks,
      infringments,
      privacySettings,
      teams,
    } = userProfile;

    if (isLoading) {
      return (
        <Container fluid>
          <Row className="text-center" data-test="loading">
            <Loading />
          </Row>
        </Container>
      )
    }

    if (this.props.userProfile === '404') {
      return <FourOFour />
    }

    let { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined };

    let { userid: requestorId, role: requestorRole } = this.props.auth.user;

    let isUserSelf = targetUserId === requestorId;
    const isUserAdmin = requestorRole === "Administrator";
    let canEdit = isUserAdmin || isUserSelf;


    return (
      <div>
        <div style={{ display: "flex" }}>
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

          <Col>
            <Row id="profileContainer" className={styleProfile.profileContainer}>
              <div className={styleProfile.whoSection}>
                <div>
                  <Image
                    src={profilePic || "/defaultprofilepic.png"}
                    alt="Profile Picture"
                    roundedCircle
                    className={styleProfile.profilePicture}
                  />
                </div>
                <Label>
                  {firstName} {lastName}
                </Label>
                <Label>{jobTitle}</Label>
                {privacySettings["blueSquares"] && (
                  <div>
                    <BlueSquare
                      isUserAdmin={false}
                      blueSquares={infringments}
                      handleBlueSquare={this.handleBlueSquare}
                    />
                  </div>
                )}
              </div>

              <div className={styleProfile.detailSectionContainer}>
                <div className={styleProfile.detailSection}>
                  {privacySettings["email"] && (
                    <div className={styleProfile.iconContainer}>
                      <div className={styleProfile.icon}>
                        <i className="fa fa-envelope-o" aria-hidden="true" />
                      </div>
                      {email}
                    </div>
                  )}
                  {privacySettings["phoneNumber"] && (
                    <div className={styleProfile.iconContainer}>
                      <div className={styleProfile.icon}>
                        <i className="fa fa-phone" aria-hidden="true"></i>
                      </div>
                      {this.formatPhoneNumber(phoneNumber)}
                    </div>
                  )}
                  <div className={styleProfile.iconContainer}>
                    <div className={styleProfile.icon}>
                      <i className="fa fa-link" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div className={styleProfile.profileLinks}>
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

              {canEdit && (
                <div className={styleProfile.profileEditButtonContainer}>

                  <Link to={"/userprofileedit/" + this.state.userProfile._id} className={styleProfile.profileEditButton}>
                    <i className="fa fa-pencil-square-o fa-lg" aria-hidden="true">
                      {" "}
                      Edit
                    </i>
                  </Link>

                </div>
              )}
            </Row>
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
            isUserAdmin={isUserAdmin} />

        </div>

      </div>
    );
  }

  onAssignTeam = (assignedTeam) => {
    let _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.teams) {
      _userProfile.teams.push(assignedTeam)
    } else {
      _userProfile.teams = [assignedTeam]
    }

    this.setState({
      userProfile: _userProfile
    }, () => { this.saveChanges() })
  }

  onAssignProject = (assignedProject) => {
    let _userProfile = Object.assign({}, this.state.userProfile);
    if (_userProfile.teams) {
      _userProfile.projects.push(assignedProject)
    } else {
      _userProfile.projects = [assignedProject]
    }

    this.setState({
      userProfile: _userProfile
    }, () => { this.saveChanges() })
  }

  saveChanges = () => {
    this.props.updateUserProfile(
      this.props.match.params.userId,
      this.state.userProfile
    )
  }
}

export default UserProfile;
