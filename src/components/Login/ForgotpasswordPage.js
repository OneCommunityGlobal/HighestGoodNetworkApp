import React, { Component } from 'react';
import axios from 'axios';
import { Link, Redirect } from "react-router-dom";

class ForgotPassword extends Component {
    constructor() {
        super();
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            validate: {
                emailState: ""
            },
            redirect:false
        }
        this.handleChangeandValidate = this.handleChangeandValidate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitForm=this.submitForm.bind(this);
    }
    handleChangeandValidate(event) {
        this.handleChange(event);
        this.validateEmail(event);
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
            url: 'http://localhost:4500/api/forgotpassword',
            data: {
              email: this.state.email,
              firstName: this.state.firstName,
              lastName:this.state.lastName
            },
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .then(
            () => {
              alert('you will get an email with new password shortly');
              this.setState({
                redirect:true
                
              })
            }, error => {
              alert("something went wrong");
            }
          )
    }

    renderRedirect = () => {
        if (this.state.redirect) {
          return <Redirect to='/login' />
        }
    }
    render() {
        const { email, firstName, lastName } = this.state;
        return ( null
            // <div>
            //     {this.renderRedirect()}
            // <Container className="forgotpassword" >
            //     <Form className="form formforgotPwd" onSubmit={e => this.submitForm(e)}>
            //         <h3 className=" portal py-4 text-center">
            //             One Community Global Forgot Password Form
            //     </h3>
            //         <FormGroup>
            //             <Input
            //                 required
            //                 type="text"
            //                 name="firstName"
            //                 id='firstName'
            //                 placeholder='firstName'
            //                 value={firstName}
            //                 onChange={this.handleChange}
            //             />
            //             <FormFeedback>firstName must atleast be two char length</FormFeedback>
            //         </FormGroup>
            //         <FormGroup>
            //             <Input
            //                 required
            //                 type="text"
            //                 name="lastName"
            //                 id='lastName'
            //                 placeholder='lastName'
            //                 value={lastName}
            //                 onChange={this.handleChange}
            //             />
            //             <FormFeedback>Name must atleast be two char length</FormFeedback>
            //         </FormGroup>
            //         <FormGroup>
            //             <Input
            //                 type="email"
            //                 name="email"
            //                 id="email"
            //                 placeholder="Email"
            //                 value={email}
            //                 valid={this.state.validate.emailState === "has-success"}
            //                 invalid={this.state.validate.emailState === "has-danger"}
            //                 onChange={this.handleChangeandValidate}
            //             />
            //             <FormFeedback>Invalid email address</FormFeedback>
            //         </FormGroup>
            //         <Row>
            //             <Col>
            //                 <Link to="/login" className="text-muted">
            //                     Cancel
            //                 </Link>
            //             </Col>
            //             <Col>
            //                 <Button color="success" block >
            //                     Submit
            //                 </Button>
            //             </Col>
            //         </Row>
            //     </Form>
            // </Container>
            // </div>
        );
    }
}

export default ForgotPassword;