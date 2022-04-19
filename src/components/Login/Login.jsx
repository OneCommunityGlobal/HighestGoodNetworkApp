import React, { useState, useEffect, useRef } from 'react';
import Joi from 'joi';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Form from '../common/Form/Form';
import { loginUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';

/* export const Login = (props) => {
  console.log('Form: ', Form);
  const [data, setData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const schema = {
    email: Joi.string()
      .email()
      .required()
      .label('Email'),
    password: Joi.string()
      .required()
      .label('Password'),
  };

  // Hook
  function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
      ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
  }

  const prevProps = usePrevious(props);

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.history.push('/');
    }
  }, []);

  useEffect(() => {
    if (preVprops.auth !== props.auth) {
      if (props.auth.user.new) {
        const url = `/forcePasswordUpdate/${props.auth.user.userId}`;
        props.history.push(url);
      } else if (props.auth.isAuthenticated) {
        const { state } = props.location;
        props.history.push(state ? state.from.pathname : '/dashboard');
      }
    }

    if (prevProps.errors.email !== props.errors.email) {
      setErrors({ errors: props.errors });
    }

    return () => {
      props.clearErrors();
    };

  }, [prevProps]);

  const doSubmit = async () => {
    const email = data.email;
    const password = data.password;
    props.loginUser({ email, password });
  };

  return (
    <div className="container mt-5">
      <h2>Please Sign in</h2>

      <form className="col-md-6 xs-12" onSubmit={doSubmit}>
        {Form.renderInput({ name: 'email', label: 'Email:' })}
        {Form.renderInput({
          name: 'password',
          label: 'Password:',
          type: 'password',
        })}
        {Form.renderButton('Submit')}
        <Link to="forgotpassword">
          <span
            style={{
              color: 'blue',
              textDecorationLine: 'underline',
              marginLeft: '240px',
              cursor: 'pointer',
            }}
          >
            forgot password?
          </span>
        </Link>
      </form>
    </div>
  );
} */

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
    // document.title = "Login";
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
        const { state } = this.props.location;
        this.props.history.push(state ? state.from.pathname : '/dashboard');
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
          {this.renderButton('Submit')}
          <Link to="forgotpassword">
            <span
              style={{
                color: 'blue',
                textDecorationLine: 'underline',
                marginLeft: '240px',
                cursor: 'pointer',
              }}
            >
              forgot password?
            </span>
          </Link>
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
