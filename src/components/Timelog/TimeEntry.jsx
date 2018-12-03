import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";
import ModalA from "../common/modal";
import ModalBody from "./TimeEntryModalBody";
import Form from "../common/form";
import Tabs from "../common/Tabs";

import Httpervice from "../../services/httpervice";

class TimeEntry extends Form {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentWillMount() {
    console.log("aaaa");
  }

  // getData = () => {
  //   let token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1YmUwOTY0ZDYzM2RhZTAwMTYwODFiNGMiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMTgtMTEtMThUMjA6MTk6MDUuMzQxWiIsImlhdCI6MTU0MTcwODM0NX0.cGnqNREYPcLZnDriSHLh-seeq49JMu39vEtbGV_cPzo";
  //   Httpervice.get(`${process.env.REACT_APP_APIENDPOINT}/userprofile`, {
  //     headers: {
  //       Authorization: token,
  //       "Content-type": "application/json"
  //     }
  //   }).then(response => {
  //     this.setState({ people: response.data });
  //     console.log(response);
  //   });
  // };

  // getUserData = () => {
  //   let token =
  //     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI1YmUwOTY0ZDYzM2RhZTAwMTYwODFiNGMiLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImV4cGlyeVRpbWVzdGFtcCI6IjIwMTgtMTEtMThUMjA6MTk6MDUuMzQxWiIsImlhdCI6MTU0MTcwODM0NX0.cGnqNREYPcLZnDriSHLh-seeq49JMu39vEtbGV_cPzo";
  //   Httpervice.post(
  //     `${process.env.REACT_APP_APIENDPOINT}/login`,
  //     {
  //       email: "jordan@yopmail.com",
  //       password: "Burner8*"
  //     },
  //     {
  //       headers: {
  //         Authorization: token,
  //         "Content-type": "application/json"
  //       }
  //     }
  //   ).then(response => {
  //     this.setState({ userData: response.data });
  //     console.log(response.data);
  //   });
  // };

  // handleClick = e => {
  //   e.preventDefault();
  //   console.log("anything");
  //   this.getData();
  // };

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h1>Time Entry</h1>
          </Col>
          <Col>
            <ModalA
              header="Add Time Entry"
              buttonLabel="Add Time Entry"
              color="primary"
              body={
                <ModalBody
                  userData={this.props.userData}
                  projects={this.props.projects}
                />
              }
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs />
          </Col>
        </Row>
      </Container>
    );
  }
}
export default TimeEntry;
