import React from "react";
import { Container, Row, Col } from "reactstrap";
import { connect } from "react-redux";
import ModalA from "../common/Modal";
import ModalBody from "../TimeEntryModalBody";
import Form from "../common/Form";
import Tabs from "../common/Tabs";

class TimeEntry extends Form {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    // Code below is the logic for if a user is an admin, they can add timelogs to any user. If user is not an admin they can only add timelogs for themselves
    let Modal = null;
    const tModal = (
      <ModalA
        header="Add Time Entry"
        buttonLabel="Add Time Entry"
        color="primary"
      >
        <ModalBody />
      </ModalA>
    );
    if (
      this.props.state.user.role === "Administrator" ||
      this.props.state.userProfile._id === this.props.state.user.userid
    ) {
      Modal = tModal;
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
