import React, { Component } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardSubtitle,
  CardHeader,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import classnames from 'classnames';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import ReactTooltip from 'react-tooltip';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProfile } from '../../actions/userProfile';
import { getUserProjects } from '../../actions/userProjects';
import TimeEntryForm from './TimeEntryForm';
import TimelogNavbar from './TimelogNavbar';
import TimeEntry from './TimeEntry';
import EffortBar from './EffortBar';

class TimelogPage extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.openInfo = this.openInfo.bind(this);
    this.data = {
      disabled: this.props.auth.isAdmin ? false : true,
      isTangible: this.props.auth.isAdmin ? true : false
    }
  }

  initialState = {
    modal: false,
    activeTab: 0,
    projectsSelected: ['all'],
    fromDate: this.startOfWeek(0),
    toDate: this.endOfWeek(0),
    in: false,
    information: '',
  };

  state = this.initialState;

  async componentDidMount() {
    
    const userId = this.props.match && this.props.match.params.userId ? this.props.match.params.userId : this.props.auth.user.userid;
    console.log(userId);
    await this.props.getUserProfile(userId);
    await this.props.getTimeEntriesForWeek(userId, 0);
    await this.props.getTimeEntriesForWeek(userId, 1);
    await this.props.getTimeEntriesForWeek(userId, 2);
    await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
    await this.props.getUserProjects(userId);
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.match && prevProps.match.params.userId !== this.props.match.params.userId) {
      this.setState(this.initialState);

      const userId = this.props.match && this.props.match.params.userId ? this.props.match.params.userId : this.props.auth.user.userid;
      await this.props.getUserProfile(userId);
      await this.props.getTimeEntriesForWeek(userId, 0);
      await this.props.getTimeEntriesForWeek(userId, 1);
      await this.props.getTimeEntriesForWeek(userId, 2);
      await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
      await this.props.getUserProjects(userId);
    }
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }

  openInfo() {
    const str = `This is the One Community time log! It is used to show a record of all the time you have volunteered with One Community, what you’ve done for each work session, etc.

    * “Add Time Entry” Button: Clicking this button will only allow you to add “Intangible” time. This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit.
    * Viewing Past Work: The current week is always shown by default but past weeks can also be viewed by clicking the tabs or selecting a date range.
    * Sorting by Project: All projects are shown by default but you can also choose to sort your time log by Project or Task.
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it.
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task.
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `

    this.setState({
      in: !this.state.in,
      information: str.split('\n').map((item, i) => <p key={i}>{item}</p>),
    })
  }

  changeTab(tab) {
    this.setState({
      activeTab: tab,
    })
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSearch(e) {
    e.preventDefault()
    const userId = this.props.match && this.props.match.params.userId ? this.props.match.params.userId : this.props.auth.user.userid;
    this.props.getTimeEntriesForPeriod(
      userId,
      this.state.fromDate,
      this.state.toDate,
    );
  }

  startOfWeek(offset) {
    return moment()
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
  }

  endOfWeek(offset) {
    return moment()
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD')
  }

  generateTimeEntries(data) {
    let filteredData = data
    if (!this.state.projectsSelected.includes('all')) {
      filteredData = data.filter(entry =>  this.state.projectsSelected.includes(entry.projectId));
    }
    return filteredData.map(entry => (
      <TimeEntry
        data={entry}
        displayYear={false}
        key={entry._id}
        userProfile={this.props.userProfile}
      />
    ))
  }

  render() {
    const currentWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[0])
    const lastWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[1])
    const beforeLastEntries = this.generateTimeEntries(this.props.timeEntries.weeks[2])
    const periodEntries = this.generateTimeEntries(this.props.timeEntries.period)
    const userId = this.props.match && this.props.match.params.userId ? this.props.match.params.userId : this.props.auth.user.userid;
    const isAdmin = this.props.auth.user.role === 'Administrator'
    const isOwner = this.props.auth.user.userid === userId; 
    const fullName = `${this.props.userProfile.firstName} ${this.props.userProfile.lastName}`

    let projects = []
    if (!_.isEmpty(this.props.userProjects.projects)) {
      projects = this.props.userProjects.projects
    }
    const projectOptions = projects.map(project => (
      <option value={project.projectId} key={project.projectId}>
        {' '}
        {project.projectName}{' '}
      </option>
    ))
    projectOptions.unshift(
      <option value="all" key="all">
        All Projects (Default)
      </option>,
    )

    return (
      <Container>
        <TimelogNavbar userId={userId} />
        <Row>
          <Col md={12}>
            <Card>
              <CardHeader>
                <Row>
                  <Col md={11}>
                    <CardTitle tag="h4">Time Entries &nbsp;
                            <i
                              className="fa fa-info-circle"
                              data-tip
                              data-for="registerTip"
                              aria-hidden="true"
                              onClick={this.openInfo}
                            /></CardTitle>
                    <CardSubtitle tag="h6" className="text-muted">
                      Viewing time entries logged in the last 3 weeks 
                    </CardSubtitle>
                  </Col>
                  <Col md={11}>
                    {isOwner ? (
                      <div className="float-right">
                        <div>
                          <Button color="success" onClick={this.toggle}>
                            Add Time Entry
                          </Button>
                        </div>
                      </div>
                    ) : (
                      isAdmin && (
                        <div className="float-right">
                          <div>
                            <Button color="warning" onClick={this.toggle}>
                              Add Time Entry {!isOwner && `for ${fullName}`}
                            </Button>
                          </div>

                        </div>
                      )
                    )}
                    <Modal isOpen={this.state.in} toggle={this.openInfo}>
                      <ModalHeader>Info</ModalHeader>
                      <ModalBody>{this.state.information}</ModalBody>
                      <ModalFooter>
                        <Button onClick={this.openInfo} color="primary">
                          Close
                        </Button>
                        {isAdmin && (
                          <Button onClick={this.openInfo} color="secondary">
                            Edit
                          </Button>
                        )}
                      </ModalFooter>
                    </Modal>
                    <TimeEntryForm
                      userId={userId}
                      data={this.data}
                      edit={false}
                      toggle={this.toggle}
                      isOpen={this.state.modal}
                      userProfile={this.props.userProfile}
                    />
                    <ReactTooltip id="registerTip" place="bottom" effect="solid">
                      Click this icon to learn about the timelog.
                    </ReactTooltip>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Nav tabs className="mb-1">
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === 0 })}
                      onClick={() => {
                        this.changeTab(0)
                      }}
                      href="#"
                    >
                      Current Week
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === 1 })}
                      onClick={() => {
                        this.changeTab(1)
                      }}
                      href="#"
                    >
                      Last Week
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === 2 })}
                      onClick={() => {
                        this.changeTab(2)
                      }}
                      href="#"
                    >
                      Week Before Last
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === 3 })}
                      onClick={() => {
                        this.changeTab(3)
                      }}
                      href="#"
                    >
                      Search by Date Range
                    </NavLink>
                  </NavItem>
                </Nav>

                <TabContent activeTab={this.state.activeTab}>
                  {this.state.activeTab === 3 ? (
                    <p className="ml-1">
                      Viewing time Entries from <b>{this.state.fromDate}</b>
                      {' to '}
                      <b>{this.state.toDate}</b>
                    </p>
                  ) : (
                    <p className="ml-1">
                      Viewing time Entries from <b>{this.startOfWeek(this.state.activeTab)}</b>
                      {' to '}
                      <b>{this.endOfWeek(this.state.activeTab)}</b>
                    </p>
                  )}
                  {this.state.activeTab === 3 && (
                    <Form inline className="mb-2">
                      <FormGroup className="mr-2">
                        <Label for="fromDate" className="mr-2">
                          From
                        </Label>
                        <Input
                          type="date"
                          name="fromDate"
                          id="fromDate"
                          value={this.state.fromDate}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label for="toDate" className="mr-2">
                          To
                        </Label>
                        <Input
                          type="date"
                          name="toDate"
                          id="toDate"
                          value={this.state.toDate}
                          onChange={this.handleInputChange}
                        />
                      </FormGroup>
                      <Button color="primary" onClick={this.handleSearch} className="ml-2">
                        Search
                      </Button>
                    </Form>
                  )}
                  <Form inline className="mb-2">
                    <FormGroup>
                      <Label for="projectSelected" className="mr-2 ml-1 mb-5 align-top">
                        Filter Entries by Project:
                      </Label>
                      <Input
                        type="select"
                        name="projectSelected"
                        id="projectSelected"
                        value={this.state.projectsSelected}
                        onChange={e =>
                          this.setState({
                            projectsSelected:  Array.from(e.target.selectedOptions, option => option.value),
                          })
                        }
                      multiple>
                        {projectOptions}
                      </Input>
                    </FormGroup>
                  </Form>
                  <EffortBar
                    activeTab={this.state.activeTab}
                    projectsSelected={this.state.projectsSelected}
                  />
                  <TabPane tabId={0}>{currentWeekEntries}</TabPane>
                  <TabPane tabId={1}>{lastWeekEntries}</TabPane>
                  <TabPane tabId={2}>{beforeLastEntries}</TabPane>
                  <TabPane tabId={3}>{periodEntries}</TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
          <Col md={4} />
        </Row>
      </Container>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
})

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
  getUserProfile,
})(TimelogPage)
