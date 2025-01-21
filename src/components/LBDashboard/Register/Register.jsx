import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import '../LBDashboard.css';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    const url = ENDPOINTS.LB_REGISTER;
    e.preventDefault();
    try {
      const response = await axios.post(url, formData);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Error registering! Please try again.');
    }
  };

  return (
    <div className="register-page">
      <h2>Registration Page</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Click to Register</button>
      </form>
    </div>
  );
}

export default Register;
