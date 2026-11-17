import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import { formatSkillName } from './FilerData.js';
import styles from './style/RankedUserList.module.css';
import UserCard from './UserCard';

const TOP_SKILLS_PER_SECTION = 4;
const PAGE_SIZE = 20;
const SOFTWARE_DEV_TEAM_NAME = 'software development team';
const SOFTWARE_DEV_TEAM_ALIASES = new Set([
  SOFTWARE_DEV_TEAM_NAME,
  'hgn software development team',
]);

const getMemberFullName = member =>
  `${member?.firstName || ''} ${member?.lastName || ''}`.trim().toLowerCase();

/**
 * Restrict ranked users to Software Development Team members.
 * Fail closed: missing team or lookup errors return [] (never the full ranked list).
 * Prefer email; only fall back to name when the ranked user has no email.
 */
const filterToSoftwareDevTeam = async users => {
  try {
    const teamsResponse = await httpService.get(ENDPOINTS.TEAM);
    const teams = Array.isArray(teamsResponse.data) ? teamsResponse.data : [];
    const softwareDevTeam = teams.find(team =>
      SOFTWARE_DEV_TEAM_ALIASES.has(team.teamName?.trim().toLowerCase()),
    );

    if (!softwareDevTeam?._id) {
      // Team not found — do not leak non-team ranked users.
      return [];
    }

    const membersResponse = await httpService.get(ENDPOINTS.TEAM_MEMBERS(softwareDevTeam._id));
    const members = Array.isArray(membersResponse.data) ? membersResponse.data : [];

    const memberEmails = new Set(
      members.map(member => (member.email || '').trim().toLowerCase()).filter(Boolean),
    );
    const memberNames = new Set(members.map(getMemberFullName).filter(Boolean));
    const memberIds = new Set(
      members.map(member => (member._id || member.userId || '').toString()).filter(Boolean),
    );

    return users.filter(user => {
      const userId = (user.userId || user.user_id || '').toString();
      if (userId && memberIds.has(userId)) return true;

      const email = (user.email || '').trim().toLowerCase();
      if (email) {
        // Email is authoritative: never allow a name-only match to override a mismatch.
        return memberEmails.has(email);
      }

      const name = (user.name || '').trim().toLowerCase();
      return Boolean(name && memberNames.has(name));
    });
  } catch {
    // Team membership lookup failed — show empty list rather than all ranked users.
    return [];
  }
};

const extractSkillEntries = skillData => {
  if (!skillData || typeof skillData !== 'object') return [];

  if (Array.isArray(skillData)) {
    return skillData.flatMap(skill => {
      if (typeof skill === 'string')
        return [{ name: skill, rating: undefined, section: 'default' }];
      if (skill && typeof skill === 'object') {
        const name = skill.name || skill.skill || skill.label || skill.type;
        return name
          ? [{ name, rating: skill.rating ?? skill.score ?? undefined, section: 'default' }]
          : [];
      }
      return [];
    });
  }

  return Object.entries(skillData).flatMap(([sectionName, section]) => {
    if (!section || typeof section !== 'object') return [];

    if (Array.isArray(section)) {
      return section.flatMap(skill => {
        if (typeof skill === 'string')
          return [{ name: skill, rating: undefined, section: sectionName }];
        if (skill && typeof skill === 'object') {
          const name = skill.name || skill.skill || skill.label || skill.type;
          return name
            ? [{ name, rating: skill.rating ?? skill.score ?? undefined, section: sectionName }]
            : [];
        }
        return [];
      });
    }

    return Object.entries(section).map(([skillName, rating]) => ({
      name: skillName,
      rating: typeof rating === 'number' ? rating : undefined,
      section: sectionName,
    }));
  });
};

const normalizeUser = user => {
  const rawSkills = user.skills;
  const skillEntries = Array.isArray(user.topSkills)
    ? user.topSkills.map(name => ({ name, rating: undefined, section: 'default' }))
    : extractSkillEntries(rawSkills);

  const uniqueSkills = Array.from(
    new Map(
      skillEntries.filter(entry => entry.name).map(entry => [entry.name.toLowerCase(), entry]),
    ).values(),
  );

  // Filtering and search use every rated skill, matching the backend's /community rule;
  // only the card's display list is trimmed to the top skills of each section.
  const skillsBySection = uniqueSkills.reduce((acc, entry) => {
    const section = entry.section || 'default';
    if (!acc[section]) acc[section] = [];
    acc[section].push(entry);
    return acc;
  }, {});

  const topSkillNames = Object.values(skillsBySection).flatMap(entries =>
    entries
      .slice()
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, TOP_SKILLS_PER_SECTION)
      .map(entry => entry.name),
  );

  return {
    ...user,
    allSkills: uniqueSkills.map(entry => entry.name),
    topSkills: topSkillNames,
  };
};

