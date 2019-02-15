import React, { Component } from "react";
import moment from "moment";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col
} from "reactstrap";
import { connect } from "react-redux";
import classnames from "classnames";
import Table from "./Tables/Tables";
import { getTimeEntries } from "../../utils";
import { getTimeEntryForSpecifiedPeriod, whichWeek } from "../../actions";

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "Current Week"
    };
  }

  componentDidMount() {
    getTimeEntries(getTimeEntryForSpecifiedPeriod);
  }

  toggle = tab => {
    this.props.whichWeek(tab);
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
    getTimeEntries(
      this.props.getTimeEntryForSpecifiedPeriod,
      this.props.state.userProfile._id
    );
  };

  render() {
    const { activeTab } = this.state;
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === "Current Week"
              })}
              onClick={() => {
                this.toggle("Current Week");
              }}
            >
              Current Week
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === "Last Week"
              })}
              onClick={() => {
                this.toggle("Last Week");
              }}
            >
              Last Week
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({
                active: activeTab === "Week Before Last"
              })}
              onClick={() => {
                this.toggle("Week Before Last");
              }}
            >
              Week Before Last
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="Current Week">
            <Row>
              <Col sm="12">
                <Table />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="Last Week">
            <Row>
              <Col sm="12">
                <Table />
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="Week Before Last">
            <Row>
              <Col sm="12">
                <Table />
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(
  mapStateToProps,
  { getTimeEntryForSpecifiedPeriod, whichWeek }
)(Tabs);
