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

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ['#4F46E5', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

function BadgeStatistics({ allBadgeData = [], darkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [badgeUserCounts, setBadgeUserCounts] = useState({});
  const [badgeUsers, setBadgeUsers] = useState({});
  const chartRef = useRef();

  useEffect(() => {
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

    setBadgeUserCounts(counts);
    setBadgeUsers(usersMap);
  }, [allBadgeData]);

  const chartData = selectedBadges.length
    ? {
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
      }
    : null;

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#fff' : '#374151',
          font: { size: 14, family: 'Inter, sans-serif' },
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
            const total = context.dataset.data.reduce((sum, item) => sum + item, 0);
            const percentage = total ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} users (${percentage}%)`;
          },
        },
      },
    },
    animation: { duration: 1000, easing: 'easeInOutQuad' },
  };

  const handleBadgeSelect = badgeId => {
    setSelectedBadges(previous =>
      previous.includes(badgeId) ? previous.filter(id => id !== badgeId) : [...previous, badgeId],
    );
  };

  const clearSelectedBadges = () => setSelectedBadges([]);

  return (
    <>
      <div className="mt-3 mb-3 d-flex align-items-center">
        <Label className="mr-2">Select Badges</Label>
        <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(previous => !previous)}>
          <DropdownToggle caret disabled={selectedBadges.length >= 10}>
            {selectedBadges.length > 0
              ? `${selectedBadges.length} Badge${selectedBadges.length > 1 ? 's' : ''} Selected`
              : 'Select Badges'}
          </DropdownToggle>
          <DropdownMenu style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {allBadgeData.map(badge => {
              const isChecked = selectedBadges.includes(badge._id);
              const isDisabled = !isChecked && selectedBadges.length >= 10;

              return (
                <DropdownItem key={badge._id} toggle={false} tag="div" className="p-">
                  <label
                    className="d-flex align-items-center w-100 px-3 py-2 m-0"
                    style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    <Input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBadgeSelect(badge._id)}
                      className="mr-2 my-0"
                      disabled={isDisabled}
                    />
                    {badge.badgeName}
                  </label>
                </DropdownItem>
              );
            })}
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
        {chartData ? (
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
            <div style={{ height: '400px', position: 'relative', overflowY: 'auto' }}>
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
                  backgroundColor: '#FFEBEB',
                  color: '#D9534F',
                  textAlign: 'center',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: '1px solid #D9534F',
                }}
              >
                You can only select up to 10 badges. Deselect one or more to continue.
              </div>
            )}
            {selectedBadges.map(badgeId => {
              const badge = allBadgeData.find(item => item._id === badgeId);
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
                        {badgeUsers[badgeId]?.length > 0 ? (
                          badgeUsers[badgeId].map((user, index) => (
                            <tr
                              key={user.userId || `${badgeId}-${index}`}
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
    </>
  );
}

export default BadgeStatistics;