// Put the skills the viewer filtered by at the front so they are never pushed out of view.
const withMatchedSkillsFirst = (user, selectedSkills) => {
  const matched = selectedSkills.filter(skill =>
    (user.allSkills || []).some(own => own.toLowerCase() === skill.toLowerCase()),
  );
  const names = Array.from(new Set([...matched, ...(user.topSkills || [])]));
  return { ...user, displaySkills: names.map(formatSkillName) };
};

function RankedUserList({
  selectedSkills = [],
  selectedPreferences = [],
  searchQuery = '',
  sortOrder = 'asc',
  currentPage,
  setCurrentPage,
  softwareDevTeamOnly = false,
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Load every community member once, then filter/search/sort on the client so all
  // skills in the filter list work regardless of the backend's skill-key handling.
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Help-request flow always uses ranked questionnaire data (Software Dev skills survey).
        const endpoint = softwareDevTeamOnly
          ? ENDPOINTS.HGN_FORM_RANKED
          : ENDPOINTS.HGN_COMMUNITY_MEMBERS;

        const response = await httpService.get(endpoint);
        let users = Array.isArray(response.data) ? response.data.map(normalizeUser) : [];

        if (softwareDevTeamOnly) {
          users = await filterToSoftwareDevTeam(users);
        }

        setAllUsers(users);
      } catch (err) {
        const detail = err.response?.status ? ` (${err.response.status})` : '';
        setError(`Unable to load community members. Please try again later.${detail}`);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [softwareDevTeamOnly]);

  const query = searchQuery.trim().toLowerCase();

  const filteredUsers = allUsers.filter(user => {
    const userSkills = (user.allSkills || []).map(skill => skill.toLowerCase());

    if (selectedSkills && selectedSkills.length > 0) {
      const matchesSkills = selectedSkills.every(skill => userSkills.includes(skill.toLowerCase()));
      if (!matchesSkills) return false;
    }

    if (selectedPreferences && selectedPreferences.length > 0) {
      const userPreferences = new Set((user.preferences || []).map(pref => pref.toLowerCase()));
      const matchesPreferences = selectedPreferences.every(pref =>
        userPreferences.has(pref.toLowerCase()),
      );
      if (!matchesPreferences) return false;
    }

    if (query) {
      const name = (user.name || '').toLowerCase();
      const displaySkills = (user.allSkills || []).map(skill =>
        formatSkillName(skill).toLowerCase(),
      );
      // Match against both the raw skill keys and their human-readable labels,
      // since the keys (e.g. "UnitTest") don't contain the words a member
      // would actually type (e.g. "testing").
      const matchesQuery =
        name.includes(query) ||
        userSkills.some(skill => skill.includes(query)) ||
        displaySkills.some(skill => skill.includes(query));
      if (!matchesQuery) return false;
    }

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();

    if (nameA < nameB) return sortOrder === 'desc' ? 1 : -1;
    if (nameA > nameB) return sortOrder === 'desc' ? -1 : 1;

    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrevious = () => setCurrentPage(page => Math.max(page - 1, 1));
  const handleNext = () => setCurrentPage(page => Math.min(page + 1, totalPages));

  if (loading) return <p className={styles.message}>Loading community members...</p>;
  if (error) return <p className={styles.message}>{error}</p>;
  if (!sortedUsers.length) {
    const emptyMessage = softwareDevTeamOnly
      ? 'No Software Development Team members match this skill yet'
      : 'No members found.';
    return <p className={styles.message}>{emptyMessage}</p>;
  }

  return (
    <div className={darkMode ? `${styles.darkMode}` : ''}>
      <div className={`${styles.container}`}>
        {paginatedUsers.map(user => (
          <div key={user._id} className={`${styles.userWrapper}`}>
            <UserCard user={withMatchedSkillsFirst(user, selectedSkills)} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination} aria-label="Community member pagination">
          <button
            type="button"
            className={styles.paginationButton}
            onClick={handlePrevious}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </button>

          <span className={styles.paginationInfo}>
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            type="button"
            className={styles.paginationButton}
            onClick={handleNext}
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

RankedUserList.propTypes = {
  selectedSkills: PropTypes.arrayOf(PropTypes.string),
  selectedPreferences: PropTypes.arrayOf(PropTypes.string),
  searchQuery: PropTypes.string,
  sortOrder: PropTypes.string,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  softwareDevTeamOnly: PropTypes.bool,
};

export default RankedUserList;
