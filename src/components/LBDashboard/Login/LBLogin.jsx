import { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Button,
  FormFeedback,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { loginBMUser } from '~/actions/authActions';
import styles from './Login.module.css';
import logo from '../../../assets/images/logo2.png';
import isEmail from 'validator/lib/isEmail';

function LBLogin(props) {
  const { dispatch, auth } = props;
  const history = useHistory();
  const location = useLocation();
  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const prevLocation = location?.state?.from || { pathname: '/lbdashboard' };
  const darkMode = useSelector(state => state.theme.darkMode);

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

  // First-keystroke live validation
  const validateField = (name, value) => {
    value = value.trim();
    if (name === 'email') {
      if (!value) return 'Email is required';
      if (!isEmail(value)) return 'Invalid email';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
    }
    return '';
  };

  const handleChange = ({ target }) => {
    const { name, value } = target;

    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'email') setEnteredEmail(value);
    if (name === 'password') setEnteredPassword(value);

    const errorMsg = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));

    if (backendError && !errorMsg) setBackendError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Final client-side validation
    const emailError = validateField('email', enteredEmail);
    const passwordError = validateField('password', enteredPassword);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }
    setLoading(true);
    // Dispatch login action
    const res = await dispatch(loginBMUser({ email: enteredEmail, password: enteredPassword }));

    if (res.statusText !== 'OK') {
      // Handle backend errors
      if (res.status === 422 && res.data?.label) {
        setFieldErrors(prev => ({
          ...prev,
          [res.data.label]: res.data.message,
        }));
      } else {
        setBackendError(res.data?.message || 'Something went wrong');
      }
      setLoading(false);
      return;
    }

    setBackendError('');
    setHasAccess(!!res.data.token);
  };

  if (!auth.isAuthenticated) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  return (
    <div className={`${styles.authPage} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={`${styles.formContainer}`}>
        <div className={styles.formTop} />
        <div className={`${styles.formMain} ${darkMode ? styles.dark : ''}`}>
          <h2>Log In To Listing and Biding Portal</h2>
          <p>Enter your credentials to access the Listing and Biding Portal Dashboard</p>
          <p>Note: You must use your Production/Main credentials for this login.</p>

          <div className={styles.formContent}>
            <Form onSubmit={handleSubmit} className={styles.loginForm}>
              {/* Backend/general error */}
              {backendError && (
                <div className="alert alert-danger" role="alert">
                  {backendError}
                </div>
              )}

              {/* Email */}
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={enteredEmail}
                  onChange={handleChange}
                  invalid={touched.email && !!fieldErrors.email}
                  aria-invalid={touched.email && !!fieldErrors.email}
                  aria-describedby={touched.email && fieldErrors.email ? 'email-error' : undefined}
                  className={`${darkMode ? 'darkInput' : ''}`}
                />
                {touched.email && fieldErrors.email && (
                  <FormFeedback id="email-error">{fieldErrors.email}</FormFeedback>
                )}
              </FormGroup>
              <FormGroup className="pswd">
                <Label for="password">Password</Label>
                <InputGroup>
                  <Input
                    data-testid="password-input"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={enteredPassword}
                    onChange={handleChange}
                    invalid={touched.password && !!fieldErrors.password}
                    aria-label="Password"
                    aria-invalid={touched.password && !!fieldErrors.password}
                    aria-describedby={
                      touched.password && fieldErrors.password ? 'password-error' : undefined
                    }
                    autoComplete="current-password"
                    onKeyUp={e => setCapsLockOn(e.getModifierState('CapsLock'))}
                  />

                  <InputGroupText
                    role="button"
                    tabIndex={0}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(prev => !prev)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') setShowPassword(prev => !prev);
                    }}
                    className={`${darkMode ? styles.dark1 : ''}`}
                  >
                    <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} />
                  </InputGroupText>
                </InputGroup>
                {capsLockOn && <span className={styles.capsMsg}> &nbsp; Caps Lock is ON</span>}
                {touched.password && fieldErrors.password && (
                  <FormFeedback id="password-error" className="d-block">
                    {fieldErrors.password}
                  </FormFeedback>
                )}
              </FormGroup>

              {/* Login Button */}
              <Button
                disabled={
                  !enteredEmail ||
                  !enteredPassword ||
                  Object.values(fieldErrors).some(Boolean) ||
                  loading
                }
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
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
