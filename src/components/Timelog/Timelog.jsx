import React, {Component} from 'react';
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
    Button
} from 'reactstrap'
import classnames from 'classnames';
import { connect } from 'react-redux'
import moment from "moment";
import _ from "lodash";
import { 
    getTimeEntriesForWeek, 
    getTimeEntriesForPeriod,
} from '../../actions/timeEntries' 
import { getUserProfile } from '../../actions/userProfile'
import {
    getUserProjects
} from '../../actions/userProjects'
import TimeEntryForm from './TimeEntryForm'
import TimelogNavbar from './TimelogNavbar'
import TimeEntry from './TimeEntry'
import EffortBar from './EffortBar';

class TimelogPage extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.changeTab = this.changeTab.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    initialState = {
        modal: false,
        activeTab: 0,
        projectSelected: "all",
        fromDate: this.startOfWeek(0),
        toDate: this.endOfWeek(0)
    };

    state = this.initialState

    async componentDidMount() {
        const userId = this.props.match.params.userId;
        await this.props.getUserProfile(userId);
        await this.props.getTimeEntriesForWeek(userId, 0);
        await this.props.getTimeEntriesForWeek(userId, 1);
        await this.props.getTimeEntriesForWeek(userId, 2);
        await this.props.getTimeEntriesForPeriod(userId, this.state.fromDate, this.state.toDate);
        await this.props.getUserProjects(userId);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            this.setState(this.initialState);
            
            const userId = this.props.match.params.userId;
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
            modal: !this.state.modal
        });
    }

    changeTab(tab) {
        this.setState({
            activeTab: tab
        });
    }

    handleInputChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSearch(e) {
        e.preventDefault();
        this.props.getTimeEntriesForPeriod(this.props.match.params.userId, 
            this.state.fromDate, this.state.toDate);
    }

    startOfWeek(offset) {
        return moment()
            .startOf("week")
            .subtract(offset, "weeks")
            .format("YYYY-MM-DD");
    }

    endOfWeek(offset) {
        return moment()
            .endOf("week")
            .subtract(offset, "weeks")
            .format("YYYY-MM-DD");
    }

    generateTimeEntries(data) {
        let filteredData = data;
        if (this.state.projectSelected !== "all") {
            filteredData = data.filter(entry => entry.projectId === this.state.projectSelected)
        }
        return filteredData.map(
            entry => <TimeEntry data={entry} displayYear={false} key={entry._id}/>
        )
    }

    render() {
        const currentWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[0]);
        const lastWeekEntries = this.generateTimeEntries(this.props.timeEntries.weeks[1]);
        const beforeLastEntries = this.generateTimeEntries(this.props.timeEntries.weeks[2]);
        const periodEntries = this.generateTimeEntries(this.props.timeEntries.period);

        const isAdmin = this.props.auth.user.role === "Administrator";
        const isOwner = this.props.auth.user.userid === this.props.match.params.userId;
        const fullName = this.props.userProfile.firstName + " " + this.props.userProfile.lastName;

        let projects = [];
        if (!_.isEmpty(this.props.userProjects.projects)) {
            projects = this.props.userProjects.projects;
        }
        const projectOptions = projects.map(project => 
            <option value={project.projectId} key={project.projectId}> {project.projectName} </option>
        )
        projectOptions.unshift(<option value="all" key="all">All Projects (Default)</option>);

        return (
            <Container>
                <TimelogNavbar userId={this.props.match.params.userId}/>
                <Row>
                    <Col md={8}>
                        <Card>
                            <CardHeader>
                                <Row>
                                    <Col md={7}>
                                        <CardTitle tag="h4">
                                            Time Entries
                                        </CardTitle>
                                        <CardSubtitle tag="h6" className="text-muted">
                                            Viewing time entries logged in last 3 weeks
                                        </CardSubtitle>
                                    </Col>
                                    <Col md={5}>
                                        {isOwner ? 
                                            (<Button color="success" className="float-right" onClick={ this.toggle }> 
                                                Add Time Entry
                                            </Button>) 
                                        : isAdmin && 
                                            (<Button color="warning" className="float-right" onClick={ this.toggle }>
                                                Add Time Entry {!isOwner && `for ${fullName}`}
                                            </Button>)}
                                        <TimeEntryForm userId={this.props.match.params.userId} edit={false} 
                                            toggle={this.toggle} isOpen={this.state.modal}/>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Nav tabs className="mb-1">
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 0 })}
                                            onClick={() => { this.changeTab(0); }}
                                            href="#"
                                        >
                                            Current Week
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 1 })}
                                            onClick={() => { this.changeTab(1); }}
                                            href="#"
                                        >
                                            Last Week
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 2 })}
                                            onClick={() => { this.changeTab(2); }}
                                            href="#"
                                        >
                                            Week Before Last
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 3 })}
                                            onClick={() => { this.changeTab(3); }}
                                            href="#"
                                        >
                                            Search by Date Range
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>
                                    {this.state.activeTab === 3 ?
                                        <p>Viewing time Entries from {' '}
                                            <b>{this.state.fromDate}</b>
                                            {" to "} 
                                            <b>{this.state.toDate}</b>
                                        </p> :
                                        <p>Viewing time Entries from {' '}
                                            <b>{this.startOfWeek(this.state.activeTab)}</b>
                                            {" to "} 
                                            <b>{this.endOfWeek(this.state.activeTab)}</b>
                                        </p>
                                    }
                                    {this.state.activeTab === 3 && 
                                        <Form inline className="mb-2">
                                            <FormGroup className="mr-2">
                                                <Label for="fromDate" className="mr-2">From</Label>
                                                    <Input type="date" name="fromDate" id="fromDate"
                                                        value={this.state.fromDate} onChange={this.handleInputChange}/>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="toDate" className="mr-2">To</Label>
                                                    <Input type="date" name="toDate" id="toDate"
                                                        value={this.state.toDate} onChange={this.handleInputChange}/>
                                            </FormGroup>
                                            <Button color="primary" onClick={this.handleSearch} className="ml-2">
                                                Search
                                            </Button>
                                        </Form>
                                    }
                                    <Form inline className="mb-2">
                                        <FormGroup>
                                            <Label for="projectSelected" className="mr-2">Filter Entries by Project:</Label>
                                            <Input type="select" name="projectSelected" id="projectSelected" 
                                                value={this.state.projectSelected} 
                                                onChange={e => this.setState({
                                                    projectSelected: e.target.value
                                                })}>
                                                {projectOptions}
                                            </Input>
                                        </FormGroup>
                                    </Form>
                                    <EffortBar activeTab={this.state.activeTab} 
                                        projectSelected={this.state.projectSelected}/>
                                    <TabPane tabId={0}>
                                        { currentWeekEntries }
                                    </TabPane>
                                    <TabPane tabId={1}>
                                        { lastWeekEntries }
                                    </TabPane>
                                    <TabPane tabId={2}>
                                        { beforeLastEntries }
                                    </TabPane>
                                    <TabPane tabId={3}>
                                        { periodEntries }
                                    </TabPane>
                                </TabContent>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md={4}>
                    </Col>              
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  timeEntries: state.timeEntries,
  userProjects: state.userProjects
});

export default connect(
  mapStateToProps,
  {
    getTimeEntriesForWeek,
    getTimeEntriesForPeriod,
    getUserProjects,
    getUserProfile
  }
)(TimelogPage);