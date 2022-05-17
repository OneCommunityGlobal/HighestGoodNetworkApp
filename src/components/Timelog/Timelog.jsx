import React, { Component } from 'react';

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
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import { getUserProjects } from '../../actions/userProjects';
import TimeEntryForm from './TimeEntryForm';
import TimeEntry from './TimeEntry';
import EffortBar from './EffortBar';
import SummaryBar from '../SummaryBar/SummaryBar';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import ActiveCell from 'components/UserManagement/ActiveCell';
import { ProfileNavDot } from 'components/UserManagement/ProfileNavDot';
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';

class Timelog extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.showSummary = this.showSummary.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.openInfo = this.openInfo.bind(this);
    this.data = {
      disabled: !hasPermission(this.props.auth.user.role, 'disabledDataTimelog') ? false : true,
      isTangible: hasPermission(this.props.auth.user.role, 'dataIsTangibleTimelog') ? true : false,
    };
    this.userProfile = this.props.userProfile;
  }

  initialState = {
    modal: false,
    summary: false,
    activeTab: 0,
    projectsSelected: ['all'],
    fromDate: this.startOfWeek(0),
    toDate: this.endOfWeek(0),
    in: false,
    information: '',
    isTimeEntriesLoading: true,
  };

  state = this.initialState;

  async componentDidMount() {
    const userId = this.props?.match?.params?.userId || this.props.auth.user.userid;
    await this.props.getUserProfile(userId);
    this.userProfile = this.props.userProfile;
    await this.props.getTimeEntriesForWeek(userId, 0);
    await this.props.getTimeEntriesForWeek(userId, 1);
    await this.props.getTimeEntriesForWeek(userId, 2);
    await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
    await this.props.getUserProjects(userId);
    this.setState({ isTimeEntriesLoading: false });
  }

  async componentDidUpdate(prevProps) {
    //Don't run function on first render
    if (!this.props.match) return;

    if (
      prevProps.match?.params?.userId !== this.props.match.params.userId ||
      prevProps.asUser !== this.props.asUser
    ) {
      this.setState(this.initialState);

      const userId =
        this.props.match?.params?.userId || this.props.asUser || this.props.auth.user.userid;

      await this.props.getUserProfile(userId);

      this.userProfile = this.props.userProfile;

      await Promise.all([
        this.props.getTimeEntriesForWeek(userId, 0),
        this.props.getTimeEntriesForWeek(userId, 1),
        this.props.getTimeEntriesForWeek(userId, 2),
        this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate),
        this.props.getUserProjects(userId),
      ]);
    }
  }

  toggle() {
    this.setState({
      modal: !this.state.modal,
    });
  }

  showSummary(isOwner) {
    if (isOwner) {
      this.setState({
        summary: !this.state.summary,
      });
      setTimeout(() => {
        let elem = document.getElementById('weeklySum');
        if (elem) {
          elem.scrollIntoView();
        }
      }, 150);
    }
  }

  openInfo() {
    const str = `This is the One Community time log! It is used to show a record of all the time you have volunteered with One Community, what you’ve done for each work session, etc.
    * “Add Time Entry” Button: Clicking this button will only allow you to add “Intangible” time. This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit.
    * Viewing Past Work: The current week is always shown by default but past weeks can also be viewed by clicking the tabs or selecting a date range.
    * Sorting by Project: All projects are shown by default but you can also choose to sort your time log by Project or Task.
    * Notes: The “Notes” section is where you write a summary of what you did during the time you are about to log. You must write a minimum of 10 words because we want you to be specific. You must include a link to your work so others can easily confirm and review it.
    * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time spent working on your Projects/Tasks and counts towards your committed time for the week and also the time allocated for your task.
    * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible Time.” This is for time not related to your tasks OR for time you need a manager to change to “Tangible” for you because you were working away from your computer or made a mistake and are trying to manually log time. Intangible time will not be counted towards your committed time for the week or your tasks. “Intangible” time changed by a manager to “Tangible” time WILL be counted towards your committed time for the week and whatever task it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time for any reason other than work away from your computer will count and be recorded in the system the same as a time edit. `;

    this.setState({
      in: !this.state.in,
      information: str.split('\n').map((item, i) => <p key={i}>{item}</p>),
    });
  }

  changeTab(tab) {
    this.setState({
      activeTab: tab,
    });
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSearch(e) {
    e.preventDefault();
    const userId =
      this.props.match && this.props.match.params.userId
        ? this.props.match.params.userId
        : this.props.asUser || this.props.auth.user.userid;
    this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
  }

  startOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  endOfWeek(offset) {
    return moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(offset, 'weeks')
      .format('YYYY-MM-DD');
  }

  generateTimeEntries(data) {
    let filteredData = data;
    if (!this.state.projectsSelected.includes('all')) {
      filteredData = data.filter(entry => this.state.projectsSelected.includes(entry.projectId));
    }

    return filteredData.map(entry => (
      <TimeEntry data={entry} displayYear={false} key={entry._id} userProfile={this.userProfile} />
    ));
  }

  render() {
    const currentWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[0]);
    const lastWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[1]);
    const beforeLastEntries = this.generateTimeEntries(this.props.timeEntries.weeks[2]);
    const periodEntries = this.generateTimeEntries(this.props.timeEntries.period);
    const userId =
      this.props.match && this.props.match.params.userId
        ? this.props.match.params.userId
        : this.props.asUser || this.props.auth.user.userid;
    const role = this.props.auth.user.role;
    const isOwner = this.props.auth.user.userid === userId;
    const fullName = `${this.props.userProfile.firstName} ${this.props.userProfile.lastName}`;

    let projects = [];
    if (!_.isEmpty(this.props.userProjects.projects)) {
      projects = this.props.userProjects.projects;
    }
    const projectOptions = projects.map(project => (
      <option value={project.projectId} key={project.projectId}>
        {' '}
        {project.projectName}{' '}
      </option>
    ));
    projectOptions.unshift(
      <option value="all" key="all">
        All Projects (Default)
      </option>,
    );

    return (
      <div>
        {!this.props.isDashboard ? (
          <Container fluid>
            <SummaryBar toggleSubmitForm={() => this.showSummary(isOwner)} role={role} />
          </Container>
        ) : (
          ''
        )}
        {this.state.isTimeEntriesLoading ? (
          <Loading />
        ) : (
          <Container>
            {this.state.summary ? (
              <div className="my-2">
                <div id="weeklySum">
                  <WeeklySummary asUser={userId} />
                </div>
              </div>
            ) : null}
            <Row>
              <Col md={12}>
                <Card>
                  <CardHeader>
                    <Row>
                      <Col md={11}>
                        <CardTitle tag="h4">
                          Time Entries &nbsp;
                          <i
                            className="fa fa-info-circle"
                            data-tip
                            data-for="registerTip"
                            aria-hidden="true"
                            onClick={this.openInfo}
                          />
                          <ActiveCell
                            isActive={this.props.userProfile.isActive}
                            user={this.props.userProfile}
                            onClick={() => {
                              const userId =
                                this.props.match?.params?.userId ||
                                this.props.asUser ||
                                this.props.auth.user.userid;
                              this.props.updateUserProfile(userId, {
                                ...this.props.userProfile,
                                isActive: !this.props.userProfile.isActive,
                                endDate:
                                  !this.props.userProfile.isActive === false
                                    ? moment(new Date()).format('YYYY-MM-DD')
                                    : undefined,
                              });
                            }}
                          />
                          <ProfileNavDot
                            userId={
                              this.props.match?.params?.userId ||
                              this.props.asUser ||
                              this.props.auth.user.userid
                            }
                          />
                        </CardTitle>
                        <CardSubtitle tag="h6" className="text-muted">
                          Viewing time entries logged in the last 3 weeks
                        </CardSubtitle>
                      </Col>
                      <Col md={11}>
                        {isOwner ? (
                          <div className="float-right">
                            <div>
                              <Button color="success" onClick={this.toggle}>
                                {'Add Intangible Time Entry '}
                                <i
                                  className="fa fa-info-circle"
                                  data-tip
                                  data-for="timeEntryTip"
                                  data-delay-hide="1000"
                                  aria-hidden="true"
                                  title=""
                                />
                              </Button>
                              <ReactTooltip id="timeEntryTip" place="bottom" effect="solid">
                                Clicking this button only allows for “Intangible Time” to be added
                                to your time log.{' '}
                                <u>
                                  You can manually log Intangible Time but it doesn’t <br />
                                  count towards your weekly time commitment.
                                </u>
                                <br />
                                <br />
                                “Tangible Time” is the default for logging time using the timer at
                                the top of the app. It represents all work done on assigned action
                                items <br />
                                and is what counts towards a person’s weekly volunteer time
                                commitment. The only way for a volunteer to log Tangible Time is by
                                using the clock
                                <br />
                                in/out timer. <br />
                                <br />
                                Intangible Time is almost always used only by the management team.
                                It is used for weekly Monday night management team calls, monthly
                                management
                                <br />
                                team reviews and Welcome Team Calls, and non-action-item related
                                research, classes, and other learning, meetings, etc. that benefit
                                or relate to <br />
                                the project but aren’t related to a specific action item on the{' '}
                                <a href="https://www.tinyurl.com/oc-os-wbs">
                                  One Community Work Breakdown Structure.
                                </a>
                                <br />
                                <br />
                                Intangible Time may also be logged by a volunteer when in the field
                                or for other reasons when the timer wasn’t able to be used. In these
                                cases, the <br />
                                volunteer will use this button to log time as “intangible time” and
                                then request that an Admin manually change the log from Intangible
                                to Tangible.
                                <br />
                                <br />
                              </ReactTooltip>
                            </div>
                          </div>
                        ) : (
                          hasPermission(role, 'addTimeEntryOthers') && (
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
                            {hasPermission(role, 'editTimelogInfo') ? (
                              <Button onClick={this.openInfo} color="secondary">
                                Edit
                              </Button>
                            ) : null}
                          </ModalFooter>
                        </Modal>
                        <TimeEntryForm
                          userId={userId}
                          data={this.data}
                          edit={false}
                          toggle={this.toggle}
                          isOpen={this.state.modal}
                          userProfile={this.userProfile}
                          isInTangible={true}
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
                            this.changeTab(0);
                          }}
                          href="#"
                          to="#"
                        >
                          Current Week
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: this.state.activeTab === 1 })}
                          onClick={() => {
                            this.changeTab(1);
                          }}
                          href="#"
                          to="#"
                        >
                          Last Week
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: this.state.activeTab === 2 })}
                          onClick={() => {
                            this.changeTab(2);
                          }}
                          href="#"
                          to="#"
                        >
                          Week Before Last
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames({ active: this.state.activeTab === 3 })}
                          onClick={() => {
                            this.changeTab(3);
                          }}
                          href="#"
                          to="#"
                        >
                          Search by Date Range
                        </NavLink>
                      </NavItem>
                    </Nav>

                    <TabContent activeTab={this.state.activeTab}>
                      {this.state.activeTab === 3 ? (
                        <p className="ml-1">
                          Viewing time Entries from <b>{this.state.fromDate}</b> to{' '}
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
                          <Label for="projectSelected" className="mr-1 ml-1 mb-1 align-top">
                            Filter Entries by Project:
                          </Label>
                          <Input
                            type="select"
                            name="projectSelected"
                            id="projectSelected"
                            value={this.state.projectsSelected}
                            title="Ctrl + Click to select multiple projects to filter."
                            onChange={e =>
                              this.setState({
                                projectsSelected: Array.from(
                                  e.target.selectedOptions,
                                  option => option.value,
                                ),
                              })
                            }
                            multiple
                          >
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
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
});

export default connect(mapStateToProps, {
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
  getUserProfile,
  updateUserProfile,
})(Timelog);
