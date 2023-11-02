import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Form, FormGroup, FormText, Input, Label, Button, FormFeedback } from 'reactstrap';
import Joi from 'joi';

import { loginBMUser } from 'actions/authActions';

function BMLogin(props) {
  const { dispatch, auth, history, location } = props;
  // state
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enterPassword, setEnteredPassword] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // push to dashboard if user is authenticated
  useEffect(() => {
    if (auth.user.access && auth.user.access.canAccessBMPortal) {
      history.push('/bmdashboard');
    }
  }, []);
  useEffect(() => {
    if (hasAccess) {
      history.push('/bmdashboard');
    }
  }, [hasAccess]);

  // Note: email input type="text" to validate with Joi
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string().min(8),
  });

  const handleChange = ({ target }) => {
    // clears validationError only if error input is being edited
    if (validationError && target.name === validationError.label) {
      setValidationError(null);
    }
    if (target.name === 'email') {
      setEnteredEmail(target.value);
    } else {
      setEnteredPassword(target.value);
    }
  };

  // submit login
  const handleSubmit = async e => {
    e.preventDefault();
    // client side error validation
    // Note: Joi by default stops validation on first error
    const validate = schema.validate({ email: enteredEmail, password: enterPassword });
    if (validate.error) {
      return setValidationError({
        label: validate.error.details[0].context.label,
        message: validate.error.details[0].message,
      });
    }
    const res = await dispatch(loginBMUser({ email: enteredEmail, password: enterPassword }));
    // server side error validation
    if (res.statusText !== 'OK') {
      if (res.status === 422) {
        return setValidationError({
          label: res.data.label,
          message: res.data.message,
        });
      }
      // TODO: add additional error handling
      return setValidationError({
        label: '',
        message: '',
      });
    }
    // initiate push to BM Dashboard if validated (ie received token)
    return setHasAccess(!!res.data.token);
  };

  // push Dashboard if not authenticated
  if (!auth.isAuthenticated) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  return (
    <div className="container mt-5">
      <h2>Log In To Building Management Dashboard</h2>
      <Form onSubmit={handleSubmit}>
        <FormText>
          Enter your current user credentials to access the Building Management Dashboard
        </FormText>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="text"
            invalid={validationError && validationError.label === 'email'}
            onChange={handleChange}
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
          />
          {validationError && validationError.label === 'password' && (
            <FormFeedback>{validationError.message}</FormFeedback>
          )}
        </FormGroup>
        <Button disabled={!enteredEmail || !enterPassword}>Submit</Button>
      </Form>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(BMLogin);
