import React, { Component } from "react";
import TimeEntry from "./TimeEntry";
import { Input, FormGroup, Label, Container, Row, Col } from "reactstrap";
import Form from "../common/form";
import Joi from "joi";
import moment from 'moment';

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
              base:
                "Please select a date"
            }
          }
        }
      }),

    minutes: Joi.string()
      .regex(
        /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
      )
      .required()
      .label("New Password")
      .options({
        language: {
          string: {
            regex: {
              base:
                "Minutes!!! should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character"
            }
          }
        }
      })
  };

  componentWillMount() {
    console.log("TimeEntryModalBody: ", this.props);
  }



  render() {
    const max = moment().format('YYYY-MM-DD')
    const min = moment().subtract(1, 'day').format('YYYY-MM-DD')

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
                  "Projects",
                  "Projects",
                  this.props.projects,
                  true
                )}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <form onSubmit={e => this.handleSubmit(e)}>
                {this.renderTextarea("notes", "Notes:", true, 3, 4)}
              </form>
            </Col>
          </Row>
          <Row>
            <FormGroup>{this.renderCheckbox("tangible", "Tangible")}</FormGroup>
          </Row>
        </Container>
      </div>
    );
  }
}
export default TimeEntryBody;
