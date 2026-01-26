// src/components/SupportPortal/SupportLogin.jsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './SupportLogin.module.css';
import axios from 'axios';

export default function SupportLogin() {
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
      // TODO: update this endpoint to match the real login API
      const res = await axios.post('/api/support/login', { email, password });

      // Example: store token / user in localStorage if needed
      if (res.data?.token) {
        localStorage.setItem('supportAuthToken', res.data.token);
      }

      history.push('/support/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
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
