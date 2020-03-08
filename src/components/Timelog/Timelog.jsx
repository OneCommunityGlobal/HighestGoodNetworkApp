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
    Input
} from 'reactstrap'
import classnames from 'classnames';
import { connect } from 'react-redux'
import moment from "moment";
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

class TimelogPage extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.changeTab = this.changeTab.bind(this);
    }

    state = {
        modal: false,
        activeTab: 0,
        projectSelected: "all"
    };

    async componentDidMount() {
        const userId = this.props.match.params.userId;
        await this.props.getUserProfile(userId);
        await this.props.getTimeEntriesForWeek(userId, 0);
        await this.props.getTimeEntriesForWeek(userId, 1);
        await this.props.getTimeEntriesForWeek(userId, 2);
        await this.props.getTimeEntriesForPeriod(userId, "2020-02-02", "2020-02-18");
        await this.props.getUserProjects(userId);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            await this.props.getUserProfile(this.props.match.params.userId);
            await this.props.getTimeEntriesForWeek(this.props.match.params.userId, 0);
            await this.props.getTimeEntriesForWeek(this.props.match.params.userId, 1);
            await this.props.getTimeEntriesForWeek(this.props.match.params.userId, 2);
            await this.props.getUserProjects(this.props.match.params.userId);
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

        const isAdmin = this.props.auth.user.role === "Administrator";
        const isOwner = this.props.auth.user.userid === this.props.match.params.userId;

        const { projects } = this.props.userProjects;
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
                                    <Col md={8}>
                                        <CardTitle tag="h4">
                                        Time Entries
                                        </CardTitle>
                                        <CardSubtitle tag="h6" className="text-muted">
                                        Viewing time entries logged in last 3 weeks
                                        </CardSubtitle>
                                    </Col>
                                    <Col md={4}>
                                        {(isAdmin || isOwner) && 
                                            <TimeEntryForm userId={this.props.match.params.userId} edit={false}/>
                                        }
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
                                            Search by Date
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={this.state.activeTab}>
                                    <p>Viewing time Entries from {' '}
                                        <b>{this.startOfWeek(this.state.activeTab)}</b>
                                        {" to "} 
                                        <b>{this.endOfWeek(this.state.activeTab)}</b>
                                    </p>
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
                                    <TabPane tabId={0}>
                                        { currentWeekEntries }
                                    </TabPane>
                                    <TabPane tabId={1}>
                                        { lastWeekEntries }
                                    </TabPane>
                                    <TabPane tabId={2}>
                                        { beforeLastEntries }
                                    </TabPane>
                                    <NavLink className="h6" href="#">
                                        View Entries of Other Period
                                    </NavLink>
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