import React from "react";
import Joi from "joi";
import Form from "./common/form";
import { login, getCurrentUser } from "../services/loginService";
import logService from '../services/logService';
import {Redirect} from 'react-router-dom'

class Login extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {}
  };

  schema = {
    email: Joi.string()
      .email()
      .required()
      .label("Email"),
    password: Joi.string()
      .required()
      .label("Password")
  };

  doSubmit = async () => {
    const email = this.state.data.email;
    const password = this.state.data.password;
    try {
    await login({ email, password });  
    const {state}   = this.props.location;
     window.location = state? state.from.pathname : "/"
    } catch (ex) {
      logService.logError(ex);
      logService.logInfo(ex.response)
      //logService.logInfo(ex.response.status)
      if(ex.response && ex.response.status === 403)
      {       
        
        const errors = this.state.errors;
        errors["email"] = ex.response.data.message;//"Invalid email and/ or password.";
        this.setState({errors})
      }
    }
  };

  render() {
if (getCurrentUser()) 
return <Redirect to ="/"/>

    return (

      <div className = "container mt-5">
      <h2>Please Sign in</h2>
     
      <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
        {this.renderInput("email", "Email:")}
        {this.renderInput("password", "Password:", "password")}
        {this.renderButton("Submit")}
      </form>
     
      </div>
    );
  }
}

export default Login;