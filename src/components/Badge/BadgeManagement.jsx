import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges } from '../../actions/badgeManagement';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';

const BadgeManagement = props => {
  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const { role } = props; // Access the 'role' prop


  useEffect(() => {
    props.fetchAllBadges();
    const mode = localStorage.getItem('mode');
    document.body.className = mode;
  }, []);

  return (
    <div
      style={{
        margin: 20,
      }}
    >
    <div className="text-center">
        <EditableInfoModal
          areaName="BadgeManagement"
          areaTitle="Badge Management"
          fontSize={24}
          isPermissionPage={true}
          role={role} // Pass the 'role' prop to EditableInfoModal
        />
        </div>
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
    </div>
  );
};

const mapStateToProps = state => ({
  allBadgeData: state.badge.allBadgeData,
  role: state.userProfile.role,
});


const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
