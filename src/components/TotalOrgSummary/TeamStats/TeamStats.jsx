import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';

import TeamStatsBarChart from './TeamStatsBarChart';
import styles from './TeamStats.module.css';

const activeMembersMinimumDropDownOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];

function TeamStats({ isLoading, usersInTeamStats, endDate, darkMode }) {
  const [activeMembersMinimum, setActiveMembersMinimum] = useState(
    activeMembersMinimumDropDownOptions[0],
  );
  const [teamsWithActiveMembers, setTeamsWithActiveMembers] = useState(null);
  const [teamsStatsFetchingError, setTeamsStatsFetchingError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const isDarkMode =
    typeof darkMode === 'boolean' ? darkMode : document.body.classList.contains('dark-mode');

  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const url = ENDPOINTS.VOLUNTEER_ROLES_TEAM_STATS(endDate, activeMembersMinimum);

        const response = await axios.get(url);

        setTeamsWithActiveMembers(response?.data?.teamsWithActiveMembers ?? null);
      } catch (error) {
        setTeamsStatsFetchingError(error);
      }
    };

    if (endDate) {
      fetchTeamsData();
    }
  }, [activeMembersMinimum, endDate]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  if (teamsStatsFetchingError) {
    return <div>Cannot be fetched as of now.</div>;
  }

  // Prevent dashboard crash when API returns null/undefined
  if (!usersInTeamStats) {
    return <div className="text-center p-3">No team statistics available for this period.</div>;
  }

  const { inTeam = {}, notInTeam = {} } = usersInTeamStats || {};

  const data = [
    {
      name: 'Not In Team',
      value: notInTeam?.count ?? 0,
      change: +(notInTeam?.comparisonPercentage ?? 0),
      color: '#36A2EB',
    },
    {
      name: 'In Team',
      value: inTeam?.count ?? 0,
      change: +(inTeam?.comparisonPercentage ?? 0),
      color: '#1B6DDF',
    },
  ];

  const buttonStyle = {
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#111827',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.20)' : '1px solid #c7c7c7',
  };

  const menuStyle = {
    backgroundColor: isDarkMode ? '#111827' : '#ffffff',
    color: isDarkMode ? '#f8fafc' : '#111827',
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.20)' : '1px solid #c7c7c7',
  };

  const handleOptionSelect = value => {
    setActiveMembersMinimum(value);
    setIsDropdownOpen(false);
  };

  return (
    <div>
      <TeamStatsBarChart data={data} yAxisLabel="name" darkMode={isDarkMode} />

      {teamsWithActiveMembers && (
        <div className={styles.teamStatsActiveMembers}>
          <div className={styles.teamStatsBarChartSummary}>
            <div className={styles.teamStatsSummaryText}>
              {`${teamsWithActiveMembers.count} ${
                teamsWithActiveMembers.count === 1 ? 'team' : 'teams'
              } with`}
              <div ref={dropdownRef} className={styles.customDropdown}>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  style={buttonStyle}
                  onClick={() => setIsDropdownOpen(prev => !prev)}
                >
                  <span>{activeMembersMinimum}</span>

                  <span
                    className={`${styles.dropdownArrow} ${
                      isDropdownOpen ? styles.dropdownArrowOpen : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <ul className={styles.dropdownMenu} style={menuStyle}>
                    {activeMembersMinimumDropDownOptions.map(option => (
                      <li key={option}>
                        <button
                          type="button"
                          className={styles.dropdownItem}
                          style={{
                            color: isDarkMode ? '#f8fafc' : '#111827',
                            backgroundColor:
                              option === activeMembersMinimum
                                ? isDarkMode
                                  ? 'rgba(255, 255, 255, 0.10)'
                                  : '#f3f4f6'
                                : 'transparent',
                            fontWeight: option === activeMembersMinimum ? 700 : 400,
                          }}
                          onClick={() => handleOptionSelect(option)}
                        >
                          {option}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              + active members
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamStats;
