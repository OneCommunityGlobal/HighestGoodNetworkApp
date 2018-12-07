import React from "react";
import TimeEntry from "./TimeEntry";
import { getCurrentUser } from "../../services/loginService";
import { Container, Row, Col } from "reactstrap";
import Form from "../common/form";
import Httpervice from "../../services/httpervice";

class TimelogPage extends Form {
  constructor(props, context) {
    super(props, context);

    this.state = {};
  }

  componentWillMount() {
    const data = getCurrentUser();
    this.setState({ data: data }, () => {
      this.getData();
    });
  }

  getData = () => {
    console.log(this.state.data.userid);
    const api = process.env.REACT_APP_APIENDPOINT;
    Httpervice.setjwt(localStorage.getItem("token"));
    Httpervice.get(`${api}/projects/user/${this.state.data.userid}`).then(
      response => {
        console.log(response.data);
        this.setState({ projects: response.data });
      }
    );
  };

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <h1 className="text-center">Time Log</h1>
          </Col>
        </Row>
        <Row>
          <Col sm={6} md={3}>
            <h2 className="float-left" onClick={this.handleClick}>
              Jordan Miller
            </h2>
          </Col>
        </Row>
        <Row>
          <Col lg={8}>
            <TimeEntry
              userData={this.state.data}
              projects={this.state.projects}
            />
          </Col>
        </Row>
      </Container>
    );
  }
}
export default TimelogPage;
