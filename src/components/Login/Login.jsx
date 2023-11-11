import React, { useState, useEffect, useRef } from 'react';
import Joi from 'joi';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Form from '../common/Form/Form';
import { loginUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';
import { boxStyle } from 'styles';

export class Login extends Form {
  state = {
    data: { email: '', password: '' },
    errors: {},
  };

  schema = {
    email: Joi.string()
      .email()
      .required()
      .label('Email'),
    password: Joi.string()
      .required()
      .label('Password'),
  };

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/');
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.auth !== this.props.auth) {
      if (this.props.auth.user.new) {
        const url = `/forcePasswordUpdate/${this.props.auth.user.userId}`;
        this.props.history.push(url);
      } else if (this.props.auth.isAuthenticated) {
        this.props.history.push('/dashboard');
      }
    }

    if (prevProps.errors.email !== this.props.errors.email) {
      this.setState({ errors: this.props.errors });
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  doSubmit = async () => {
    const email = this.state.data.email;
    const password = this.state.data.password;
    this.props.loginUser({ email, password });
    this.setState({ errors: this.props.errors });
  };

  render() {
    return (
      <div className="container mt-5">
        <h2>Please Sign in</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({ name: 'email', label: 'Email:' })}
          {this.renderInput({
            name: 'password',
            label: 'Password:',
            type: 'password',
          })}
          <div>
            {this.renderButton('Submit')}
            <Link to="forgotpassword">
              <span
                style={{
                  color: 'blue',
                  textDecorationLine: 'underline',
                  lineHeight: '50px',
                  float: 'right',
                  cursor: 'pointer',
                }}
              >
                forgot password?
              </span>
            </Link>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
});

export default withRouter(
  connect(mapStateToProps, {
    loginUser,
    clearErrors,
  })(Login),
);
