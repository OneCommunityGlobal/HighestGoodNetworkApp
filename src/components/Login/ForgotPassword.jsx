import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Input, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../services/authorizationService';
import Joi from 'joi';

const ForgotPassword = React.memo(() => {
  const [message, setMessage] = useState({});
  const history = useHistory();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const schema = {
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string()
      .email()
      .required(),
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
    var vaildateResult = {};
    if(name==='email'){
      vaildateResult = Joi.validate({ [name]: value }, {email: Joi.string().email().required()});
    }else if(name==='firstName'){
      vaildateResult = Joi.validate({ [name]: value }, {firstName: Joi.string().required()});
    }else if(name==='lastName'){
      vaildateResult = Joi.validate({ [name]: value }, {lastName: Joi.string().required()});
    }
    console.log(vaildateResult);
    //const vaildateResult = Joi.validate({ [name]: value }, { [name]: schema[name] });
    const { error } = vaildateResult;
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
          <Button color="primary" onClick={onForgotPassword}>
            Submit
          </Button>
          <Link to="login">
            {' '}
            <Button style={{ marginLeft: '350px' }}>Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
});

export default ForgotPassword;
