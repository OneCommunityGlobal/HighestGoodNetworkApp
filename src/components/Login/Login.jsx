import React from "react";
import Joi from "joi";
import Form from "../common/Form";
import { connect } from "react-redux";
import { loginUser } from "../../actions/authActions"

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
    if (this.props.auth.isAuthenticated){
      window.location = '/';
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.auth !== this.props.auth){
      if (this.props.auth.errors){
        this.setState({ errors: this.props.auth.errors });
      } 
      else if (this.props.auth.user.new) {
        window.location = `/forcePasswordUpdate/${this.props.auth.user.userId}`;
      } 
      else if (this.props.auth.isAuthenticated){
        const { state } = this.props.location;
        window.location = state ? state.from.pathname : "/dashboard";
      }
    }
  }

  doSubmit = async () => {
    const email = this.state.data.email;
    const password = this.state.data.password;
    this.props.loginUser({ email, password });
  };

  render() {
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


const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { 
  loginUser
})(Login);
