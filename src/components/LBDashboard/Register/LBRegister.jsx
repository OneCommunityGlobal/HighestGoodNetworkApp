import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './LBRegister.module.css';
import logo from '../../../assets/images/logo2.png';

function LBRegister() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const regex = {
    firstName: /^[A-Za-z]{2,}$/,
    lastName: /^[A-Za-z]{2,}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    // eslint-disable-next-line
    phone: /^(?=(?:\D*\d){7,15}\D*$)(?:\+?\d{1,4})?[\s\-().]*\d{1,4}[\s\-().]*\d{1,4}[\s\-().]*\d{1,4}[\s\-().]*\d{1,4}$/,
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
      await axios.post(ENDPOINTS.LB_REGISTER, formData);
      window.location.href = '/lbdashboard/login';
    } catch (error) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.message;

      if (status === 409) {
        toast.error(msg || 'Email already registered.');
      } else if (status) {
        toast.error(msg || 'Error registering! Please try again.');
      } else {
        toast.error('Network error. Check your connection and try again.');
      }
    }
  };

  return (
    <div className={`${styles.lbRegisterPage}`}>
      <div className={`${styles.lbRegisterLogo}`}>
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className={`${styles.lbRegisterContainer}`}>
        <div className={`${styles.lbRegisterTop}`} />
        <div className={`${styles.lbRegisterMain}`}>
          <h2>Registration Page</h2>
          <p>
            Filling the details below will allow you to bid or rent a unit from a village of your
            choice in our property. Clicking the submit button will confirm all your details with us
            and will take you to our login page.
          </p>
          <div className={`${styles.lbRegisterFormWrapper}`}>
            <form className={`${styles.lbRegisterForm}`} onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              {errors.firstName && (
                <p className={`${styles.lbRegisterError}`}>{errors.firstName}</p>
              )}

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              {errors.lastName && <p className={`${styles.lbRegisterError}`}>{errors.lastName}</p>}

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className={`${styles.lbRegisterError}`}>{errors.email}</p>}

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {errors.phone && <p className={`${styles.lbRegisterError}`}>{errors.phone}</p>}

              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <p className={`${styles.lbRegisterError}`}>{errors.password}</p>}

              <button type="submit">Click to Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LBRegister;
