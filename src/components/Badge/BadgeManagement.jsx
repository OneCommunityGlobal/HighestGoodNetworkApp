import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges } from '../../actions/badgeManagement';
import { boxStyle } from 'styles';
import hasPermission from '../../utils/permissions';

const BadgeManagement = props => {
  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };
const onlyCreateBadgePermission = props.hasPermission('seeBadgeManagementTab');
  useEffect(() => {
    props.fetchAllBadges();
  }, []);

  return (
    <>
    {
      !onlyCreateBadgePermission ? (<div
        style={{
          margin: 20,
        }}
      >
        <Nav pills>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' })}
              onClick={() => {
                toggle('1');
              }}
              style={boxStyle}
            >
              Badge Assignment
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '2' })}
              onClick={() => {
                toggle('2');
              }}
              style={boxStyle}
            >
              Badge Development
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <AssignBadge allBadgeData={props.allBadgeData} />
          </TabPane>
          <TabPane tabId="2">
            <BadgeDevelopment allBadgeData={props.allBadgeData} />
          </TabPane>
        </TabContent>
      </div>) : (
        <div
        style={{
          margin: 20,
        }}
      >
        <Nav pills>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === '1' })}
              onClick={() => {
                toggle('2');
              }}
              style={boxStyle}
            >
              Badge Development
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab='2'>
          <TabPane tabId="1">
            <AssignBadge allBadgeData={props.allBadgeData} />
          </TabPane>
          <TabPane tabId="2">
            <BadgeDevelopment allBadgeData={props.allBadgeData} />
          </TabPane>
        </TabContent>
      </div>
      )
    }
    </>
  );
};

const mapStateToProps = state => ({
   allBadgeData: state.badge.allBadgeData,
})

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  hasPermission:(action)=> dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
