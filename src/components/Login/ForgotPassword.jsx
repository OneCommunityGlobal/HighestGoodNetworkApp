import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Button, Input, Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../services/authorizationService';

const ForgotPassword = React.memo(() => {
  const [email, onEmailChange] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState({ success: true, msg: '' });
  const history = useHistory();

  const onForgotPassword = () => {
    if (email === '') {
      setMessage({ success: false, msg: 'Please enter the email id.' });
    } else if (firstName === '' || lastName === '') {
      setMessage({ success: false, msg: 'Please enter your full name.' });
    } else {
      const forgotPasswordData = { email: email, firstName: firstName, lastName: lastName };
      forgotPassword(forgotPasswordData)
        .then(() => {
          toast.success(
            `Nice! You have successfully passed the 3-question Change My Password Challenge. Check your email for your reward: A NEW PASSWORD!`,
          );
          setTimeout(() => {
            history.push('/login');
          }, 1000);
        })
        .catch((error) => {
          toast.error(
            `Well bummer, your entries don't match what is in our system. Don't give up though, you can do this!`,
          );
        });
    }
  };

  return (
    <div className="container mt-5">
      <form className="col-md-6 xs-12">
        <label>Email</label>
        <Input
          type="text"
          placeholder="Enter your email ID"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
          }}
        />

        <label>First Name</label>
        <Input
          type="text"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
        />

        <label>Last Name</label>
        <Input
          type="text"
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
          }}
        />

        {message.msg !== '' && (
          <Alert color={message.success ? 'success' : 'danger'}>{message.msg}</Alert>
        )}
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
