import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { FormGroup, Container, Row, Col } from "reactstrap";
import { TimeEntryschema as schema } from "../../schema";
import { postTimeEntry } from "../../actions";
import Form from "../common/Form";

class TimeEntryBody extends Form {
  constructor(props, context) {
    super(props, context);
    let { date, minutes, hours, projectId, tangible, notes } = props;
    if (tangible === undefined) {
      tangible = "false";
    }
    this.state = {
      data: {
        minutes,
        hours,
        projectId,
        tangible,
        notes,
        date
      },
      errors: {}
    };
  }

  schema = schema;

  handleSubmit = postOrUpdate => {
    console.log(postOrUpdate);
    const timeEntry = {};
    const timeSpent = `${this.state.data.hours}:${this.state.data.minutes}:00`;
    timeEntry.timeSpent = timeSpent;
    timeEntry.personId = this.props.state.userProfile._id;
    timeEntry.projectId = this.state.data.projectId;
    timeEntry.dateOfWork = this.state.data.date;
    timeEntry.isTangible = this.state.data.tangible;
    timeEntry.notes = this.state.data.notes;

    if (postOrUpdate) {
      this.props.postTimeEntry(timeEntry);
    } else {
      this.props.update(this.props.id, timeEntry);
    }
    // this.props.postTimeEntry(timeEntry);
    this.props.toggle();
  };

  handleDelete = () => {
    this.props.delete(this.props.id);
    this.props.toggle();
  };

  handleUpdate = () => {
    const timeEntry = {};
    const timeSpent = `${this.state.data.hours}:${this.state.data.minutes}:00`;
    timeEntry.timeSpent = timeSpent;
    timeEntry.personId = this.props.state.userProfile._id;
    timeEntry.projectId = this.state.data.projectId;
    timeEntry.dateOfWork = this.state.data.date;
    timeEntry.isTangible = this.state.data.tangible;
    timeEntry.notes = this.state.data.notes;
    console.log(timeEntry);
    this.props.update(this.props.id, timeEntry);
    this.props.toggle();
  };

  clearForm = () => {
    this.setState({});
  };

  render() {
    let deleteEntry;
    let updateOrSubmit = this.renderButton(
      "Submit",
      () => {
        this.handleSubmit(true);
      },
      "primary"
    );

    if (this.props.delete) {
      deleteEntry = this.renderButton("Delete", this.handleDelete, "danger");
    }

    if (this.props.update) {
      updateOrSubmit = this.renderButton(
        "Update",
        () => {
          this.handleSubmit(false);
        },
        "primary"
      );
    }

    const min = moment()
      .startOf("week")
      .format("YYYY-MM-DD");
    const max = moment().format("YYYY-MM-DD");

    return (
      <div>
        <Container>
          <Row>
            <Col lg={12}>
              {this.renderInput({
                name: "date",
                label: "Date",
                type: "date",
                min,
                max
              })}
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              {this.renderInput({
                name: "hours",
                label: "Hours",
                type: "number",
                min: 0,
                max: 23
              })}
            </Col>
            <Col lg={6}>
              {this.renderInput({
                name: "minutes",
                label: "Minutes",
                type: "number",
                min: 0,
                max: 59
              })}
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <FormGroup>
                {this.renderDropDown({
                  name: "projectId",
                  label: "Project",
                  options: this.props.state.userProfile.projects
                })}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col lg={12}>
              <FormGroup>
                {this.renderRichTextEditor({ name: "notes", label: "Notes" })}
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <FormGroup>
              {this.renderCheckbox(
                "tangible",
                "Tangible",
                this.state.data.checked
              )}
            </FormGroup>
          </Row>
          <Row>
            <Col lg={6}>{updateOrSubmit}</Col>
            <Col>{this.renderButton("Clear", this.clearForm, "warning")}</Col>
            <Col>{deleteEntry}</Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { state };
};

export default connect(
  mapStateToProps,
  { postTimeEntry }
)(TimeEntryBody);
