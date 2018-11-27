import React from "react";
import Form from "./common/form";
import Joi from "joi";
import { toast } from "react-toastify";
import {updatePassword} from '../services/userProfileService';
import {logout} from '../services/loginService';

class UpdatePassword extends Form {
  state = {
    data: {currentpassword: "", newpassword: "", confirmnewpassword: "" },
    errors: {}
  };

  schema = {
    currentpassword : Joi.string().required(),
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
      return alert("Confirm Password must match New Password");
    }

    if(currentpassword === newpassword)
    {
      return alert("Old and new password should not be same");
     
    }

    let userId = this.props.match.params.userId;
    let data = {currentpassword, newpassword, confirmnewpassword };
    try{
   let result = await updatePassword(userId, data);
   console.log(result)
   console.log(result.response);
   
      logout();
      toast.success("Your password has been updated.You will be logged out and directed to login page where you can login with your new password.", {
        onClose: () => (window.location = "/login")
      });
     
    
   }
    catch (exception) {
      console.log( exception.response.data.error);
      exception.response.status === 400? toast.error(exception.response.data.error) : toast.error("Something went wrong. Please contact your administrator.");
      
  };
}

  render() {
    return (
      <div className="container mt-5">
        <h2>Change Password</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
        {this.renderInput("currentpassword", "Current Password:", "password")}
          {this.renderInput("newpassword", "New Password:", "password")}
          {this.renderInput("confirmnewpassword","Confirm Password:","password")}
          {this.renderButton("Submit")}
        </form>
      </div>
    );
  }
}

export default UpdatePassword;
