import React, { useState, useEffect } from 'react';
import MemberCard from './MemberCard';
import { mockMembers } from './mockData';
import './CommunityMembers.css';

/**
 * CommunityMembers component displays a list of community members
 * with their scores and skills, along with filtering and sorting options.
 */
const CommunityMembers = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const membersPerPage = 6;

  // Helper function to calculate overall score
  const calculateOverallScore = member => {
    // Convert string scores to numbers and calculate average
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

    // Calculate average score (keeping original 1-5 scale)
    const allScores = [...frontendScores, ...backendScores, ...generalScores];
    const sum = allScores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / allScores.length);
  };

  // Helper function to find the specific skill score if it exists
  const findSkillScore = (member, searchTerm) => {
    if (!searchTerm.trim()) return null;

    const searchTermLower = searchTerm.toLowerCase();

    // Check frontend skills
    for (const [key, value] of Object.entries(member.skillInfo.frontend)) {
      if (key.toLowerCase() === searchTermLower || key.toLowerCase().includes(searchTermLower)) {
        return parseInt(value, 10); // Keep original 1-5 scale
      }
    }

    // Check backend skills
    for (const [key, value] of Object.entries(member.skillInfo.backend)) {
      if (key.toLowerCase() === searchTermLower || key.toLowerCase().includes(searchTermLower)) {
        return parseInt(value, 10); // Keep original 1-5 scale
      }
    }

    // Check other skills (these don't have direct scores, so we'll return null)
    if (member.skillInfo.followup.other_skills) {
      const otherSkills = member.skillInfo.followup.other_skills
        .split(',')
        .map(s => s.trim().toLowerCase());
      if (otherSkills.some(skill => skill === searchTermLower || skill.includes(searchTermLower))) {
        // For other_skills that don't have ratings, we'll return null as we don't want to aggregate
        return null;
      }
    }

    return null;
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

  // Sort members by score in descending order
  useEffect(() => {
    const membersWithScores = mockMembers.map(member => ({
      ...member,
      calculatedScore: calculateOverallScore(member),
      topSkills: getTopSkills(member),
    }));

    const sortedMembers = membersWithScores.sort((a, b) => b.calculatedScore - a.calculatedScore);

    setMembers(sortedMembers);
  }, []);

  // Filter members based on search term and team filter
  const filteredMembers = members
    .filter(member => {
      // Only show members if there's a search term
      if (!searchTerm.trim()) {
        return false; // Return empty results when no search term is provided
      }

      const searchTermLower = searchTerm.toLowerCase();

      // Check if name matches
      const nameMatches = member.name.displayName.toLowerCase().includes(searchTermLower);

      // Check if any skill matches (not just top skills)
      const hasSkill = member.topSkills.some(skill =>
        skill.toLowerCase().includes(searchTermLower),
      );

      // Check all frontend skills
      const hasFrontendSkill = Object.keys(member.skillInfo.frontend).some(
        skill => skill.toLowerCase() !== 'overall' && skill.toLowerCase().includes(searchTermLower),
      );

      // Check all backend skills
      const hasBackendSkill = Object.keys(member.skillInfo.backend).some(
        skill => skill.toLowerCase() !== 'overall' && skill.toLowerCase().includes(searchTermLower),
      );

      // Check other skills from followup
      const hasOtherSkill = member.skillInfo.followup.other_skills
        ? member.skillInfo.followup.other_skills
            .toLowerCase()
            .split(',')
            .some(skill => skill.trim().includes(searchTermLower))
        : false;

      const matchesSearch =
        nameMatches || hasSkill || hasFrontendSkill || hasBackendSkill || hasOtherSkill;

      if (filterTeam) {
        return matchesSearch && member.isInUserTeam;
      }

      return matchesSearch;
    })
    .map(member => {
      // For each filtered member, try to find a skill-specific score
      const skillScore = findSkillScore(member, searchTerm);

      // If we found a skill-specific score and it's not a name search, use it
      // (We don't want to show skill scores when searching by name)
      const isNameSearch = member.name.displayName.toLowerCase().includes(searchTerm.toLowerCase());

      return {
        ...member,
        // Use skill-specific score if available and not searching by name,
        // otherwise use the overall calculated score
        displayScore: skillScore && !isNameSearch ? skillScore : member.calculatedScore,
      };
    })
    .sort((a, b) => {
      // Resort based on the display score (skill-specific or overall)
      return b.displayScore - a.displayScore;
    });

  // Pagination logic
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  const toggleTeamFilter = () => {
    setFilterTeam(!filterTeam);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Determine if we're showing skill-specific scores (for help text)
  const isSkillSearch =
    searchTerm &&
    filteredMembers.some(member => {
      // Check if search term matches any skill, not just top skills
      const searchTermLower = searchTerm.toLowerCase();

      // Check top skills (already calculated)
      const matchesTopSkill = member.topSkills.some(skill =>
        skill.toLowerCase().includes(searchTermLower),
      );

      // Check frontend skills
      const matchesFrontendSkill = Object.keys(member.skillInfo.frontend).some(
        skill => skill.toLowerCase() !== 'overall' && skill.toLowerCase().includes(searchTermLower),
      );

      // Check backend skills
      const matchesBackendSkill = Object.keys(member.skillInfo.backend).some(
        skill => skill.toLowerCase() !== 'overall' && skill.toLowerCase().includes(searchTermLower),
      );

      // Check other skills
      const matchesOtherSkill = member.skillInfo.followup.other_skills
        ? member.skillInfo.followup.other_skills
            .toLowerCase()
            .split(',')
            .some(skill => skill.trim().includes(searchTermLower))
        : false;

      return matchesTopSkill || matchesFrontendSkill || matchesBackendSkill || matchesOtherSkill;
    });

  return (
    <div className="community-members">
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
              className={`filter-button ${filterTeam ? 'active' : ''}`}
              onClick={toggleTeamFilter}
            >
              <i className="fa fa-filter"></i>
              {filterTeam ? 'Show All' : 'My Team Only'}
            </button>
            <button className="sort-button">
              <i className="fa fa-sort-alpha-asc"></i> Sort
            </button>
          </div>
        </div>

        <div className="community-members__help-text">
          {!searchTerm.trim() ? (
            <span>Enter a member name or skill to search for community members.</span>
          ) : isSkillSearch ? (
            <span>
              Scores shown are specific to the skill "{searchTerm}" on a scale of 1-5. Members are
              ranked from highest to lowest skill level.
            </span>
          ) : (
            <span>
              When multiple options/filters are selected, the score represents the average value,
              and the options are ranked based on their scoring. Click over each profile to know
              more details.
            </span>
          )}
        </div>
      </div>

      <div className="community-members__grid">
        {currentMembers.length > 0 ? (
          currentMembers.map(member => (
            <MemberCard
              key={member.userId}
              name={member.name.displayName}
              email={member.contactInfo.email}
              slackId={member.socialHandles.slack}
              score={member.displayScore}
              skills={member.topSkills}
              profileImage={member.profileImage}
              isInUserTeam={member.isInUserTeam}
              github={member.socialHandles.github}
              location={member.skillInfo.general.location}
            />
          ))
        ) : (
          <div className="community-members__no-results">
            {searchTerm.trim()
              ? 'No members found matching your criteria.'
              : 'Start typing to search for members.'}
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
