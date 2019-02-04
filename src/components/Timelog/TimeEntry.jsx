import React from "react";
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
    let Modal;
    const tModal = (
      <ModalA
        header="Add Time Entry"
        buttonLabel="Add Time Entry"
        color="primary"
        body={<ModalBody />}
      />
    );
    if (this.props.state.user.role === "Administrator") {
      Modal = tModal;
    } else if (
      this.props.state.user.role !== "Administrator" &&
      this.props.state.userProfile._id === this.props.state.user.userid
    ) {
      Modal = tModal;
    } else if (
      this.props.state.user.role !== "Administrator" &&
      this.props.state.userProfile._id !== this.props.state.user.userid
    ) {
      Modal = null;
    }
    return (
      <Container>
        <Row>
          <Col>
            <h1>Time Entry</h1>
          </Col>
          <Col>{Modal}</Col>
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

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps)(TimeEntry);
