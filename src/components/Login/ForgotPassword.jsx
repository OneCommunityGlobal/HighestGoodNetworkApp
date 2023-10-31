import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Input, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import forgotPassword from '../../services/authorizationService';
import Joi from 'joi';
import { boxStyle } from 'styles';

const ForgotPassword = React.memo(() => {
  const [message, setMessage] = useState({});
  const history = useHistory();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const firstNameSchema = Joi.string()
    .trim()
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.type) {
          case 'any.empty':
            err.message = 'First name should not be empty.';
            break;
          default:
            err.message = 'Please enter a valid last name.';
            break;
        }
      });
      return errors;
    });
  const lastNameSchema = Joi.string()
    .trim()
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.type) {
          case 'any.empty':
            err.message = 'Last name should not be empty.';
            break;
          default:
            err.message = 'Please enter a valid first name.';
            break;
        }
      });
      return errors;
    });
  //Joi.string().email({ minDomainSegments: 2 })
  const emailSchema = Joi.string()
    .email()
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/)
    .required()
    .error(errors => {
      errors.forEach(err => {
        switch (err.type) {
          case 'any.empty':
            err.message = 'Email should not be empty';
            break;
          default:
            err.message = 'Please enter a valid email address.';
            break;
        }
      });
      return errors;
    });

  const schema = {
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
  };

  const onForgotPassword = () => {
    const result = Joi.validate(user, schema, { abortEarly: false });
    const { error } = result;
    if (error) {
      const errorData = {};
      for (let item of error.details) {
        const name = item.path[0];
        const message = item.message;
        errorData[name] = message;
      }
      setMessage(errorData);
    } else {
      const forgotPasswordData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
      forgotPassword(forgotPasswordData)
        .then(() => {
          toast.success(
            `Nice! You have successfully passed the 3-question Change My Password Challenge. Check your email for your reward: A NEW PASSWORD!`,
          );
          setTimeout(() => {
            history.push('/login');
          }, 1000);
        })
        .catch(error => {
          toast.error(
            `Well bummer, your entries don't match what is in our system. Don't give up though, you can do this!`,
          );
        });
    }
  };

  const handleInput = e => {
    const { name, value } = e.target;
    let errorData = { ...message };

    var validateResult = {};
    if (name === 'email') {
      validateResult = Joi.validate({ [name]: value }, { email: emailSchema });
    } else if (name === 'firstName') {
      validateResult = Joi.validate({ [name]: value }, { firstName: firstNameSchema });
    } else if (name === 'lastName') {
      validateResult = Joi.validate({ [name]: value }, { lastName: lastNameSchema });
    }
    const { error } = validateResult;
    const errorMessage = error ? error.details[0].message : null;
    if (errorMessage) {
      errorData[name] = errorMessage;
    } else {
      delete errorData[name];
    }
    let userData = { ...user };
    userData[name] = value;
    setUser(userData);
    setMessage(errorData);
  };

  return (
    <div className="container mt-5">
      <form className="col-md-6 xs-12">
        <label>Email</label>
        <Input
          type="text"
          placeholder="Enter your email ID"
          name="email"
          value={user.email}
          onChange={handleInput}
        />
        {message.email && <div className="alert alert-danger">{message.email}</div>}

        <label>First Name</label>
        <Input
          type="text"
          placeholder="Enter your first name"
          name="firstName"
          value={user.firstName}
          onChange={handleInput}
        />
        {message.firstName && <div className="alert alert-danger">{message.firstName}</div>}

        <label>Last Name</label>
        <Input
          type="text"
          placeholder="Enter your last name"
          name="lastName"
          value={user.lastName}
          onChange={handleInput}
        />
        {message.lastName && <div className="alert alert-danger">{message.lastName}</div>}

        <div style={{ marginTop: '40px' }}>
          <Button color="primary" onClick={onForgotPassword} style={boxStyle}>
            Submit
          </Button>
          <Link to="login">
            {' '}
            <Button style={{ ...boxStyle, float: 'right' }}>Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
});

export default ForgotPassword;
