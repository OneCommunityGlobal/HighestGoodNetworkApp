import React from "react";
import Joi from "joi";
import Form from "../common/Form";
import { connect } from "react-redux";
import { getCurrentUser } from "../../services/loginService";
import { loginUser } from "../../actions/index"
import { Redirect } from "react-router-dom";

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

  componentDidMount() {
    document.title = "Login";
    if (this.state.user && this.state.user.role){
      window.location = '/';
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.state.user !== this.props.state.user && this.props.state.user !== null){
      if (this.props.state.user.errors){
        this.setState({ errors: this.props.state.user.errors });
      } 
      else if (this.props.state.user.new) {
        window.location = `/forcePasswordUpdate/${this.props.state.user.userId}`;
      } 
      else{
        const { state } = this.props.location;
        window.location = state ? state.from.pathname : "/dashboard";
      }
    }
  }

  doSubmit = async () => {
    const email = this.state.data.email;
    const password = this.state.data.password;
    // try {
    this.props.loginUser({ email, password });
      // if (result && result.userType === "newUser") {
      //   window.location = `/forcePasswordUpdate/${result.userId}`;
      //   return;
      // }
    //   const { state } = this.props.location;
    //   window.location = state ? state.from.pathname : "/dashboard";
    //   return;
    // } catch (ex) {
    //   if (ex.response && ex.response.status === 403) {
    //     const errors = this.state.errors;

    //     errors["email"] = ex.response.data.message;
    //     this.setState({ errors });
    //   }
    // }
  };

  render() {
    // if (getCurrentUser()) return <Redirect to="/" />;

    return (
      <div className="container mt-5">
        <h2>Please Sign in</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({ name: "email", label: "Email:" })}
          {this.renderInput({
            name: "password",
            label: "Password:",
            type: "password"
          })}
          {this.renderButton("Submit")}
        </form>
      </div>
    );
  }
}


const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, { 
  loginUser
})(Login);
