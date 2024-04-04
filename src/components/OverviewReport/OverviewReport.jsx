/* eslint-disable no-console */
/* eslint-disable react/prefer-stateless-function */
import { Component } from 'react';
import { Container, Row, Col, NavItem, NavLink, Nav, TabContent } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { connect } from 'react-redux';
import moment from 'moment';
import OverviewReportPanel from './OverviewReportTab';
// 'This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'
const navItems = [
  { text: 'This Week', value: 0 },
  { text: 'Last Week', value: 1 },
  { text: 'Week Before Last', value: 2 },
  { text: 'Three Weeks Ago', value: 3 },
];

export class OverviewReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: JSON.parse(sessionStorage.getItem('tabSelection')) || navItems[0],
    };
  }

  toggleTab = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
      sessionStorage.setItem('tabSelection', JSON.stringify(tab));
    }
  };

  render() {
    const { activeTab, role } = this.state;

    // this will get the startDate/endDate depending on which tab is currently selected
    const startDate = moment()
      .subtract(activeTab.value, 'week')
      .startOf('week')
      .format('YYYY-MM-DD');
    const endDate = moment()
      .subtract(activeTab.value, 'week')
      .endOf('week')
      .format('YYYY-MM-DD');

    return (
      <Container fluid className="bg--white-smoke py-3 mb-5">
        <Row>
          <Col lg={{ size: 12 }}>
            <h3 className="mt-3 mb-5">
              <div className="d-flex align-items-center">
                <span className="mr-2">Overview Report Page</span>
                <EditableInfoModal
                  areaName="OverviewReport"
                  areaTitle="Overview Report"
                  role={role}
                  fontSize={24}
                  isPermissionPage
                  className="p-2"
                />
              </div>
            </h3>
          </Col>
        </Row>
        <Row>
          <Col lg={{ size: 12 }}>
            <Nav tabs>
              {navItems.map(item => (
                <NavItem key={item.text}>
                  <NavLink
                    href="#"
                    data-testid={item.text}
                    active={item.text === activeTab}
                    onClick={() => this.toggleTab(item)}
                  >
                    {item.text}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeTab}>
              <OverviewReportPanel
                activeTab={activeTab}
                userRole={role}
                startDate={startDate}
                endDate={endDate}
              />
            </TabContent>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  role: state.userProfile.role,
});

export default connect(mapStateToProps)(OverviewReport);
