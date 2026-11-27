import React, { useEffect, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  Button,
} from 'reactstrap';
import styles from './BadgeStatistics.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const getDropdownToggleLabel = count => {
  if (count === 0) {
    return 'Select Badges';
  }
  const suffix = count > 1 ? 's' : '';
  return `${count} Badge${suffix} Selected`;
};

const getTableRowBackground = (index, darkMode) => {
  const isEven = index % 2 === 0;
  if (darkMode) {
    return isEven ? '#0F172A' : '#1E293B';
  }
  return isEven ? '#F1F5F9' : '#FFFFFF';
};

const processBadgeData = allBadgeData => {
  const counts = {};
  const usersMap = {};

  allBadgeData.forEach(badge => {
    if (Array.isArray(badge.users)) {
      counts[badge._id] = new Set(badge.users.map(user => user.userId?._id)).size;
      usersMap[badge._id] = badge.users
        .map(user => ({
          userId: user.userId?._id,
          firstName: user.userId?.firstName || 'Unknown',
          lastName: user.userId?.lastName || 'Unknown',
        }))
        .slice(0, 10);
    } else {
      counts[badge._id] = 0;
      usersMap[badge._id] = [];
    }
  });

  return { counts, usersMap };
};

const getChartData = (selectedBadges, allBadgeData, badgeUserCounts, darkMode) => {
  if (!selectedBadges.length) return null;

  return {
    labels: selectedBadges.map(badgeId => {
      const badge = allBadgeData.find(item => item._id === badgeId);
      return badge?.badgeName || 'Unknown Badge';
    }),
    datasets: [
      {
        data: selectedBadges.map(badgeId => badgeUserCounts[badgeId] || 0),
        backgroundColor: CHART_COLORS,
        hoverBackgroundColor: CHART_COLORS.map(color => `${color}CC`),
        borderWidth: 2,
        borderColor: darkMode ? '#1F2937' : '#fff',
        hoverOffset: 40,
      },
    ],
  };
};

const getChartOptions = darkMode => ({
  maintainAspectRatio: false,
  responsive: true,
  layout: {
    padding: 20,
  },
  plugins: {
    datalabels: {
      color: '#ffffff',
      font: {
        weight: 'bold',
        size: 14,
      },
      display: context => context.dataset.data[context.dataIndex] > 0,
    },
    legend: {
      position: 'right',
      labels: {
        font: { size: 13, family: 'Inter, sans-serif' },
        padding: 15,
        usePointStyle: true,
        generateLabels: chart => {
          const datasets = chart.data.datasets;
          return chart.data.labels.map((label, i) => {
            const maxLength = 24;
            const truncatedLabel =
              label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;

            return {
              text: truncatedLabel,
              fontColor: darkMode ? '#ffffff' : '#374151',
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].backgroundColor[i],
              hidden: !chart.getDataVisibility(i),
              index: i,
            };
          });
        },
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
          const total = context.dataset.data.reduce((sum, item) => sum + item, 0);
          const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
          return `${label}: ${value} users (${percentage}%)`;
        },
      },
    },
  },
  animation: { duration: 1000, easing: 'easeInOutQuad' },
});

const BadgeDropdownItems = ({ allBadgeData, selectedBadges, handleBadgeSelect, darkMode }) =>
  allBadgeData.map(badge => {
    const isChecked = selectedBadges.includes(badge._id);
    const isDisabled = !isChecked && selectedBadges.length >= 10;

    return (
      <DropdownItem
        key={badge._id}
        toggle={false}
        tag="div"
        className={`pl-2 ${styles.badgeDropdownItem} ${darkMode ? styles.dark : ''}`}
      >
        <label
          className="d-flex align-items-center w-100 px-3 py-2 m-0"
          style={{
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            color: darkMode ? '#E5E7EB' : '#1F2937',
          }}
        >
          <Input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleBadgeSelect(badge._id)}
            disabled={isDisabled}
          />
          {badge.badgeName}
        </label>
      </DropdownItem>
    );
  });

