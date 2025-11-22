import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './DevSignup.module.css';

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
    <div className={styles.container}>
      <h2 className={styles.title}>
        Create Dev Account <span>(Linked to Production)</span>
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="productionEmail" className={styles.label}>
          Production Email
        </label>
        <input
          id="productionEmail"
          type="email"
          name="productionEmail"
          value={form.productionEmail}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label htmlFor="productionPassword" className={styles.label}>
          Production Password
        </label>
        <input
          id="productionPassword"
          type="password"
          name="productionPassword"
          value={form.productionPassword}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label htmlFor="firstName" className={styles.label}>
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label htmlFor="lastName" className={styles.label}>
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label htmlFor="email" className={styles.label}>
          Dev Account Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label htmlFor="devPassword" className={styles.label}>
          Dev Account Password
        </label>
        <input
          id="devPassword"
          type="password"
          name="devPassword"
          value={form.devPassword}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <button type="submit" className={styles.button}>
          Create Dev Account
        </button>
      </form>
    </div>
  );
};

export default DevSignup;
