import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges } from '../../actions/badgeManagement';

function BadgeManagement(props) {
  const { darkMode } = props;

  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const { role } = props; // Access the 'role' prop
  useEffect(() => {
    props.fetchAllBadges();
  }, []);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue' : ''}
      style={{
        padding: 20,
        minHeight: '100%',
      }}
    >
      <div className="text-center">
        <EditableInfoModal
          areaName="BadgeManagement"
          areaTitle="Badge Management"
          fontSize={24}
          isPermissionPage
          role={role} // Pass the 'role' prop to EditableInfoModal
        />
      </div>
      <Nav pills className="mb-2">
        <NavItem>
          <NavLink
            className={`mr-2 ${classnames({ active: activeTab === '1' })} ${
              darkMode && activeTab !== '1' ? 'bg-light' : ''
            }`}
            onClick={() => {
              toggle('1');
            }}
            style={
              darkMode ? { ...boxStyleDark, cursor: 'pointer' } : { ...boxStyle, cursor: 'pointer' }
            }
          >
            Badge Assignment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`${classnames({ active: activeTab === '2' })} ${
              darkMode && activeTab !== '2' ? 'bg-light' : ''
            }`}
            onClick={() => {
              toggle('2');
            }}
            style={
              darkMode ? { ...boxStyleDark, cursor: 'pointer' } : { ...boxStyle, cursor: 'pointer' }
            }
          >
            Badge Development
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <AssignBadge allBadgeData={props.allBadgeData} />
        </TabPane>
        <TabPane tabId="2" className="h-100">
          <BadgeDevelopment allBadgeData={props.allBadgeData} darkMode={darkMode} />
        </TabPane>
      </TabContent>
    </div>
  );
}

const mapStateToProps = state => ({
  allBadgeData: state.badge.allBadgeData,
  role: state.userProfile.role,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
