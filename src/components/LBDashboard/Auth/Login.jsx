import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import './Auth.css';
import logo from '../../../assets/images/logo2.png';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const regex = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-_=+{};:,<.>]{8,}$/,
  };

  const validateInput = (name, value) => {
    if (!regex[name].test(value)) {
      return `Invalid ${name}`;
    }
    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: validateInput(name, value) });
    }
  };

  const handleSubmit = async e => {
    // TODO: Login data has to be compared with the data in the database
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateInput(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await axios.post(ENDPOINTS.LB_LOGIN, formData); // This is where you put the actual endpoint for the Login

      window.location.href = '/lbdashboard'; // TODO: Replace with your actual redirect logic if route is defferent
    } catch (error) {
      toast.error('Error logging in! Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="form-container">
        <div className="form-top"></div>
        <div className="form-main">
          <h2>Login Page</h2>
          <p>Log in to rent or bid on any of your favorite units!</p>
          <div className="form-content">
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="error-message">{errors.email}</p>}

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className="error-message">{errors.password}</p>}

              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
