import React,{Component} from 'react';
import PasswordComp from './PasswordComp';
//import {Container} from 'reactstrap';
//import  {Button,FormFeedback,FormGroup} from "reactstrap";
import { Redirect } from "react-router-dom";
import axios from 'axios';


class ForcePasswordPage extends Component {
    constructor(){
        super();
        this.state={
            redirect:false,
            password:'',
            passwordMismatch:false
        }
        
        this.submit =this.submit.bind(this);
        this.renderRedirect=this.renderRedirect.bind(this);
        this.confirmPwdMatch = this.confirmPwdMatch.bind(this);
        this.passwordValue = this.passwordValue.bind(this);
    }
    passwordValue(password){
            this.passwordValue = password;
    }
    confirmPwdMatch(password){
            if(this.passwordValue !==password){
                this.setState({
                    passwordMismatch:true
                })
             }
    }
    submit(e){
        e.preventDefault();
        //to do :add aixos logic in service folder and import
        axios({
            method: 'patch',
            url: 'http://localhost:4500/api/forcepassword',
            data: {
              userId: this.props.userId,
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
            null
        //     <div>
        //         {this.renderRedirect()}
        //     <Container className="forcePassword">
        //     <h3 className="py-4 text-center">
        //     Change Password
        //     </h3>
        //     <FormGroup>
        //     <PasswordComp id='password' pwdValueOnchange={this.passwordValue}/>
        //     <PasswordComp id='confirmPassword' pwdValueOnblur={this.confirmPwdMatch} passwordMismatch={this.state.passwordMismatch}/>
        // {/* {this.state.passwordMismatch && <FormFeedback>Both the paswords must match</FormFeedback> } */}
        //     <Button color="success" block className="py-2" onClick={this.submit}>
        //          Submit
        //     </Button>
        //     </FormGroup>
          
        //     </Container>
        //     </div>
        );
    }
}

export default ForcePasswordPage;