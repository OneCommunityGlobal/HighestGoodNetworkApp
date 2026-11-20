// src/components/SupportPortal/SupportLogin.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './SupportLogin.module.css';
import { loginUser } from '../../actions/authActions';

export default function SupportLogin() {
  // Keep the login page in sync with the shared HGN theme preference.
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const dispatch = useDispatch();
  const store = useStore();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await dispatch(loginUser({ email: email.toLowerCase(), password }));
      if (result.success === false) {
        const message = Object.values(result.errors || {})
          .filter(value => typeof value === 'string' && value.trim())
          .join(' ');
        setError(message || 'Login failed. Please check your credentials and try again.');
      } else if (result.success === true) {
        if (result.new) {
          // loginUser stores the new user's ID in Redux, not in its return value.
          const userId = store.getState().auth?.user?.userId;
          if (userId) {
            history.push(`/forcePasswordUpdate/${userId}`);
          } else {
            setError('Login failed. Please check your credentials and try again.');
          }
        } else {
          history.push('/support/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>Support Portal Login</h1>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
