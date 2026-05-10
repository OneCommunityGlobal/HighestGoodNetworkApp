import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, FormFeedback, FormGroup } from 'reactstrap';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import isEmail from 'validator/lib/isEmail';
import { loginBMUser } from '~/actions/authActions';
import styles from './Login.module.css';
import { useForm } from 'react-hook-form';

function Login() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const auth = useSelector(state => state.auth);
  const darkMode = useSelector(state => state.theme.darkMode);
  const supportEmail = process.env.REACT_APP_SUPPORT_EMAIL;
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const prevLocation = location?.state?.from || { pathname: '/bmdashboard' };
  const [capsLockOn, setCapsLockOn] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange', // inline validation while typing
  });

  useEffect(() => {
    if (hasAccess || auth.user.access?.canAccessBMPortal) {
      history.push(prevLocation.pathname);
    }
  }, [hasAccess, auth.user.access, history, prevLocation.pathname]);

  const onSubmit = async data => {
    const res = await dispatch(loginBMUser(data));

    if (res.status !== 200) {
      if (res.status === 422 && res.data?.label) {
        setError(res.data.label, {
          type: 'server',
          message: res.data.message,
        });
      } else {
        setBackendError(res.data?.message || 'Something went wrong');
      }
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
      <div className={`${styles.formContainer} ${darkMode ? styles.darkBg : ''}`}>
        <Form onSubmit={handleSubmit(onSubmit)}>
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
                id="email"
                placeholder="email"
                innerRef={
                  register('email', {
                    required: 'Email is required',
                    validate: value => isEmail(value) || 'Invalid email',
                  }).ref
                }
                onChange={register('email').onChange}
                onBlur={register('email').onBlur}
                name="email"
                className={`${styles.inputBox} ${darkMode ? styles.darkMail : ''}`}
                aria-label="email input field"
                invalid={!!errors.email}
                aria-invalid={!!errors.email}
                aria-describedby={!!errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <FormFeedback className="d-block error" id="email-error">
                {errors.email.message}
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
                innerRef={
                  register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  }).ref
                }
                onChange={register('password').onChange}
                onBlur={register('password').onBlur}
                onKeyUp={e => setCapsLockOn(e.getModifierState('CapsLock'))}
                invalid={!!errors.password}
                aria-label="Password"
                aria-invalid={!!errors.password}
                aria-describedby={!!errors.password ? 'password-error' : undefined}
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
            {capsLockOn && <span className={styles.capsMsg}> &nbsp; Caps Lock is ON</span>}
            {errors.password && (
              <FormFeedback id="password-error" className="d-block error">
                {errors.password.message}
              </FormFeedback>
            )}
          </FormGroup>
          <div className={styles.forgetPswd}>
            <a href="https://www.highestgood.com/forgotpassword">Forgot your password?</a>
          </div>
          {/* Login Button */}
          <div>
            <Button className={styles.logInBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
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
