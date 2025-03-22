import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, FormGroup, Input, Label, Button, FormFeedback } from 'reactstrap';
import Joi from 'joi';
import { loginBMUser } from 'actions/authActions';
import './Login.css';
import logo from '../../../assets/images/logo2.png';

function LBLogin(props) {
  const { dispatch, auth, history, location } = props;
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enterPassword, setEnteredPassword] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  const prevLocation = location.state?.from || { pathname: '/lbdashboard' };

  useEffect(() => {
    if (auth.user.access && auth.user.access.canAccessCPPortal) {
      history.push(prevLocation.pathname);
    }
  }, [auth.user.access, history, prevLocation.pathname]);

  useEffect(() => {
    if (hasAccess) {
      history.push(prevLocation.pathname);
    }
  }, [hasAccess, history, prevLocation.pathname]);

  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().min(8),
  });

  const handleChange = ({ target }) => {
    if (validationError && target.name === validationError.label) {
      setValidationError(null);
    }
    if (target.name === 'email') {
      setEnteredEmail(target.value);
    } else {
      setEnteredPassword(target.value);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validate = schema.validate({ email: enteredEmail, password: enterPassword });
    if (validate.error) {
      return setValidationError({
        label: validate.error.details[0].context.label,
        message: validate.error.details[0].message,
      });
    }
    const res = await dispatch(loginBMUser({ email: enteredEmail, password: enterPassword }));
    if (res.statusText !== 'OK') {
      if (res.status === 422) {
        return setValidationError({
          label: res.data.label,
          message: res.data.message,
        });
      }
      return setValidationError({ label: '', message: '' });
    }
    return setHasAccess(!!res.data.token);
  };

  if (!auth.isAuthenticated) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  return (
    <div className="auth-page">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="form-container">
        <div className="form-top" />
        <div className="form-main">
          <h2>Log In To Listing and Biding Portal</h2>
          <p>Enter your credentials to access the Listing and Biding Portal Dashboard</p>
          <p>Note: You must use your Production/Main credentials for this login.</p>
          <div className="form-content">
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  invalid={validationError && validationError.label === 'email'}
                  onChange={handleChange}
                  value={enteredEmail}
                />
                {validationError && validationError.label === 'email' && (
                  <FormFeedback>{validationError.message}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup>
                <Label for="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  invalid={validationError && validationError.label === 'password'}
                  onChange={handleChange}
                  value={enterPassword}
                />
                {validationError && validationError.label === 'password' && (
                  <FormFeedback>{validationError.message}</FormFeedback>
                )}
              </FormGroup>
              <Button disabled={!enteredEmail || !enterPassword}>Login</Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(LBLogin);