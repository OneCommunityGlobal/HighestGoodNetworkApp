import React, { Component } from "react";
import TimeEntry from "./TimeEntry";
import { FormGroup, Container, Row, Col, Button } from "reactstrap";
import Form from "../common/form";
import Joi from "joi";
import moment from "moment";
import Httpervice from "../../services/httpervice";

class TimeEntryBody extends Form {
  constructor(props, context) {
    super(props, context);

    this.state = {
      data: {},
      errors: {}
    };
  }

  schema = {
    date: Joi.string()
      .required()
      .label("Date")
      .options({
        language: {
          string: {
            regex: {
              base: "Please select a date"
            }
          }
        }
      }),

    minutes: Joi.number()
      .min(0)
      .max(59)
      .label("minutes")
      .options({
        language: {
          string: {
            regex: {
              base: "0 through 59"
            }
          }
        }
      }),

    hours: Joi.number()
      .min(0)
      .max(23)
      .label("hours")
      .options({
        language: {
          string: {
            regex: {
              base: "0 through 23"
            }
          }
        }
      }),

    tangible: Joi.label("Tangible"),

    projectId: Joi.string().required(),

    notes: Joi.string().label("notes")
  };

  postTimeEntry = timeData => {
    Httpervice.setjwt(localStorage.getItem("token"));
    Httpervice.post(
      `${process.env.REACT_APP_APIENDPOINT}/TimeEntry`,
      timeData,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(response => {
      console.log(response);
    });
  };

  handleSubmit = () => {
    let timeEntry = {};
    // timeEntry.timeSpent = `${this.state.data.hours}:${this.state.data.minutes}`;
    timeEntry.timeSpent = `01:00:10`;
    timeEntry.personId = this.props.userData.userid;
    timeEntry.projectId = this.state.data.projectId;
    timeEntry.dateofWork = this.state.data.date;
    timeEntry.taskId = "5a38050795e6f9038cbc86a5";
    timeEntry.isTangible = false;
    timeEntry.notes = this.state.data.notes;
    console.log(timeEntry);
    this.postTimeEntry(timeEntry);
  };

  componentWillMount() {
    console.log("userData: ", this.props.userData);
  }

  render() {
    const max = moment().format("YYYY-MM-DD");
    const min = moment()
      .day(1)
      .format("YYYY-MM-DD");

    return (
      <div>
        <Container>
          <Row>
            <Col lg={12}>
              <FormGroup>
                {this.renderInput("date", "Date", "date", min, max)}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <FormGroup>
                {this.renderInput("hours", "Hours", "number", 0, 23)}
              </FormGroup>
            </Col>
            <Col lg={6}>
              <FormGroup>
                {this.renderInput("minutes", "Minutes", "number", 0, 59)}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <FormGroup>
                {this.renderDropDown(
                  "projectId",
                  "Projects",
                  this.props.projects
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <FormGroup>
                {this.renderTextarea("notes", "Notes", 3, 4)}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <FormGroup>
              {this.renderInput("tangible", "Tangible", "checkbox")}
            </FormGroup>
          </Row>
          <Row>
            <Col>
              <Button color="danger" onClick={this.clearForm}>
                Clear Form
              </Button>
            </Col>
            <Col>{this.renderButton("Submit", this.handleSubmit)}</Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default TimeEntryBody;
