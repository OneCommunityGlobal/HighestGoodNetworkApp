import React, { Component } from "react";
import Loading from "./common/Loading";
import {
  getUserProfile,
  editUserProfileData
} from "../services/userProfileService";
import { getCurrentUser } from "../services/loginService";
import Profile from "./Profile";
import { toast } from "react-toastify";

class UserProfile extends Component {
  state = {
    requestorRole: "",
    requestorId: "",
    isLoading: true,
    userProfile: {},
    targetUserId: ""
  };

  async componentDidMount() {
    document.title = " User Profile";
    try {
      let { userid: requestorId, role: requestorRole } = {
        ...getCurrentUser()
      };
      let { userId: targetUserId } = this.props.match.params;
      let { data: userProfile } = { ...(await getUserProfile(targetUserId)) };
      let isLoading = false;
      this.setState({
        requestorId,
        requestorRole,
        isLoading,
        userProfile,
        targetUserId
      });
    } catch (error) {
      if (error.response) {
        toast.error("This is an invalid profile", {
          onClose: () => this.props.history.goBack()
        });
      }
    }
  }
  handleSubmit = async data => {
    try {
      await editUserProfileData(this.state.targetUserId, data);
      toast.success("Edits were successfully saved");
    } catch (error) {
      toast.error(error);
    }
  };

  render() {
    if (this.state.isLoading === true) {
      return <Loading />;
    }

    let { requestorId, requestorRole, userProfile, targetUserId } = this.state;

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

export default UserProfile;
