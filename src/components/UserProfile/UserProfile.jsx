import React, { Component } from "react";
import Loading from "../common/Loading";

import { Row, Label, Input, Badge, Col, Container } from "reactstrap";
import Image from "react-bootstrap/Image";
import { orange, silverGray, warningRed } from "../../constants/colors";
import BlueSquare from "./BlueSquares";
import Modal from "./UserProfileModal";
import UserLinks from "./UserLinks";

// import Teams from "./UserTeams";

import styleProfile from "./UserProfile.css";

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
		privacySettings:{
			email: true,
			phoneNumber: true,
			blueSquares: true
		}
  };

  async componentDidMount() {
    if (this.props.match) {
      let userId = this.props.match.params.userId;
      await this.props.getUserProfile(userId);
      await this.props.getUserTeamMembers(userId);
      if (this.props.userProfile.firstName.length) {
				if (!this.props.userProfile.privacySettings){
					this.setState({
						isLoading: false,
						userProfile:{
							...this.props.userProfile,
							privacySettings:{
								email: true,
								phoneNumber: true,
								blueSquares: true
							}
						}
					});
				}else{
					this.setState({
						isLoading: false,
						userProfile: this.props.userProfile
					});
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
    let { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined };
    let { userid: requestorId, role: requestorRole } = this.props.auth.user;

    const { userProfile, isLoading, showModal } = this.state;

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

    console.log( 'user profile data:', userProfile)

    let isUserSelf = targetUserId === requestorId;
    const isUserAdmin = requestorRole === "Administrator";
    let canEdit = isUserAdmin || isUserSelf;

    if (isLoading === true) {
      return <Loading />;
    }

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
            <Row id="profileContainer" className={"profileContainer"}>
              <div className="whoSection">
                <div>
                  <Image
                    src={profilePic || "/defaultprofilepic.png"}
                    alt="Profile Picture"
                    roundedCircle
                    className="profilePicture"
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

              <div className="detailSectionContainer">
                <div className="detailSection">
                  {privacySettings["email"] && (
                    <div className={"iconContainer"}>
                      <div className={"icon"}>
                        <i className="fa fa-envelope-o" aria-hidden="true" />
                      </div>
                      {email}
                    </div>
                  )}
                  {privacySettings["phoneNumber"] && (
                    <div className={"iconContainer"}>
                      <div className={"icon"}>
                        <i className="fa fa-phone" aria-hidden="true"></i>
                      </div>
                      {this.formatPhoneNumber(phoneNumber)}
                    </div>
                  )}
                  <div className={"iconContainer"}>
                    <div className={"icon"}>
                      <i className="fa fa-link" aria-hidden="true"></i>
                    </div>
                  </div>
                  <div className={"profileLinks"}>
                    <UserLinks
                      linkSection="admin"
                      links={adminLinks}
                      handleLinkModel={this.handleLinkModel}
                      isUserAdmin={isUserAdmin}
                    />
                  </div>
                  <div className={"profileLinks"}>
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
                <div className={"profileEditButtonContainer"}>
                  <Badge
                    className={"profileEditButton"}
                    href={"/userprofileedit/" + this.state.userProfile._id}
                  >
                    <i className="fa fa-pencil-square-o fa-lg" aria-hidden="true">
                      {" "}
                      Edit
                    </i>
                  </Badge>
                </div>
              )}
            </Row>
          </Col>

        </div>
      </div>
    );
  }
}

export default UserProfile;
