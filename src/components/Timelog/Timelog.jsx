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
    TabPane
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
import Loading from '../common/Loading'

class TimelogPage extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.changeTab = this.changeTab.bind(this);
    }

    state = {
        modal: false,
        activeTab: 0
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

    render() {
        const currentWeekEntries = this.props.timeEntries.weeks[0].map(
            entry => <TimeEntry data={entry} displayYear={false} key={entry._id}/>
        )
        const lastWeekEntries = this.props.timeEntries.weeks[1].map(
            entry => <TimeEntry data={entry} displayYear={false} key={entry._id}/>
        )
        const beforeLastEntries = this.props.timeEntries.weeks[2].map(
            entry => <TimeEntry data={entry} displayYear={false} key={entry._id}/>
        )

        return (
            <Container>
                <TimelogNavbar/>
                <Row>
                    <Col md={8}>
                        <Card>
                            <CardHeader>
                                <Row>
                                    <Col>
                                        <CardTitle tag="h4">
                                        Time Entries
                                        </CardTitle>
                                        <CardSubtitle tag="h6" className="text-muted">
                                        Viewing time entries logged in last 3 weeks
                                        </CardSubtitle>
                                    </Col>
                                    <Col>
                                        <TimeEntryForm isOpen={this.state.modal} toggle={this.toggle}/>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                <Nav tabs>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 0 })}
                                            onClick={() => { this.changeTab(0); }}
                                        >
                                            Current Week
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 1 })}
                                            onClick={() => { this.changeTab(1); }}
                                        >
                                            Last Week
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: this.state.activeTab === 2 })}
                                            onClick={() => { this.changeTab(2); }}
                                        >
                                            Week Before Last
                                        </NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={this.state.activeTab}>
                                    <p>Viewing time Entries from {' '}
                                        {this.startOfWeek(this.state.activeTab)} {" to "} 
                                        {this.endOfWeek(this.state.activeTab)}
                                    </p>
                                    <TabPane tabId={0}>
                                        {currentWeekEntries}
                                    </TabPane>
                                    <TabPane tabId={1}>
                                        {lastWeekEntries}
                                    </TabPane>
                                    <TabPane tabId={2}>
                                        {beforeLastEntries}
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
  userProfile: state.userProfile,
  timeEntries: state.timeEntries
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