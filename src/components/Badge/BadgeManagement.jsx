import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { boxStyle, boxStyleDark } from '~/styles';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges, setActiveTab } from '../../actions/badgeManagement';
import { permissions as permissionKeys } from '../../utils/constants';
import hasPermission from '../../utils/permissions';

function BadgeManagement(props) {
  const { darkMode, activeTab, setActiveTab, role } = props;
  const [hoveredTab, setHoveredTab] = useState(null);
  const canAssignBadges = props.hasPermission(permissionKeys.assignBadges);

  useEffect(() => {
    props.fetchAllBadges();
  }, [props.fetchAllBadges]);

  const handleTabChange = tabId => {
    setActiveTab(tabId);
  };

  const getTabStyle = (isActive, isHovered) => {
    if (darkMode && !isActive) {
      return {
        ...boxStyleDark,
        cursor: 'pointer',
        backgroundColor: isHovered ? '#4a6072' : '#3a506b',
        color: '#ffffff',
      };
    }
    if (darkMode) {
      return { ...boxStyleDark, cursor: 'pointer' };
    }
    return { ...boxStyle, cursor: 'pointer' };
  };

  useEffect(() => {
    if (!activeTab) {
      setActiveTab(canAssignBadges ? '1' : '2');
      return;
    }
    if (!canAssignBadges && activeTab === '1') {
      setActiveTab('2');
    }
  }, [activeTab, canAssignBadges, setActiveTab]);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue' : ''}
      style={{
        padding: '5px 20px',
        minHeight: '100%',
      }}
    >
      <div className="d-flex justify-content-start align-items-center">
        <h2 className={`${darkMode ? 'text-light' : 'text-dark'} mr-2`}>Badge Management</h2>
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
        {canAssignBadges && (
          <NavItem>
            <NavLink
              className={`mr-2 ${classnames({ active: activeTab === '1' })}`}
              onClick={() => handleTabChange('1')}
              onMouseEnter={() => setHoveredTab('1')}
              onMouseLeave={() => setHoveredTab(null)}
              style={getTabStyle(activeTab === '1', hoveredTab === '1')}
            >
              Badge Assignment
            </NavLink>
          </NavItem>
        )}
        <NavItem>
          <NavLink
            className={classnames({ active: activeTab === '2' })}
            onClick={() => handleTabChange('2')}
            onMouseEnter={() => setHoveredTab('2')}
            onMouseLeave={() => setHoveredTab(null)}
            style={getTabStyle(activeTab === '2', hoveredTab === '2')}
          >
            Badge Development
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        {canAssignBadges && (
          <TabPane tabId="1">
            <AssignBadge allBadgeData={props.allBadgeData} />
          </TabPane>
        )}
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
  activeTab: state.badge.activeTab,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  setActiveTab: tab => dispatch(setActiveTab(tab)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
