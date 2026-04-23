import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, FormFeedback, FormGroup } from 'reactstrap';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import isEmail from 'validator/lib/isEmail';
import { loginBMUser } from '~/actions/authActions';
import styles from './Login.module.css';

function Login() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const auth = useSelector(state => state.auth);

  const [enteredemail, setEnteredemail] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [backendError, setBackendError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const prevLocation = location?.state?.from || { pathname: '/bmdashboard' };

  useEffect(() => {
    if (hasAccess || auth.user.access?.canAccessBMPortal) {
      history.push(prevLocation.pathname);
    }
  }, [hasAccess, auth.user.access, history, prevLocation.pathname]);

  //Live Validation
  const validateField = (name, value) => {
    value = value.trim();
    if (name === 'email') {
      if (!value) return 'email is required';
      if (!isEmail(value)) return 'Invalid email';
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
    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'email') setEnteredemail(value);
    if (name === 'password') setEnteredPassword(value);

    const errorMsg = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));

    if (backendError && !errorMsg) setBackendError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Final client-side validation
    const emailError = validateField('email', enteredemail);
    const passwordError = validateField('password', enteredPassword);
    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }
    setLoading(true);
    // Dispatch login action
    const res = await dispatch(loginBMUser({ email: enteredemail, password: enteredPassword }));
    //Handle Backend errors
    if (res.status !== 200) {
      //Validation error
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
  // push Dashboard if not authenticated
  if (!auth.isAuthenticated) {
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.pageTitle}>Highest Good Network</h1>
      <h1 className={styles.pageTitle}> Material Equipemnt Tool Tracker</h1>
      <div className={styles.formContainer}>
        <Form onSubmit={handleSubmit}>
          {/* Backend/general error */}
          {backendError && (
            <div className="alert alert-danger" role="alert">
              {backendError}
            </div>
          )}
          <User size="70" strokeWidth={1.5} aria-hidden="true" />
          <h2 className={styles.heading2}>Welcome to HGN</h2>
          <FormGroup>
            <div className={styles.inputWrapper}>
              <User size="30" strokeWidth={1.5} aria-hidden="true" />
              <Input
                type="text"
                placeholder="email"
                name="email"
                id="email"
                value={enteredemail}
                className={styles.inputBox}
                onChange={handleChange}
                aria-label="email input field"
                invalid={touched.email && !!fieldErrors.email}
                aria-invalid={touched.email && !!fieldErrors.email}
                aria-describedby={touched.email && !!fieldErrors.email ? 'email-error' : undefined}
              />
            </div>
            {touched.email && fieldErrors.email && (
              <FormFeedback style={{ display: 'block' }} id="email-error">
                {fieldErrors.email}
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
                invalid={touched.password && !!fieldErrors.password}
                aria-label="Password"
                aria-invalid={touched.password && !!fieldErrors.password}
                aria-describedby={
                  touched.password && !!fieldErrors.password ? 'password-error' : undefined
                }
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
            {touched.password && fieldErrors.password && (
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
                !enteredemail ||
                !enteredPassword ||
                Object.values(fieldErrors).some(Boolean) ||
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
