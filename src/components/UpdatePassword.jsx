import React from "react";
import { toast } from "react-toastify";
import Form from "./common/form";
import { updatePasswordSchema as schema } from "../schema";
import { updatePassword } from "../services/userProfileService";
import { logout } from "../services/loginService";

class UpdatePassword extends Form {
  state = {
    data: { currentpassword: "", newpassword: "", confirmnewpassword: "" },
    errors: {}
  };

  componentDidMount() {
    document.title = "Update Password";
  }

  schema = schema;

  doSubmit = async () => {
    const { currentpassword, newpassword, confirmnewpassword } = {
      ...this.state.data
    };
    const userId = this.props.match.params.userId;
    const data = { currentpassword, newpassword, confirmnewpassword };
    try {
      await updatePassword(userId, data);
      logout();
      toast.success(
        "Your password has been updated. You will be logged out and directed to login page where you can login with your new password.",
        {
          onClose: () => window.location.assign("/login")
        }
      );
    } catch (exception) {
      if (exception.response.status === 400) {
        const { errors } = this.state;
        errors.currentpassword = exception.response.data.error;
        this.setState({ errors });
      } else {
        toast.error("Something went wrong. Please contact your administrator.");
      }
    }
  };

  render() {
    return (
      <div className="container mt-5">
        <h2>Change Password</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({
            name: "currentpassword",
            label: "Current Password:",
            type: "password"
          })}
          {this.renderInput({
            name: "newpassword",
            label: "New Password:",
            type: "password"
          })}
          {this.renderInput({
            name: "confirmnewpassword",
            label: "Confirm Password:",
            type: "password",
            "data-refers": "newpassword"
          })}
          {this.renderButton("Submit")}
        </form>
      </div>
    );
  }
}

export default UpdatePassword;
