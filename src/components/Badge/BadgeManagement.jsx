import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';
import classnames from 'classnames';
import AssignBadge from './AssignBadge';
import EditBadge from './EditBadge';
import { fetchAllBadges } from '../../actions/badgeManagement';

const BadgeManagement = (props) => {
  const [activeTab, setActiveTab] = useState('1');
  const { userId } = props.match.params;

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  useEffect(() => {
    props.fetchAllBadges(userId);
  }, []);


  return (
    <div style={{
      margin: 20,
    }}
    >
      <Nav pills>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '1' })}
            onClick={() => { toggle('1'); }}
          >
            Badge Assignment

          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '2' })}
            onClick={() => { toggle('2'); }}
          >
            Badge Development

          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <AssignBadge allBadgeData={props.allBadgeData} userId={userId} />
        </TabPane>
        <TabPane tabId="2">
          <EditBadge allBadgeData={props.allBadgeData} />
        </TabPane>
      </TabContent>
    </div>
  );
};

const mapStateToProps = state => ({ allBadgeData: state.badge.allBadgeData });

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: userId => dispatch(fetchAllBadges(userId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
