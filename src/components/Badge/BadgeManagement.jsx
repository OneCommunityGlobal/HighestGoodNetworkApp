import { useEffect } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges, setActiveTab } from '../../actions/badgeManagement';

function BadgeManagement(props) {
  const { darkMode, activeTab, setActiveTab, role } = props;

  useEffect(() => {
    props.fetchAllBadges();
  }, [props.fetchAllBadges]);

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    if (!activeTab) {
      setActiveTab('1');
    }
  }, [activeTab, setActiveTab]);
  return (
    <div
      className={darkMode ? 'bg-oxford-blue' : ''}
      style={{
        padding: '5px 20px',
        minHeight: '100%',
      }}
    >
      <div className="d-flex justify-content-start align-items-center">
        <h2 className="mr-2">Badge Management</h2>
        <EditableInfoModal
          areaName="BadgeManagement"
          areaTitle="Badge Management"
          fontSize={24}
          isPermissionPage
          role={role}
          darkMode={darkMode}
        />
      </div>
      <Nav pills className="mb-2">
        <NavItem>
          <NavLink
            className={`mr-2 ${classnames({ active: activeTab === '1' })} ${
              darkMode && activeTab !== '1' ? 'bg-light' : ''
            }`}
            onClick={() => handleTabChange('1')}
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
            onClick={() => handleTabChange('2')}
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
  permissions: state.userProfile.permissions,
  activeTab: state.badge.activeTab,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  setActiveTab: tab => dispatch(setActiveTab(tab)),
});

function checkIfBadgeAssignmentIsAllowed(permissions, role) {
  if (role === 'Administrator' || role === 'Owner') return true;
  return permissions?.frontPermissions.includes('assignBadges');
}

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
