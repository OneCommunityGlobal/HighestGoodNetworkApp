import { Form, Input, Button, FormFeedback, FormGroup } from 'reactstrap';
import { User, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

import styles from './Login.module.css';

function Login() {
  const [enteredUserName, setEnteredUserNAme] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  //Live Validation
  const validateField = (name, value) => {
    value = value.trim();
    if (name === 'username') {
      if (!value) return 'Username is required';
      // make backend call to check whether entered username is not used
      if (value.length < 3) return 'Username must be at least 8 characters';
      return '';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;
    if (name === 'username') setEnteredUserNAme(value);
    if (name === 'password') setEnteredPassword(value);

    const errorMsg = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Final client-side validation
    const userNameError = validateField('email', enteredUserName);
    const passwordError = validateField('password', enteredPassword);
    if (userNameError || passwordError) {
      setFieldErrors({ username: userNameError, password: passwordError });
      return;
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTitle}>Highest Good Network</h1>
      <h1 className={styles.pageTitle}> Material Equipemnt Tool Tracker</h1>
      <div className={styles.formContainer}>
        <Form onSubmit={handleSubmit}>
          <User size="70" strokeWidth={1.5} aria-hidden="true" />
          <h2 className={styles.heading2}>Welcome to HGN</h2>
          <FormGroup>
            <div className={styles.inputWrapper}>
              <User size="30" strokeWidth={1.5} aria-hidden="true" />
              <Input
                type="text"
                placeholder="username"
                name="username"
                id="username"
                value={enteredUserName}
                className={styles.inputBox}
                onChange={handleChange}
                aria-label="Username input field"
                invalid={!!fieldErrors.username}
                aria-invalid={!!fieldErrors.username}
                aria-describedby={!!fieldErrors.username ? 'username-error' : undefined}
              />
            </div>
            {fieldErrors.username && (
              <FormFeedback style={{ display: 'block' }} id="username-error">
                {fieldErrors.username}
              </FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <div className={styles.inputWrapper}>
              <Lock size="25" strokeWidth={1.5} aria-hidden="true" />
              <Input
                placeholder="password"
                name="password"
                id="password"
                className={styles.inputBox}
                type={showPassword ? 'text' : 'password'}
                value={enteredPassword}
                onChange={handleChange}
                invalid={!!fieldErrors.password}
                aria-label="Password input field"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={!!fieldErrors.password ? 'password-error' : undefined}
              />
              <span
                role="button"
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(prev => !prev)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setShowPassword(prev => !prev);
                }}
              >
                <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} />
              </span>
            </div>
            {fieldErrors.password && (
              <FormFeedback id="password-error" className="d-block error">
                {fieldErrors.password}
              </FormFeedback>
            )}
          </FormGroup>
          <div className={styles.forgetPswd}>
            <a href="https://www.highestgood.com/forgotpassword">Forgot your password?</a>
          </div>
          {/* Login Button */}
          <div>
            <Button
              className={styles.logInBtn}
              disabled={
                !enteredUserName ||
                !enteredPassword ||
                //Object.values(fieldErrors).some(Boolean) ||
                loading
              }
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
          <div>
            <p className={styles.infoSec}>
              If you do not have login info, contact the admin({supportEmail})
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
export default Login;
