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

    // Calculate average score (out of 10)
    const allScores = [...frontendScores, ...backendScores, ...generalScores];
    const sum = allScores.reduce((acc, score) => acc + score, 0);
    return Math.round((sum / allScores.length) * 2); // Convert 1-5 scale to 1-10
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
  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.topSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterTeam) {
      return matchesSearch && member.isInUserTeam;
    }

    return matchesSearch;
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
          When multiple options/filters are selected, the score represents the average value, and
          the options are ranked based on their scoring. Click over each profile to know more
          details.
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
              score={member.calculatedScore}
              skills={member.topSkills}
              profileImage={member.profileImage}
              isInUserTeam={member.isInUserTeam}
              github={member.socialHandles.github}
              location={member.skillInfo.general.location}
            />
          ))
        ) : (
          <div className="community-members__no-results">
            No members found matching your criteria.
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
