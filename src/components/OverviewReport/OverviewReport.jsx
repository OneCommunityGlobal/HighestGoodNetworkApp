/* eslint-disable react/prefer-stateless-function */
import { Component } from 'react';
import { Container, Row, Col, NavItem, NavLink, Nav, TabContent } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { connect } from 'react-redux';
import OverviewReportPanel from './OverviewReportTab';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];

export class OverviewReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: sessionStorage.getItem('tabSelection') || navItems[0],
    };
  }

  toggleTab = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
      sessionStorage.setItem('tabSelection', tab);
    }
  };

  render() {
    const { activeTab, role } = this.state;
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
                <NavItem key={item}>
                  <NavLink
                    href="#"
                    data-testid={item}
                    active={item === activeTab}
                    onClick={() => this.toggleTab(item)}
                  >
                    {item}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeTab}>
              <OverviewReportPanel activeTab={activeTab} userRole={role} />
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
