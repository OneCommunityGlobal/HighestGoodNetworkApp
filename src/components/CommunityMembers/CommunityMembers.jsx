import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import MemberCard from './MemberCard';
import { mockMembers } from './mockData';
import './CommunityMembers.css';

/**
 * CommunityMembers component displays a list of community members
 * with their scores and skills, along with filtering and sorting options.
 */
const CommunityMembers = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillsFilter, setShowSkillsFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState('alpha'); // 'score' or 'alpha'

  // Hardcoded skills for the filter
  const availableSkills = {
    frontend: [
      'HTML',
      'CSS',
      'Bootstrap',
      'React',
      'Redux',
      'WebSocketCom',
      'ResponsiveUI',
      'UnitTest',
      'Documentation',
      'UIUXTools',
    ],
    backend: [
      'Database',
      'MongoDB',
      'MongoDB_Advanced',
      'TestDrivenDev',
      'Deployment',
      'VersionControl',
      'CodeReview',
      'EnvironmentSetup',
      'AdvancedCoding',
      'AgileDevelopment',
    ],
    general: [
      'combined_frontend_backend',
      'mern_skills',
      'leadership_skills',
      'leadership_experience',
    ],
  };

  const membersPerPage = 6;

  // Apply dark mode to body and parent containers
  useEffect(() => {
    // Find parent container and apply dark mode class if needed
    const applyDarkModeToParent = element => {
      while (element && element.parentElement) {
        element = element.parentElement;
        if (darkMode) {
          element.classList.add('dark-mode');
        } else {
          element.classList.remove('dark-mode');
        }
      }
    };

    // Get the component's element
    const communityMembersElement = document.querySelector('.community-members');
    if (communityMembersElement) {
      applyDarkModeToParent(communityMembersElement);
    }

    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('dark-mode');

      // Clean up parent elements
      if (communityMembersElement) {
        let element = communityMembersElement;
        while (element && element.parentElement) {
          element = element.parentElement;
          element.classList.remove('dark-mode');
        }
      }
    };
  }, [darkMode]);

  // Helper function to calculate score based on selected skills or overall score
  const calculateScore = member => {
    if (selectedSkills.length === 0) {
      // If no skills selected, calculate overall score as before
      const frontendScores = Object.entries(member.skillInfo.frontend)
        .filter(([key]) => key !== 'overall')
        .map(([_, value]) => parseInt(value, 10));

      const backendScores = Object.entries(member.skillInfo.backend)
        .filter(([key]) => key !== 'Overall')
        .map(([_, value]) => parseInt(value, 10));

      const generalScores = [
        parseInt(member.skillInfo.general.combined_frontend_backend, 10),
        parseInt(member.skillInfo.general.mern_skills, 10),
        parseInt(member.skillInfo.general.leadership_skills, 10),
        parseInt(member.skillInfo.general.leadership_experience, 10),
      ];

      // Calculate average score with decimal precision (keeping original 1-5 scale)
      const allScores = [...frontendScores, ...backendScores, ...generalScores];
      const sum = allScores.reduce((acc, score) => acc + score, 0);
      return parseFloat((sum / allScores.length).toFixed(1)); // Keep one decimal place
    } else {
      // Calculate score based only on selected skills
      const selectedScores = [];

      for (const skill of selectedSkills) {
        // Check frontend skills
        if (skill in member.skillInfo.frontend && skill !== 'overall') {
          selectedScores.push(parseInt(member.skillInfo.frontend[skill], 10));
        }
        // Check backend skills
        else if (skill in member.skillInfo.backend && skill !== 'Overall') {
          selectedScores.push(parseInt(member.skillInfo.backend[skill], 10));
        }
        // Check general skills
        else if (
          [
            'combined_frontend_backend',
            'mern_skills',
            'leadership_skills',
            'leadership_experience',
          ].includes(skill)
        ) {
          selectedScores.push(parseInt(member.skillInfo.general[skill], 10));
        }
      }

      if (selectedScores.length === 0) {
        return 0; // No matches found for the selected skills
      }

      // Calculate average of selected skills with decimal precision
      const sum = selectedScores.reduce((acc, score) => acc + score, 0);
      return parseFloat((sum / selectedScores.length).toFixed(1)); // Keep one decimal place
    }
  };

  // Extract top skills from a member
  const getTopSkills = member => {
    // Get skills with highest scores
    const frontendSkills = Object.entries(member.skillInfo.frontend)
      .filter(([key, value]) => key !== 'overall' && parseInt(value, 10) >= 4)
      .map(([key]) => key);

    const backendSkills = Object.entries(member.skillInfo.backend)
      .filter(([key, value]) => key !== 'Overall' && parseInt(value, 10) >= 4)
      .map(([key]) => key);

    // Add other skills if mentioned
    const otherSkills = member.skillInfo.followup.other_skills
      ? member.skillInfo.followup.other_skills.split(',').map(s => s.trim())
      : [];

    // Combine and take top 4 skills
    return [...frontendSkills, ...backendSkills, ...otherSkills].slice(0, 4);
  };

  // Sort members by score in descending order or alphabetically
  useEffect(() => {
    const membersWithScores = mockMembers.map(member => ({
      ...member,
      calculatedScore: calculateScore(member),
      topSkills: getTopSkills(member),
    }));

    let sortedMembers;
    if (sortOrder === 'alpha') {
      // Sort alphabetically by name when alpha sort is chosen, regardless of filters
      sortedMembers = membersWithScores.sort((a, b) =>
        a.name.displayName.localeCompare(b.name.displayName),
      );
    } else {
      // Sort by score when score sort is chosen
      sortedMembers = membersWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);
    }

    setMembers(sortedMembers);
  }, [selectedSkills, sortOrder, searchTerm]); // Re-run when selected skills, sort order or search changes

  // Toggle skill selection
  const toggleSkill = skill => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'score' ? 'alpha' : 'score');
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // Helper function to find the exact score for a specific skill - now also handles partial matches
  const getSkillScore = (member, searchTerm) => {
    const searchTermLower = searchTerm.toLowerCase();

    // Find potential matching skill from our available skills lists
    const allSkills = [
      ...availableSkills.frontend,
      ...availableSkills.backend,
      ...availableSkills.general,
    ];

    // Find exact or best partial match
    const matchingSkill =
      allSkills.find(skill => skill.toLowerCase() === searchTermLower) ||
      allSkills.find(skill => skill.toLowerCase().startsWith(searchTermLower));

    if (!matchingSkill) return null;

    const matchingSkillLower = matchingSkill.toLowerCase();

    // Check frontend skills
    const frontendKey = Object.keys(member.skillInfo.frontend).find(
      key => key.toLowerCase() === matchingSkillLower,
    );
    if (frontendKey && frontendKey !== 'overall') {
      return parseInt(member.skillInfo.frontend[frontendKey], 10);
    }

    // Check backend skills
    const backendKey = Object.keys(member.skillInfo.backend).find(
      key => key.toLowerCase() === matchingSkillLower,
    );
    if (backendKey && backendKey !== 'Overall') {
      return parseInt(member.skillInfo.backend[backendKey], 10);
    }

    // Check general skills
    if (
      [
        'combined_frontend_backend',
        'mern_skills',
        'leadership_skills',
        'leadership_experience',
      ].some(key => key.toLowerCase() === matchingSkillLower)
    ) {
      // Find the correct casing for the key
      const generalKey = Object.keys(member.skillInfo.general).find(
        key => key.toLowerCase() === matchingSkillLower,
      );
      if (generalKey) {
        return parseInt(member.skillInfo.general[generalKey], 10);
      }
    }

    // No match found
    return null;
  };

  // Helper function to check if the search term matches (exactly or partially) any available skill
  const isSkillSearch = term => {
    if (!term) return false;

    const termLower = term.toLowerCase();
    const allSkills = [
      ...availableSkills.frontend,
      ...availableSkills.backend,
      ...availableSkills.general,
    ];

    return allSkills.some(
      skill => skill.toLowerCase() === termLower || skill.toLowerCase().startsWith(termLower),
    );
  };

  // Filter members based on search term and selected skills
  const filteredMembers = members
    .filter(member => {
      // If no search term and no skills selected, don't show any members
      if (!searchTerm.trim() && selectedSkills.length === 0) {
        return false;
      }

      // If we're searching by name or skills
      if (searchTerm.trim()) {
        const searchTermLower = searchTerm.toLowerCase();
        const isSkillQuery = isSkillSearch(searchTermLower);

        // If it's a skill query, check if the member has that skill
        if (isSkillQuery) {
          // Find all skills this member has
          const memberSkills = [
            ...Object.keys(member.skillInfo.frontend).filter(k => k !== 'overall'),
            ...Object.keys(member.skillInfo.backend).filter(k => k !== 'Overall'),
          ];

          // See if any of the member's skills match our query
          const skillMatches = memberSkills.some(
            skill =>
              skill.toLowerCase() === searchTermLower ||
              skill.toLowerCase().startsWith(searchTermLower),
          );

          if (!skillMatches) return false;
        } else {
          // It's a name search, check if name matches
          const nameMatches = member.name.displayName.toLowerCase().includes(searchTermLower);
          if (!nameMatches) return false;
        }
      }

      // If we reached here, include the member
      return true;
    })
    .map(member => {
      // Calculate the display score
      let displayScore = calculateScore(member);

      // If we're searching and not using skill filters
      if (searchTerm.trim() && selectedSkills.length === 0) {
        // Check if search term matches a skill
        if (isSkillSearch(searchTerm.trim())) {
          // Get exact skill score for the matching skill
          const exactSkillScore = getSkillScore(member, searchTerm.trim());
          if (exactSkillScore !== null) {
            displayScore = exactSkillScore;
          }
        }
      }

      return {
        ...member,
        displayScore,
      };
    })
    .sort((a, b) => {
      if (sortOrder === 'alpha') {
        // Sort alphabetically when explicitly chosen, regardless of filters
        return a.name.displayName.localeCompare(b.name.displayName);
      }

      // Default sort by score (descending)
      if (b.displayScore !== a.displayScore) {
        return b.displayScore - a.displayScore;
      }

      // For members with same score, sort alphabetically (A-Z)
      return a.name.displayName.localeCompare(b.name.displayName);
    });

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const toggleSkillsFilter = () => {
    setShowSkillsFilter(!showSkillsFilter);
  };

  // Update help text for skill search
  const matchingSkill = searchTerm.trim()
    ? [
        ...availableSkills.frontend,
        ...availableSkills.backend,
        ...availableSkills.general,
      ].find(skill => skill.toLowerCase().startsWith(searchTerm.trim().toLowerCase()))
    : null;

  return (
    <div className={`community-members ${darkMode ? 'dark-mode' : ''}`}>
      <div className="community-members__header">
        <h1>One Community Members</h1>

        <div className="community-members__search-filter">
          <div className="community-members__search">
            <input
              type="text"
              placeholder="Search by team member name or skills"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search community members"
            />
          </div>

          <div className="community-members__filters">
            <button
              className={`filter-button ${showSkillsFilter ? 'active' : ''}`}
              onClick={toggleSkillsFilter}
            >
              <i className="fa fa-sliders"></i>
              {selectedSkills.length > 0 ? `Skills (${selectedSkills.length})` : 'Skills Filter'}
            </button>
            <button className="sort-button active" onClick={toggleSortOrder}>
              <i
                className={`fa fa-sort-${sortOrder === 'alpha' ? 'alpha-asc' : 'numeric-desc'}`}
              ></i>
              {sortOrder === 'alpha' ? 'A-Z' : 'By Score'}
            </button>
          </div>
        </div>

        {showSkillsFilter && (
          <div className="community-members__skills-filter">
            <div className="skills-filter__section">
              <h3>Frontend Skills</h3>
              <div className="skills-filter__options">
                {availableSkills.frontend.map(skill => (
                  <label key={`frontend-${skill}`} className="skill-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="skills-filter__section">
              <h3>Backend Skills</h3>
              <div className="skills-filter__options">
                {availableSkills.backend.map(skill => (
                  <label key={`backend-${skill}`} className="skill-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="skills-filter__section">
              <h3>General Skills</h3>
              <div className="skills-filter__options">
                {availableSkills.general.map(skill => (
                  <label key={`general-${skill}`} className="skill-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="skills-filter__actions">
              <button
                className="clear-button"
                onClick={() => setSelectedSkills([])}
                disabled={selectedSkills.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="community-members__help-text">
          {selectedSkills.length > 0 ? (
            <span>
              Scores shown are based on the selected skills ({selectedSkills.length} selected).
              Members are ranked from highest to lowest average skill level.
            </span>
          ) : !searchTerm.trim() ? (
            <span>
              Select skills from the Skills Filter or enter a search term to view community members.
            </span>
          ) : matchingSkill ? (
            <span>
              Showing members with "{matchingSkill}" skill. The score displayed is the exact skill
              rating on a scale of 1-5.
            </span>
          ) : filteredMembers.length > 0 ? (
            <span>
              When searching by name or multiple skills, the score represents the average value.
              Members are ranked based on their scoring.
            </span>
          ) : (
            <span>
              No members found matching "{searchTerm}". Try a different search term or select skills
              from the filter.
            </span>
          )}
        </div>
      </div>

      <div className="community-members__grid">
        {currentMembers.length > 0 ? (
          currentMembers.map(member => (
            <Link
              key={member.userId}
              to={`/hgnhelp/profile/${member.userId}`}
              className="member-card-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MemberCard
                name={member.name.displayName}
                email={member.contactInfo.email}
                slackId={member.socialHandles.slack}
                score={member.displayScore}
                skills={member.topSkills}
                profileImage={member.profileImage}
                github={member.socialHandles.github}
                location={member.skillInfo.general.location}
                darkMode={darkMode}
                userId={member.userId}
                isContactPublic={member.contactInfo.public !== false}
              />
            </Link>
          ))
        ) : (
          <div className="community-members__no-results">
            {searchTerm.trim() || selectedSkills.length > 0
              ? 'No members found matching your criteria.'
              : 'Select skills from the Skills Filter or enter a search term to see community members.'}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="community-members__pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            <button
              key={pageNumber}
              className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
              aria-label={`Page ${pageNumber}`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityMembers;
