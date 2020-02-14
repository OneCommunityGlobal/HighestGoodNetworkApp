import React, {Component} from 'react';
import {
    Container,
    Row,
    Col,
    Button,
    Card,
    CardTitle,
    CardSubtitle,
    CardHeader,
    CardBody,
    Nav
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
import _ from 'lodash'

class TimelogPage extends Component {
  state = {}

  async componentDidMount() {
	const userId = this.props.auth.user.userid;
    await this.props.getTimeEntriesForWeek(userId, 0);
    await this.props.getTimeEntriesForWeek(userId, 1);
    await this.props.getTimeEntriesForWeek(userId, 2);
    await this.props.getTimeEntriesForPeriod(userId, "2020-02-02", "2020-02-08");
    await this.props.getUserProjects(userId);
  }

    render() {
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
                <TimeEntryForm/>
              </Col>
            </Row>
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
                        <Button color="success" className="float-right">
                          Add Time Entry
                        </Button>
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