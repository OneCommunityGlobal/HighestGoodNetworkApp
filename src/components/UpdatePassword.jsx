import React from "react";
import Form from "./common/form";
import Joi from "joi";
import { toast } from "react-toastify";
import { updatePassword } from "../services/userProfileService";
import { logout } from "../services/loginService";

class UpdatePassword extends Form {
  state = {
    data: { currentpassword: "", newpassword: "", confirmnewpassword: "" },
    errors: {}
  };

  schema = {
    currentpassword: Joi.string().required().label("Current Password"),
    newpassword: Joi.string()
      .regex(
        /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
      )
      .required()
      .label("New Password")
      .options({
        language: {
          string: {
            regex: {
              base:
                "should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character"
            }
          }
        }
      }),

    confirmnewpassword: Joi.string()
      .regex(
        /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
      )
      .required()
      .label("Confirm Password")
      .options({
        language: {
          string: {
            regex: {
              base:
                "should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character"
            }
          }
        }
      })
  };

  doSubmit = async () => {
    const { currentpassword, newpassword, confirmnewpassword } = {
      ...this.state.data
    };

    if (newpassword !== confirmnewpassword) {
      let {errors} = this.state;
      errors["confirmnewpassword"] =  "Confirm Password must match New Password"
      return this.setState({errors});
    }

    if (currentpassword === newpassword) {
      let {errors} = this.state;
      errors["newpassword"] =  "Old and new passwords should not be same"
      return this.setState({errors});
    }

    let userId = this.props.match.params.userId;
    let data = { currentpassword, newpassword, confirmnewpassword };
    try {
     
      await updatePassword(userId, data);
      logout();
      toast.success(
        "Your password has been updated.You will be logged out and directed to login page where you can login with your new password.",
        {
          onClose: () => (window.location = "/login")
        }
      );
    } catch (exception) {
          
      if(exception.response.status === 400)
         {
          let {errors} = this.state;
          errors["currentpassword"] =  exception.response.data.error
          this.setState({errors});
                 }
        else {
        toast.error(
            "Something went wrong. Please contact your administrator."
          );
        }
    }
  };

  render() {
    return (
      <div className="container mt-5">
        <h2>Change Password</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput("currentpassword", "Current Password:", "password")}
          {this.renderInput("newpassword", "New Password:", "password")}
          {this.renderInput(
            "confirmnewpassword",
            "Confirm Password:",
            "password"
          )}
          {this.renderButton("Submit")}
        </form>
      </div>
    );
  }
}

export default UpdatePassword;
