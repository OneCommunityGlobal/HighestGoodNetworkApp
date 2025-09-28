// EPLogin.jsx
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, FormGroup, FormText, Input, Label, Button, FormFeedback } from 'reactstrap';
import Joi from 'joi-browser';

import { loginBMUser } from '~/actions/authActions';

function EPLogin(props) {
  const { dispatch, auth, history } = props;

  // local state
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [validationError, setValidationError] = useState(null);

  // if user already has access, push to dashboard (test expects this exact path)
  useEffect(() => {
    if (auth?.user?.access?.canAccessGEPortal) {
      history.push('/educationportal');
    }
  }, [auth?.user?.access?.canAccessGEPortal, history]);

  // Joi schema
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .min(8)
      .required(),
  });

  const handleChange = ({ target }) => {
    // clear field-specific error if user edits that field
    if (validationError && target.name === validationError.label) {
      setValidationError(null);
    }
    if (target.name === 'email') {
      setEnteredEmail(target.value);
    } else if (target.name === 'password') {
      setEnteredPassword(target.value);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // client-side validation
    const { error } = schema.validate(
      { email: enteredEmail, password: enteredPassword },
      { abortEarly: false },
    );
    if (error) {
      const first = error.details[0];
      return setValidationError({
        label: first?.context?.key || '',
        message: first?.message || 'Invalid input',
      });
    }

    // attempt login
    const res = await dispatch(loginBMUser({ email: enteredEmail, password: enteredPassword }));

    // server-side validation / error
    const ok = res?.status === 200 || res?.statusText === 'OK';
    if (!ok) {
      if (res?.status === 422) {
        return setValidationError({
          label: res.data?.label || '',
          message: res.data?.message || 'Invalid credentials',
        });
      }
      return setValidationError({ label: '', message: 'Login failed' });
    }

    // success -> navigate now (test spies on history.push)
    if (res?.data?.token) {
      history.push('/educationportal');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Log In To Good Education Portal</h2>
      <Form onSubmit={handleSubmit} noValidate>
        <FormText>Enter your current user credentials to access the Good Education Portal</FormText>
        <p>Note: You must use your Production/Main credentials for this login.</p>

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="form-control"
            invalid={validationError && validationError.label === 'email'}
            onChange={handleChange}
          />
          {validationError && validationError.label === 'email' && (
            <FormFeedback>{validationError.message}</FormFeedback>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="form-control"
            invalid={validationError && validationError.label === 'password'}
            onChange={handleChange}
          />
          {validationError && validationError.label === 'password' && (
            <FormFeedback>{validationError.message}</FormFeedback>
          )}
        </FormGroup>

        <Button
          type="submit"
          className="btn btn-secondary"
          disabled={!enteredEmail || !enteredPassword}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

// Important: wrap connected component so history/location props are injected
export default withRouter(connect(mapStateToProps)(EPLogin));
