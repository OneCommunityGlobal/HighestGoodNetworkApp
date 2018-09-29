import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import {
  Container,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  FormFeedback
} from "reactstrap";
import axios from 'axios';
import {authenticated} from '../App'

const container = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexFlow: 'column'
}

//to do use password comp
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToReferrer: false,
      redirect:{
        dashboard:false,
        forcepassword:false
      },
      email: "",
      password: "",
      validate: {
        emailState: "",
        passwordState:""
      }
    };
    this.handleChange = this.handleChange.bind(this);
  }

  validateEmail(e) {
    const emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { validate } = this.state;
    if (emailRex.test(e.target.value)) {
      validate.emailState = "has-success";
    } else {
      validate.emailState = "has-danger";
    }
    this.setState({ validate });
  }

 

  handleChange = async event => {
    const { target } = event;
    const value = target.value;
    const { name } = target;
    await this.setState({
      [name]: value
    });
  };

  submitForm(e) {
    e.preventDefault();
   
    axios({
        method: 'post',
        url: 'http://localhost:4500/api/login',
        data: {
          email: this.state.email,
          password: this.state.password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(
        response => {
            if(response.data.new){
           // router.transitionTo(`/forcepassword/${response.data.userId}`);
           this.setState({
            redirect:{
              forcepassword:true
              //userid
            }
          })
            }
            if(response.data.token){
            localStorage.setItem('token', response.data.token);
            this.setState({
              redirect:{
                dashboard:true
              }
            })          
            }
          }, error => {
            alert("Invalid credentials");
          }
      )
      if(authenticated){
        this.setState({
          redirectToReferrer:true
        })
      }
  }
  renderRedirect = () => {
    if (this.state.redirect.dashboard) {
      return <Redirect to='/' />
    }
    else if (this.state.redirect.forcepassword){
      return <Redirect to='/forcepassword' user={this.state.userId}/>
    }
  }

  render() {
    const { email, password, redirectToReferrer } = this.state;
    const { from } = this.props.location.state || { from: { pathname: '/' }}

    if (redirectToReferrer) {
      return (
        <Redirect to={from} />
      )
    }
    return (
      
      <Container className="Login" style={container}>
      {this.renderRedirect()}
        <Form className="form formsignin" onSubmit={e => this.submitForm(e)}>
          <Col>
            <h3 className="text-uppercase portal py-4 text-center">
              One Community Global
            </h3>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={email}
                valid={this.state.validate.emailState === "has-success"}
                invalid={this.state.validate.emailState === "has-danger"}
                onChange={e => {
                  this.validateEmail(e);
                  this.handleChange(e);
                }}
              />
              <FormFeedback>Invalid email address</FormFeedback>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type="password"
                name="password"
                id="passworp"
                placeholder="Password"
                value={password}
                onChange={e => this.handleChange(e)}
              />
            </FormGroup>
          </Col>
          <Col>
            <Button color="success" block className="py-2">
              <i className="fa fa-unlock" /> LOGIN
            </Button>
          </Col>
            <Col xs="6" className="text-right offset-6">
              <Link to="/forgotpassword" className="text-muted">
                Forgot Password?
              </Link>
            </Col>
        </Form>
      </Container>
    );
  }
}

export default Login;
