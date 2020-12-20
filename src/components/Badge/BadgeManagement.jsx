import React, { useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import AssignBadge from './AssignBadge';
import EditBadge from './EditBadge';

const BadgeManagement = () => {
  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }
  return (
    <div style={{
      margin: 20
    }}>
      <Nav pills>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '1' })}
            onClick={() => { toggle('1'); }}>Badge Assignment</NavLink>
        </NavItem>
        <NavItem>
          <NavLink className={classnames({ active: activeTab === '2' })}
            onClick={() => { toggle('2'); }} >Badge Development</NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <AssignBadge />
        </TabPane>
        <TabPane tabId="2">
          <EditBadge />
        </TabPane>
      </TabContent>
    </div >
  );
}

export default BadgeManagement;
