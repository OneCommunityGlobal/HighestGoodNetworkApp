import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from 'reactstrap';
import { forgotPassword } from '../../services/authorizationService';


const ForgotPassword = React.memo(() => {
  debugger;
  const [email, onEmailChange] = useState('');
  const [firsName, setFirstName] = useState(undefined);
  const [lastName, setLastName] = useState(undefined);


  const onForgotPassword = () => {
    let forgotPasswordData = { emailId: email, firstname: firsName, lastname: lastName };
    forgotPassword(forgotPasswordData).then(response => {
      alert("NewPassword sent to your mail id");
    }).catch(Err => { alert('failed') })
  }

  return (

    <div className="container mt-5">
      <form className="col-md-6 xs-12">

        <label>Email</label>
        <Input type='text' placeholder='enter your email ID'
          value={email}
          onChange={(e) => { onEmailChange(e.target.value) }} />

        <label>First Name</label>
        <Input type='text' placeholder='enter your first name'
          value={firsName}
          onChange={(e) => { setFirstName(e.target.value) }} />

        <label>Last Name</label>
        <Input type='text' placeholder='enter your last name'
          value={lastName}
          onChange={(e) => { setLastName(e.target.value) }} />

        <div style={{ marginTop: '40px' }}>
          <Button color='primary' onClick={onForgotPassword}>Submit</Button>
          <Link to='login'>
            <Button style={{ marginLeft: '350px' }}>Cancel</Button>
          </Link>
        </div>

      </form>
    </div>
  )
})
export default ForgotPassword