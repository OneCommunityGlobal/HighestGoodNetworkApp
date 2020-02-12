import React, {Component} from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Button
} from 'reactstrap'
import { connect } from 'react-redux'
import { 
  getTimeEntriesForWeek, 
  getTimeEntriesForPeriod,
  postTimeEntry
} from '../../actions/timeEntries' 
import {
  getUserProjects
} from '../../actions/userProjects'
import _ from 'lodash'

const initialState = {
  dateOfWork: "",
  hours: 0,
  minutes: 0,
  projectId: "",
  notes: "",
  isTangible: true
}

class TimelogPage extends Component {
  state = initialState

  async componentDidMount() {
		const userId = this.props.auth.user.userid;
    await this.props.getTimeEntriesForWeek(userId, 0);
    await this.props.getTimeEntriesForWeek(userId, 1);
    await this.props.getTimeEntriesForWeek(userId, 2);
    await this.props.getTimeEntriesForPeriod(userId, "2020-02-02", "2020-02-08");
    await this.props.getUserProjects(userId);
  }
  
  handleDateChange = event => {
    this.setState({
      dateOfWork: event.target.value
    })
  }

  handleHoursChange = event => {
    this.setState({
      hours: event.target.value
    })
  }

  handleMinutesChange = event => {
    this.setState({
      minutes: event.target.value
    })
  }

  handleProjectChange = event => {
    this.setState({
      projectId: event.target.value
    })
  }

  handleNotesChange = event => {
    this.setState({
      notes: event.target.value
    })
  }

  handleTangibleChange = event => {
    this.setState({
      isTangible: event.target.checked
    })
  }

  handleSubmit = async event => {
		event.preventDefault()
    
    const timeEntry = {};

    timeEntry.personId = this.props.auth.user.userid;
    timeEntry.dateOfWork = this.state.dateOfWork;
    timeEntry.timeSpent = `${this.state.hours}:${this.state.minutes}:00`;
    timeEntry.projectId = this.state.projectId;
    timeEntry.notes = `<p>${this.state.notes}</p>`;
    timeEntry.isTangible = this.state.isTangible;

    await this.props.postTimeEntry(timeEntry);
    
    this.setState(initialState);
	}

    render() {
      const { projects } = this.props.userProjects;
      const projectOptions = projects.map(project => {
        return <option value={project.projectId}> {project.projectName} </option>
      })
      projectOptions.unshift(
        <option value={""}></option>
      );

        return (
            <Container>
              <div>
              <nav class="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
                <li class="navbar-brand">Viewing Timelog For: {this.props.userProfile.firstName} {this.props.userProfile.lastName}</li>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#timelogsnapshot" aria-controls="navbarSupportedContent"
                  aria-expanded="false" aria-label="Toggle navigation">
                </button>
                <div class="collapse navbar-collapse" id="timelogsnapshot">
                  <ul class="navbar-nav w-100">
                    <li class="nav-item navbar-text mr-3 w-25" id="timelogweeklychart">
                     progress bar
                    </li>
                    <li class="nav-item  navbar-text">
                      <span class="fa fa-tasks icon-large" data-toggle="modal" data-target="#actionItems">
                        <icon class="badge badge-pill badge-warning badge-notify"></icon>
                      </span>
                    </li>
                    <li class="nav-item navbar-text">
                      <i class="fa fa-envelope icon-large" data-toggle="modal" data-target="#notifications">
                        <icon class="badge badge-pill badge-warning badge-notify">noti</icon>
                      </i>
                    </li>
                    <li class="nav-item navbar-text">
                      <a class="nav-link" href= {`/userprofile/${this.props.auth.user.userid}`} >View Profile</a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            <Row>
              <Col md={6}>
                <h3> Add a Time Entry </h3>
                <Form>
                  <FormGroup>
                    <Label for="dateOfWork">Date</Label>
                    <Input type="date" name="date" id="dateOfWork" placeholder="Date Placeholder" 
                      value={this.state.dateOfWork} onChange={this.handleDateChange}/>
                  </FormGroup>
                  <FormGroup>
                    <Label for="timeSpent">Time (HH:MM)</Label>
                    <Row form>
                      <Col>
                        <Input type="number" name="hours" id="hours" placeholder="Hours" 
                          value={this.state.hours} onChange={this.handleHoursChange}/>
                      </Col>
                      <Col>
                        <Input type="number" name="minutes" id="minutes" placeholder="Minutes" 
                          value={this.state.minutes} onChange={this.handleMinutesChange}/>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <Label for="project">Project</Label>
                    <Input type="select" name="project" id="project" 
                      value={this.state.projectId} onChange={this.handleProjectChange}>
                      {projectOptions}
                    </Input>
                  </FormGroup>
                  <FormGroup>
                    <Label for="notes">Notes</Label>
                    <Input type="textarea" name="notes" id="notes" placeholder="Notes" 
                      value={this.state.notes} onChange={this.handleNotesChange}/>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <Input type="checkbox" checked={this.state.isTangible} onChange={this.handleTangibleChange}/>{' '}
                      Tangible
                    </Label>
                  </FormGroup>
                  <Button onClick={this.handleSubmit}> Submit </Button>
                </Form>
              </Col>
            </Row>
            </Container>
        );
    }
}
const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userProjects: state.userProjects
});

export default connect(
  mapStateToProps,
  {
    getTimeEntriesForWeek,
    getTimeEntriesForPeriod,
    getUserProjects,
    postTimeEntry
  }
)(TimelogPage);