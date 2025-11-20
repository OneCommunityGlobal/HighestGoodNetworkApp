import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/dev/signup-production', form);

      toast.success('Dev Account Created!');
      // remove console.log because of ESLint
      // console.log(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not create Dev account';
      toast.error(msg);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto' }}>
      <h2>Create Dev Account (Linked to Production)</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="productionEmail">Production Email</label>
        <input
          id="productionEmail"
          type="email"
          name="productionEmail"
          value={form.productionEmail}
          onChange={handleChange}
          required
        />

        <label htmlFor="productionPassword">Production Password</label>
        <input
          id="productionPassword"
          type="password"
          name="productionPassword"
          value={form.productionPassword}
          onChange={handleChange}
          required
        />

        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Dev Account Email</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="devPassword">Dev Account Password</label>
        <input
          id="devPassword"
          type="password"
          name="devPassword"
          value={form.devPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" style={{ marginTop: '20px' }}>
          Create Dev Account
        </button>
      </form>
    </div>
  );
};

export default DevSignup;
