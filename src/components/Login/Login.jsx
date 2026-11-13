import { useEffect, useRef, useState } from 'react';
import Joi from 'joi';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCircleExclamation, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import '@fontsource/atkinson-hyperlegible-next/400.css';
import '@fontsource/atkinson-hyperlegible-next/700.css';
import logo from '~/assets/images/logo.png';
import { loginUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';
import styles from './Login.module.css';

const emailSchema = Joi.string().email();

export const MESSAGES = {
  emailRequired: 'Enter your email address.',
  emailInvalid: 'Enter an email like name@example.com.',
  passwordRequired: 'Enter your password.',
  noAccount: 'No account uses that email. Check it for typos.',
  connection:
    'We couldn’t sign you in because of a connection or server problem. Try again in a moment.',
};

// Format problems are reported on blur and submit; empty fields only on submit,
// so nobody gets an error for a field they have not finished or not reached yet.
export function validateField(name, value, { onSubmit = false } = {}) {
  if (name === 'email') {
    const email = value.trim();
    if (!email) return onSubmit ? MESSAGES.emailRequired : null;
    return emailSchema.validate(email).error ? MESSAGES.emailInvalid : null;
  }
  if (name === 'password') {
    return !value && onSubmit ? MESSAGES.passwordRequired : null;
  }
  return null;
}

// Maps what authActions.loginUser puts in the errors store to a form-level message.
// 404 -> errors.password (wrong password); 403 -> errors.email (unknown or inactive account);
// anything else -> the generic errors.email string from loginUser.
export function describeLoginError(errors) {
  if (!errors) return null;
  if (errors.password) return { field: 'password', kind: 'wrongPassword' };
  if (errors.email) {
    if (errors.email === 'An error occurred during login.') {
      return { field: null, message: MESSAGES.connection };
    }
    if (errors.email === 'Username not found.')
      return { field: 'email', message: MESSAGES.noAccount };
    return { field: 'email', message: errors.email };
  }
  return null;
}

export function Login({
  auth,
  errors,
  darkMode,
  loginUser: login,
  clearErrors: clear,
  history,
  location,
}) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const mounted = useRef(true);
  const firstRender = useRef(true);
  const firstErrors = useRef(true);

  useEffect(() => {
    mounted.current = true;
    // Drop any error another page left in the shared errors store.
    clear();
    if (auth?.isAuthenticated) history.push('/');
    return () => {
      mounted.current = false;
      clear();
    };
    // Mount/unmount only, same as the previous componentDidMount/componentWillUnmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (auth?.user?.new) {
      history.push(`/forcePasswordUpdate/${auth.user.userId}`);
    } else if (auth?.isAuthenticated) {
      const redirectPath = location?.state?.from?.pathname;
      history.push(redirectPath && redirectPath.includes('/hgnform') ? redirectPath : '/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  useEffect(() => {
    // Only react to errors produced after this page mounted.
    if (firstErrors.current) {
      firstErrors.current = false;
      return;
    }
    const described = describeLoginError(errors);
    if (!described) return;
    setServerError(described);
    if (described.field === 'password' && passwordRef.current) {
      passwordRef.current.focus();
      passwordRef.current.select();
    }
  }, [errors]);

  const handleChange = ({ currentTarget: input }) => {
    const { name, value } = input;
    setValues(prev => ({ ...prev, [name]: value }));
    setServerError(null);
    // Once a field shows an error, clear it the moment the value is valid,
    // but never swap in a new message while the person is still typing.
    if (fieldErrors[name] && !validateField(name, value)) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = ({ currentTarget: input }) => {
    const message = validateField(input.name, input.value);
    setFieldErrors(prev => {
      const next = { ...prev };
      if (message) next[input.name] = message;
      else delete next[input.name];
      return next;
    });
    if (input.name === 'password') setCapsLock(false);
  };

  const handleKey = e => {
    if (e.getModifierState) setCapsLock(e.getModifierState('CapsLock'));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (submitting) return;
    const email = values.email.trim();
    if (email !== values.email) setValues(prev => ({ ...prev, email }));
    const next = {};
    const emailError = validateField('email', email, { onSubmit: true });
    const passwordError = validateField('password', values.password, { onSubmit: true });
    if (emailError) next.email = emailError;
    if (passwordError) next.password = passwordError;
    setFieldErrors(next);
    if (emailError) {
      emailRef.current?.focus();
      return;
    }
    if (passwordError) {
      passwordRef.current?.focus();
      return;
    }

    setServerError(null);
    setSubmitting(true);
    try {
      const formattedEmail = email.replace(/[A-Z]/g, char => char.toLowerCase());
      const result = await login({ email: formattedEmail, password: values.password });
      if (mounted.current && result && result.success === false) {
        setServerError(describeLoginError(result.errors));
      }
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  const describedBy = (name, extra) =>
    [fieldErrors[name] ? `${name}-error` : null, extra].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={styles.page}
      data-appearance={darkMode ? 'dark' : 'light'}
      data-testid="login-page"
    >
      <header className={styles.band}>
        <img
          className={styles.logo}
          src={logo}
          alt="One Community, for the highest good of all"
          width="300"
          height="83"
        />
      </header>
      <main className={styles.stage}>
        <div className={styles.panel} data-busy={submitting}>
          <div className={styles.rule} aria-hidden="true" />
          <form
            className={styles.form}
            noValidate
            onSubmit={handleSubmit}
            aria-labelledby="login-title"
          >
            <h1 id="login-title" className={styles.title}>
              Sign in
            </h1>
            <p className={styles.lede}>
              Highest Good Network, One Community’s volunteer workspace.
            </p>

            {serverError && (
              <div className={styles.alert} role="alert">
                <FontAwesomeIcon
                  icon={faCircleExclamation}
                  className={styles.alertIcon}
                  aria-hidden="true"
                />
                <span>
                  {serverError.kind === 'wrongPassword' ? (
                    <>
                      That password doesn’t match this account. Try again, or{' '}
                      <Link to="/forgotpassword" className={styles.link}>
                        reset your password
                      </Link>
                      .
                    </>
                  ) : (
                    serverError.message
                  )}
                </span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                className={styles.input}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={fieldErrors.email ? 'true' : undefined}
                aria-describedby={describedBy('email')}
              />
              {fieldErrors.email && (
                <p id="email-error" className={styles.error}>
                  <FontAwesomeIcon icon={faCircleExclamation} aria-hidden="true" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.control}>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`${styles.input} ${styles.withToggle}`}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKey}
                  onKeyUp={handleKey}
                  aria-invalid={fieldErrors.password ? 'true' : undefined}
                  aria-describedby={describedBy('password', capsLock ? 'caps-note' : null)}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} aria-hidden="true" />
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className={styles.error}>
                  <FontAwesomeIcon icon={faCircleExclamation} aria-hidden="true" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
              {capsLock && (
                <p id="caps-note" className={styles.note}>
                  <FontAwesomeIcon icon={faArrowUp} aria-hidden="true" />
                  <span>Caps Lock is on.</span>
                </p>
              )}
              <p className={styles.forgot}>
                <Link to="/forgotpassword" className={styles.link}>
                  Forgot your password?
                </Link>
              </p>
            </div>

            <button type="submit" className={styles.submit} aria-busy={submitting}>
              {submitting && <span className={styles.spinner} aria-hidden="true" />}
              <span>{submitting ? 'Signing in' : 'Sign in'}</span>
            </button>
          </form>
        </div>
        <footer className={styles.netlify}>
          This site is powered by{' '}
          <a
            className={styles.netlifyLink}
            href="https://www.netlify.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Netlify
          </a>
        </footer>
      </main>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  darkMode: state.theme.darkMode,
});

export default withRouter(
  connect(mapStateToProps, {
    loginUser,
    clearErrors,
  })(Login),
);
