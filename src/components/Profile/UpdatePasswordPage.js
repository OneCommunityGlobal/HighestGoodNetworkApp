import React, { Component } from 'react';
import PasswordComp from '../Login/PasswordComp';
// import {
//     Container,
//     Row,
//     Col,
//     Form,
//     FormGroup,
//     Button,
//     FormFeedback
// } from "reactstrap";

class UpdatePassword extends Component {
    render() {
        return (
            <div>
                {/* <Container>
                <h3 className=" portal py-4 text-center">
                         Update Password Form
                </h3>
                    <PasswordComp id={'old password'} />
                    <PasswordComp id={'new password'} />
                    <PasswordComp id={'confirm password'} />
                    <Row>
                        <Col>
                            <Button color="success"  className="py-2">
                                Cancel
                            </Button>
                        </Col>
                        <Col>
                            <Button color="success"  className="float-right">
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Container> */}
            </div>
        );
    }
}

export default UpdatePassword;