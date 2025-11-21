import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './DevSignup.module.css';

const DevSignup = () => {
  const [form, setForm] = useState({
    productionEmail: '',
    productionPassword: '',
    firstName: '',
    lastName: '',
    email: '',
    devPassword: '',
  });

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/dev/signup-production', form);
      toast.success('Dev Account Created!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create Dev account';
      toast.error(msg);
    }
  };

  return (
    <div className="devsignup-container">
      <div className="devsignup-card">
        <h2 className="devsignup-title">
          Create Dev Account
          <span className="devsignup-subtitle">(Linked to Production)</span>
        </h2>

        <form onSubmit={handleSubmit}>
          <label htmlFor="productionEmail" className={styles.inputLabel}>
            Production Email
          </label>
          <input
            id="productionEmail"
            type="email"
            name="productionEmail"
            className={styles.inputField}
            value={form.productionEmail}
            onChange={handleChange}
            required
          />

          <label htmlFor="productionPassword" className={styles.inputLabel}>
            Production Password
          </label>
          <input
            id="productionPassword"
            type="password"
            name="productionPassword"
            className={styles.inputField}
            value={form.productionPassword}
            onChange={handleChange}
            required
          />

          <div className="name-row">
            <div className="name-field">
              <label htmlFor="firstName" className={styles.inputLabel}>
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                className={styles.inputField}
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="name-field">
              <label htmlFor="lastName" className={styles.inputLabel}>
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                className={styles.inputField}
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="email" className={styles.inputLabel}>
            Dev Account Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className={styles.inputField}
            value={form.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="devPassword" className={styles.inputLabel}>
            Dev Account Password
          </label>
          <input
            id="devPassword"
            type="password"
            name="devPassword"
            className={styles.inputField}
            value={form.devPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn">
            Create Dev Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default DevSignup;
