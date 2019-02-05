import React, { Component } from "react";
import Loading from "./common/Loading";
import { connect } from "react-redux";
import { getjwt } from "../services/loginService";
import { getCurrentUser, getUserProfile, clearUserProfile } from "../actions";
import Profile from "./Profile";

class UserProfile extends Component {

  state = {
    isLoading: true
  }

  componentDidMount() {
    this.props.getCurrentUser(getjwt());
    let { userId: targetUserId } = this.props.match.params;
    this.props.getUserProfile(targetUserId)
  }

  componentDidUpdate() {
    let userProfile = this.props.state.userProfile
    if (userProfile && this.state.isLoading === true) {
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount() {
    this.props.clearUserProfile();
  }

  render() {
    if (this.state.isLoading === true) {
      return <Loading />;
    }
    let { userId: targetUserId } = this.props.match.params;
    let { userid: requestorId ,  role: requestorRole } = this.props.state.user;
    let { userProfile } = this.props.state;
    
    return (
      <Profile
        requestorId={requestorId}
        requestorRole={requestorRole}
        userProfile={userProfile}
        targetUserId={targetUserId}
      />
    );
  }
}

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, { 
  getCurrentUser, 
  getUserProfile, 
  clearUserProfile 
})(UserProfile);
