import { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import AssignBadge from './AssignBadge';
import BadgeDevelopment from './BadgeDevelopment';
import { fetchAllBadges, setActiveTab } from '../../actions/badgeManagement';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Input, Label } from 'reactstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Modern color palette
const CHART_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
];

function BadgeManagement(props) {
  const { darkMode, activeTab, setActiveTab, role, allBadgeData, loading } = props;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [badgeUserCounts, setBadgeUserCounts] = useState({});
  const [chartData, setChartData] = useState(null);
  const [badgeUsers, setBadgeUsers] = useState({});
  const chartRef = useRef();

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#fff' : '#374151',
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#fff',
        titleColor: darkMode ? '#fff' : '#111827',
        bodyColor: darkMode ? '#E5E7EB' : '#374151',
        borderColor: darkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} users (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuad',
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    props.fetchAllBadges();
  }, [props.fetchAllBadges]);

  useEffect(() => {
    if (allBadgeData?.length) {
      const counts = {};
      const usersMap = {};
      allBadgeData.forEach(badge => {
        if (Array.isArray(badge.users)) {
          counts[badge._id] = new Set(badge.users.map(user => user.userId?._id)).size;
          usersMap[badge._id] = badge.users
            .map(user => ({
              userId: user.userId?._id,
              userName: user.userId?.username || 'Unknown User',
              firstName: user.userId?.firstName || 'Unknown',
              lastName: user.userId?.lastName || 'Unknown',
              profileName: user.userId?.profileName || 'No Profile Name',
            }))
            .slice(0, 10);
        } else {
          counts[badge._id] = 0;
          usersMap[badge._id] = [];
        }
      });
      setBadgeUserCounts(counts);
      setBadgeUsers(usersMap);
    }
  }, [allBadgeData]);

  useEffect(() => {
    if (selectedBadges.length > 0) {
      const labels = selectedBadges.map(badgeId => {
        const badge = allBadgeData.find(b => b._id === badgeId);
        return badge?.badgeName || 'Unknown Badge';
      });
      const data = selectedBadges.map(badgeId => badgeUserCounts[badgeId] || 0);

      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor: CHART_COLORS,
            hoverBackgroundColor: CHART_COLORS.map(color => `${color}CC`),
            borderWidth: 2,
            borderColor: darkMode ? '#1F2937' : '#fff',
            hoverOffset: 20,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }, [selectedBadges, badgeUserCounts, allBadgeData, darkMode]);

  const handleBadgeSelect = badgeId => {
    setSelectedBadges(prevSelected =>
      prevSelected.includes(badgeId)
        ? prevSelected.filter(id => id !== badgeId)
        : [...prevSelected, badgeId],
    );
  };

  return (
    <div
      className={darkMode ? 'bg-oxford-blue' : ''}
      style={{ padding: '5px 20px', minHeight: '100%' }}
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
            className={`mr-2 ${classnames({ active: activeTab === '1' })}`}
            onClick={() => setActiveTab('1')}
          >
            Badge Assignment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`${classnames({ active: activeTab === '2' })}`}
            onClick={() => setActiveTab('2')}
          >
            Badge Development
          </NavLink>
        </NavItem>
      </Nav>

      <div className="mt-4 mb-3">
        <Label>Select Badges</Label>
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
          <DropdownToggle caret>
            {selectedBadges.length > 0
              ? `${selectedBadges.length} Badge${selectedBadges.length > 1 ? 's' : ''} Selected`
              : 'Select Badges'}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {allBadgeData?.map(badge => (
              <DropdownItem key={badge._id} toggle={false}>
                <Input
                  type="checkbox"
                  checked={selectedBadges.includes(badge._id)}
                  onChange={() => handleBadgeSelect(badge._id)}
                  className="mr-2"
                />
                {badge.badgeName}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="d-flex justify-content-between mt-4" style={{ gap: '2rem' }}>
        {chartData ? (
          <div
            style={{
              width: '48%',
              padding: '20px',
              background: darkMode ? '#1F2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
            }}
          >
            <h4
              style={{
                color: darkMode ? '#fff' : '#111827',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Badge Assignment Distribution
            </h4>
            <div style={{ height: '400px', position: 'relative' }}>
              <Pie ref={chartRef} data={chartData} options={chartOptions} />
            </div>
          </div>
        ) : (
          <div className="text-center text-muted" style={{ width: '100%' }}>
            Select badges to view assignment statistics
          </div>
        )}

        {selectedBadges.length > 0 && (
          <div
            className="badge-user-container"
            style={{
              width: '48%',
              padding: '20px',
              background: darkMode ? '#1F2937' : '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
            }}
          >
            <h4
              style={{
                color: darkMode ? '#fff' : '#111827',
                marginBottom: '1.5rem',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              Assigned Users
            </h4>
            {selectedBadges.map(badgeId => {
              const badge = allBadgeData.find(b => b._id === badgeId);
              return (
                <div
                  key={badgeId}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '8px',
                    background: darkMode ? '#0F172A' : '#F8FAFC',
                  }}
                >
                  <h5
                    style={{
                      color: darkMode ? '#fff' : '#1E293B',
                      marginBottom: '1rem',
                      fontSize: '1.1rem',
                    }}
                  >
                    {badge?.badgeName || 'Unknown Badge'}
                  </h5>
                  <div className="table-responsive">
                    <table className={`table ${darkMode ? 'table-dark' : ''}`}>
                      <thead>
                        <tr
                          style={{
                            background: darkMode ? '#334155' : '#E2E8F0',
                            color: darkMode ? '#fff' : '#1E293B',
                          }}
                        >
                          <th style={{ borderRadius: '6px 0 0 0' }}>User Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {badgeUsers[badgeId]?.length > 0 ? (
                          badgeUsers[badgeId].map((user, index) => (
                            <tr
                              key={user.userId}
                              style={{
                                background:
                                  index % 2 === 0
                                    ? darkMode
                                      ? '#0F172A'
                                      : '#F1F5F9'
                                    : darkMode
                                    ? '#1E293B'
                                    : '#FFFFFF',
                              }}
                            >
                              <td style={{ color: darkMode ? '#CBD5E1' : '#64748B' }}>
                                {user.firstName} {user.lastName}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="1"
                              className="text-center"
                              style={{ color: darkMode ? '#94A3B8' : '#64748B' }}
                            >
                              No users assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <AssignBadge allBadgeData={props.allBadgeData} />
        </TabPane>
        <TabPane tabId="2">
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
  loading: state.badge.loading,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  setActiveTab: tab => dispatch(setActiveTab(tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeManagement);
