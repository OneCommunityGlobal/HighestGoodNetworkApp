import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

const SOFTWARE_DEV_TEAM_NAME = 'software development team';

const getMemberFullName = member =>
  `${member?.firstName || ''} ${member?.lastName || ''}`.trim().toLowerCase();

const filterToSoftwareDevTeam = async users => {
  try {
    const teamsResponse = await httpService.get(ENDPOINTS.TEAM);
    const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
    const softwareDevTeam = teams.find(
      team => team.teamName?.trim().toLowerCase() === SOFTWARE_DEV_TEAM_NAME,
    );

    if (!softwareDevTeam?._id) return users;

    const membersResponse = await httpService.get(ENDPOINTS.TEAM_MEMBERS(softwareDevTeam._id));
    const members = Array.isArray(membersResponse.data) ? membersResponse.data : [];

    const memberEmails = new Set(
      members.map(member => (member.email || '').trim().toLowerCase()).filter(Boolean),
    );
    const memberNames = new Set(members.map(getMemberFullName).filter(Boolean));

    return users.filter(user => {
      const email = (user.email || '').trim().toLowerCase();
      const name = (user.name || '').trim().toLowerCase();
      return (email && memberEmails.has(email)) || (name && memberNames.has(name));
    });
  } catch {
    return users;
  }
};

const extractSkillEntries = skillData => {
  if (!skillData || typeof skillData !== 'object') return [];

  if (Array.isArray(skillData)) {
    return skillData.flatMap(skill => {
      if (typeof skill === 'string') return [{ name: skill, rating: undefined }];
      if (skill && typeof skill === 'object') {
        const name = skill.name || skill.skill || skill.label || skill.type;
        return name ? [{ name, rating: skill.rating ?? skill.score ?? undefined }] : [];
      }
      return [];
    });
  }

  return Object.values(skillData).flatMap(section => {
    if (!section || typeof section !== 'object') return [];
    if (Array.isArray(section)) {
      return section.flatMap(skill => {
        if (typeof skill === 'string') return [{ name: skill, rating: undefined }];
        if (skill && typeof skill === 'object') {
          const name = skill.name || skill.skill || skill.label || skill.type;
          return name ? [{ name, rating: skill.rating ?? skill.score ?? undefined }] : [];
        }
        return [];
      });
    }

    return Object.entries(section).map(([skillName, rating]) => ({
      name: skillName,
      rating: typeof rating === 'number' ? rating : undefined,
    }));
  });
};

const normalizeUser = user => {
  if (Array.isArray(user.topSkills) && user.topSkills.length > 0) return user;

  const rawSkills = user.skills;
  const skillEntries = extractSkillEntries(rawSkills);

  const uniqueSkills = Array.from(
    new Map(
      skillEntries.filter(entry => entry.name).map(entry => [entry.name.toLowerCase(), entry]),
    ).values(),
  );

  const sortedSkills = uniqueSkills
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .map(entry => entry.name);

  return {
    ...user,
    topSkills: sortedSkills,
    skills: sortedSkills,
  };
};

function RankedUserList({
  selectedSkills,
  selectedPreferences,
  searchQuery,
  sortBy,
  sortOrder,
  softwareDevTeamOnly,
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = {};
        const hasFilters =
          (selectedSkills && selectedSkills.length > 0) ||
          (selectedPreferences && selectedPreferences.length > 0) ||
          (searchQuery && searchQuery.trim().length > 0);

        if (selectedSkills && selectedSkills.length > 0) params.skills = selectedSkills.join(',');
        if (selectedPreferences && selectedPreferences.length > 0)
          params.preferences = selectedPreferences.join(',');
        if (searchQuery && searchQuery.trim().length > 0) params.search = searchQuery.trim();

        // Help-request flow always uses ranked questionnaire data (Software Dev skills survey).
        const endpoint =
          hasFilters || softwareDevTeamOnly
            ? ENDPOINTS.HGN_FORM_RANKED
            : `${process.env.REACT_APP_APIENDPOINT}/hgnHelp/community`;

        if (!hasFilters && !softwareDevTeamOnly && sortBy === 'name' && sortOrder) {
          params.sortOrder = sortOrder;
        }

        const response = await httpService.get(endpoint, { params });
        let users = Array.isArray(response.data) ? response.data.map(normalizeUser) : [];

        if (softwareDevTeamOnly) {
          users = await filterToSoftwareDevTeam(users);
        }

        setAllUsers(users);
      } catch (err) {
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedSkills, selectedPreferences, searchQuery, sortOrder, softwareDevTeamOnly]);

  // Client-side filter by searchQuery on top of API results
  const filteredUsers = searchQuery
    ? allUsers.filter(user => {
        const name = (user.name || '').toLowerCase();
        const skills = (user.topSkills || []).join(' ').toLowerCase();
        return (
          name.includes(searchQuery.toLowerCase()) || skills.includes(searchQuery.toLowerCase())
        );
      })
    : allUsers;

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = typeof a.score === 'number' ? a.score : -Infinity;
      const scoreB = typeof b.score === 'number' ? b.score : -Infinity;
      if (scoreA < scoreB) return sortOrder === 'desc' ? 1 : -1;
      if (scoreA > scoreB) return sortOrder === 'desc' ? -1 : 1;
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }

    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    if (nameA < nameB) return sortOrder === 'desc' ? 1 : -1;
    if (nameA > nameB) return sortOrder === 'desc' ? -1 : 1;
    return 0;
  });

  if (loading) return <p className={`${styles.message}`}>Loading ranked users...</p>;
  if (!sortedUsers.length) return <p className={`${styles.message}`}>No users found.</p>;

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {sortedUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
            <UserCard user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}

RankedUserList.propTypes = {
  selectedSkills: PropTypes.arrayOf(PropTypes.string),
  selectedPreferences: PropTypes.arrayOf(PropTypes.string),
  searchQuery: PropTypes.string,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  softwareDevTeamOnly: PropTypes.bool,
};

RankedUserList.defaultProps = {
  selectedSkills: [],
  selectedPreferences: [],
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  softwareDevTeamOnly: false,
};

export default RankedUserList;
