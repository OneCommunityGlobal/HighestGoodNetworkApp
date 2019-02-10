import React, { Component } from "react";
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col
} from "reactstrap";
import classnames from "classnames";
import moment from "moment";
import { connect } from "react-redux";
import Table from "./Tables/Tables";
import { getTimeEntryForSpecifiedPeriod, whichWeek } from "../../actions";

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "Current Week"
    };
  }

  componentDidMount() {
    this.getTimeEntries("Current Week");
  }

  toggle = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
    this.props.whichWeek(tab);
  };

  getTimeEntries = week => {
    const { state } = this.props;
    let howManyDays;
    if (week === "Current Week") {
      howManyDays = 0;
    } else if (week === "Last Week") {
      howManyDays = 7;
    } else if (week === "Week Before Last") {
      howManyDays = 14;
    }

    const startWeek = moment()
      .subtract(howManyDays, "days")
      .startOf("week")
      .format("YYYY-MM-DD");
    const endWeek = moment()
      .subtract(howManyDays, "days")
      .endOf("week")
      .format("YYYY-MM-DD");

    getTimeEntryForSpecifiedPeriod(state.userProfile._id, startWeek, endWeek);
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
                this.getTimeEntries("Current Week");
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
                this.getTimeEntries("Last Week");
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
                this.getTimeEntries("Week Before Last");
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