const ChartSection = ({ chartData, chartOptions, chartRef, darkMode }) => {
  if (!chartData) {
    return (
      <div className="text-center text-muted" style={{ width: '100%' }}>
        Select badges to view assignment statistics
      </div>
    );
  }

  return (
    <div
      style={{
        width: '48%',
        padding: '20px',
        background: darkMode ? '#1F2937' : '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <h4
        style={{
          color: darkMode ? '#fff' : '#111827',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontSize: '1.25rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Badge Assignment Distribution
      </h4>
      <div style={{ height: '400px', position: 'relative', overflowY: 'visible' }}>
        <Pie ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const UserTableRow = ({ user, index, badgeId, darkMode }) => (
  <tr
    key={user.userId || `${badgeId}-${index}`}
    style={{
      background: getTableRowBackground(index, darkMode),
    }}
  >
    <td style={{ color: darkMode ? '#CBD5E1' : '#64748B' }}>
      {user.firstName} {user.lastName}
    </td>
  </tr>
);

const BadgeUserCard = ({ badgeId, allBadgeData, badgeUsers, darkMode }) => {
  const badge = allBadgeData.find(item => item._id === badgeId);
  const users = badgeUsers[badgeId];
  const hasUsers = users?.length > 0;

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
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
            {hasUsers ? (
              users.map((user, index) => (
                <UserTableRow
                  key={user.userId || `${badgeId}-${index}`}
                  user={user}
                  index={index}
                  badgeId={badgeId}
                  darkMode={darkMode}
                />
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
};

const AssignedUsersSection = ({ selectedBadges, allBadgeData, badgeUsers, darkMode }) => {
  if (selectedBadges.length === 0) return null;

  return (
    <div
      className="badge-user-container"
      style={{
        width: '48%',
        padding: '20px',
        background: darkMode ? '#1F2937' : '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'auto',
        maxHeight: '500px',
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
      {selectedBadges.length >= 10 && (
        <div
          style={{
            padding: '10px',
            marginTop: '10px',
            backgroundColor: darkMode ? '#450A0A' : '#FFEBEB',
            color: darkMode ? '#FCA5A5' : '#D9534F',
            textAlign: 'center',
            fontWeight: 600,
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#991B1B' : '#D9534F'}`,
          }}
        >
          You can only select up to 10 badges. Deselect one or more to continue.
        </div>
      )}
      {selectedBadges.map(badgeId => (
        <BadgeUserCard
          key={badgeId}
          badgeId={badgeId}
          allBadgeData={allBadgeData}
          badgeUsers={badgeUsers}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
};

function BadgeStatistics({ allBadgeData = [], darkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [badgeUserCounts, setBadgeUserCounts] = useState({});
  const [badgeUsers, setBadgeUsers] = useState({});
  const chartRef = useRef();

  useEffect(() => {
    const { counts, usersMap } = processBadgeData(allBadgeData);
    setBadgeUserCounts(counts);
    setBadgeUsers(usersMap);
  }, [allBadgeData]);

  const chartData = getChartData(selectedBadges, allBadgeData, badgeUserCounts, darkMode);
  const chartOptions = getChartOptions(darkMode);

  const handleBadgeSelect = badgeId => {
    setSelectedBadges(previous =>
      previous.includes(badgeId) ? previous.filter(id => id !== badgeId) : [...previous, badgeId],
    );
  };

  const clearSelectedBadges = () => setSelectedBadges([]);
  const toggleDropdown = () => setDropdownOpen(previous => !previous);

  return (
    <>
      <div className="mt-3 mb-3 d-flex align-items-center">
        <Label className="mr-2">Select Badges</Label>
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle caret>{getDropdownToggleLabel(selectedBadges.length)}</DropdownToggle>
          <DropdownMenu
            className={darkMode ? 'bg-dark border-secondary' : ''}
            style={{ maxHeight: '300px', overflowY: 'auto' }}
          >
            <BadgeDropdownItems
              allBadgeData={allBadgeData}
              selectedBadges={selectedBadges}
              handleBadgeSelect={handleBadgeSelect}
              darkMode={darkMode}
            />
          </DropdownMenu>
        </Dropdown>
        <Button
          color="primary"
          onClick={clearSelectedBadges}
          className="ml-3"
          style={{ height: '38px', padding: '0 15px' }}
        >
          Clear Selected
        </Button>
      </div>

      <div
        className="d-flex justify-content-between mt-4 mb-4"
        style={{ gap: '2rem', flexWrap: 'wrap' }}
      >
        <ChartSection
          chartData={chartData}
          chartOptions={chartOptions}
          chartRef={chartRef}
          darkMode={darkMode}
        />
        <AssignedUsersSection
          selectedBadges={selectedBadges}
          allBadgeData={allBadgeData}
          badgeUsers={badgeUsers}
          darkMode={darkMode}
        />
      </div>
    </>
  );
}

export default BadgeStatistics;
