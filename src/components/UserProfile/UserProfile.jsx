import React, { Component } from "react";
import { connect } from "react-redux";
import Loading from "../common/Loading";
import { getjwt } from "../../services/loginService";
import {
  getCurrentUser,
  getUserProfile,
  clearUserProfile
} from "../../actions";
import Profile from "../Profile";

class UserProfile extends Component {
  state = {
    isLoading: true
  };

  componentDidMount() {
    this.props.getCurrentUser(getjwt());
    const { userId: targetUserId } = this.props.match.params;
    this.props.getUserProfile(targetUserId);
  }

  componentDidUpdate() {
    const userProfile = this.props.state.userProfile;
    if (userProfile && this.state.isLoading === true) {
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount() {
    this.props.clearUserProfile();
  }

  // handleSubmit = async data => {
  //   try {
  //     await editUserProfileData(this.state.targetUserId, data);
  //     toast.success("Edits were successfully saved");
  //   } catch (error) {
  //     toast.error(error);
  //   }
  // };

  render() {
    if (this.state.isLoading === true) {
      return <Loading />;
    }
    const { userId: targetUserId } = this.props.match.params;
    const { userid: requestorId, role: requestorRole } = this.props.state.user;
    const { userProfile } = this.props.state;
    return (
      <Profile
        requestorId={requestorId}
        requestorRole={requestorRole}
        userProfile={userProfile}
        targetUserId={targetUserId}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

const mapStateToProps = state => {
  return { state };
};

export default connect(
  mapStateToProps,
  {
    getCurrentUser,
    getUserProfile,
    clearUserProfile
  }
)(UserProfile);
