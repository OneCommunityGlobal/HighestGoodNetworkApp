import React,{Component} from 'react';
import PasswordComp from './PasswordComp';
import {Container} from 'reactstrap';
import  {Button,FormFeedback} from "reactstrap";
import { Redirect } from "react-router-dom";
import axios from 'axios';

const container = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexFlow: 'column'
  }

class ForcePasswordPage extends Component {
    constructor(){
        super();
        this.state={
            redirect:false
        }
        this.submit =this.submit.bind(this);
        this.renderRedirect=this.renderRedirect.bind(this);
    }

    submit(e){
        e.preventDefault();
        axios({
            method: 'patch',
            url: 'http://localhost:4500/api/forcepassword',
            data: {
              userId: this.state.email,
              newpassword: this.state.password
            },
            headers: {
              'Content-Type': 'application/json'
            }
        }).then(
            () => {
                alert('use the new password set to login to your account');
                this.setState({
                    redirect: true
                })
            }, error => {
              alert("something went wrong");
            }
          )
    }
    renderRedirect(){
        if(this.state.redirect){
          return <Redirect to='/login' />
        }
    }
    render() {
        return (
            <div>
                {this.renderRedirect()}
            <Container className="forcePassword" style={container}>
            <h3 className="py-4 text-center">
            Change Password
            </h3>
            <PasswordComp id='password' />
            <PasswordComp id='confirmPassword'/>
            <FormFeedback>Both the paswords must</FormFeedback>
            <Button color="success" block className="py-2" onClick={this.submit}>
                 Submit
            </Button>
          
            </Container>
            </div>
        );
    }
}

export default ForcePasswordPage;