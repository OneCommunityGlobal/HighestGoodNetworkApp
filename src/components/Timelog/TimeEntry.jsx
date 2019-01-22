import React, { Component } from "react";
import { Container, Row, Col } from "reactstrap";
import { connect } from "react-redux";
import ModalA from "../common/modal";
import ModalBody from "./TimeEntryModalBody";
import Form from "../common/form";
import Tabs from "../common/Tabs";

class TimeEntry extends Form {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

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

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps)(TimeEntry);
