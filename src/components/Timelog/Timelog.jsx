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
} from 'reactstrap'
import { connect } from 'react-redux'
import { 
    getTimeEntriesForWeek, 
    getTimeEntriesForPeriod,
} from '../../actions/timeEntries' 
import {
    getUserProjects
} from '../../actions/userProjects'
import TimeEntryForm from './TimeEntryForm'
import TimelogNavbar from './TimelogNavbar';

class TimelogPage extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
    }

    state = {
        modal: false
    };

    async componentDidMount() {
        const userId = this.props.auth.user.userid;
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

    render() {
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
                                {/* <NavItem>
                                    <NavLink
                                    className={classnames({ active: activeTab === '1' })}
                                    onClick={() => { toggle('1'); }}
                                    >
                                    Tab1
                                    </NavLink>
                                </NavItem> */}
                                </Nav>
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
});

export default connect(
  mapStateToProps,
  {
    getTimeEntriesForWeek,
    getTimeEntriesForPeriod,
    getUserProjects,
  }
)(TimelogPage);