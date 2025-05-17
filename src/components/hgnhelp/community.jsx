import { useState, useEffect } from 'react';
import { ENDPOINTS } from 'utils/URL';
import profilePic from './profilepic.png'; // Fallback
import slackLogo from './slackicon.png'; // Import Slack logo
import './community.css';
// eslint-disable-next-line import/order
import httpService from 'services/httpService';

function CommunityMembersList({ userTeamIds = [] }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedMembers, setExpandedMembers] = useState({});
  const toggleExpand = memberId => {
    setExpandedMembers(prev => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // 🟢 Helper: Calculate average score across all skills
  const calculateAverageSkillScore = skillsObj => {
    const allValues = [
      ...Object.values(skillsObj.frontend || {}),
      ...Object.values(skillsObj.backend || {}),
    ];
    const avg = allValues.length ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 0;
    return Math.round(avg);
  };

  // 🟢 Fetch and transform data from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // const response = await fetch('http://localhost:4500/api/hgnhelp/community'); // Replace with your endpoint
        const response = await httpService.get(ENDPOINTS.HGN_FORM_GET_COMMUNITY_MEMBERS_LIST);
        // const data = await response.json();
        const { data } = response;
        // eslint-disable-next-line no-console
        console.log('Fetched data:', data);

        const transformed = data.map(member => {
          const frontendSkills = Object.keys(member.skills.frontend || {});
          const backendSkills = Object.keys(member.skills.backend || {});
          const allSkills = [...frontendSkills, ...backendSkills];

          return {
            id: member._id,
            name: member.name,
            email: member.email,
            slack: member.slack,
            score: calculateAverageSkillScore(member.skills),
            skills: allSkills,
            profilePic: member.profilePic || profilePic, // fallback if image missing
          };
        });

        setMembers(transformed);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch members:', error);
        setMembers([]);
      }
    };

    fetchMembers();
  }, []);

  // 🟢 Filter, Search, Sort
  useEffect(() => {
    let result = [...members];

    if (search) {
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase())),
      );
    }

    if (filter) {
      result = result.filter(m => m.score > 7);
    }

    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    setFilteredMembers(result);
  }, [members, search, filter, sortOrder]);

  return (
    <div className="members-container">
      <h1 className="heading">One Community Members</h1>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search by team member name or skills"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="button" className="control-button" onClick={() => setFilter(prev => !prev)}>
          <span className="icon">≡</span> {filter ? 'Show All' : 'Filter (Score>7)'}
        </button>
        <button
          type="button"
          className="control-button"
          onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
        >
          AZ Sort {sortOrder === 'asc' ? '↓' : '↑'}
        </button>
      </div>

      <div className="cards-grid">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className={`member-card ${userTeamIds.includes(member.id) ? 'highlight' : ''}`}
          >
            <img src={member.profilePic} alt={member.name} className="profile-img" />
            <p className="member-name">{member.name}</p>
            <p className="member-text">📧 {member.email}</p>
            {/* <p className="member-text">
              <img src={slackIcon} alt="Slack" className="slackicon" /> {member.slack}
            </p> */}
            <p className="member-text">
              {!member.slack ? (
                <span title="No ID was found">
                  <img
                    src={slackLogo}
                    alt="Slack"
                    style={{ width: '20px', height: '20px', opacity: 0.4, cursor: 'not-allowed' }}
                  />
                </span>
              ) : (
                <a
                  href={`https://highest-good.slack.com/team/@${member.slack}`}
                  target="_blank"
                  rel="noreferrer"
                  title={member.slack}
                >
                  <img src={slackLogo} alt="Slack" style={{ width: '20px', height: '20px' }} />
                </a>
              )}
              <span style={{ marginLeft: '8px' }}>{member.slack || ' '}</span>
            </p>

            <div className="member-footer">
              <p className="score">
                Score: <span className={member.score >= 5 ? 'green' : 'red'}>{member.score}</span>
                /10
              </p>
              {/* <p className="skills">
                <span className="skills-label">Top Skills:</span> <br />
                {member.skills.join(', ')}
              </p> */}
              <div className="skills">
                <span className="skills-label">Skills:</span>{' '}
                {expandedMembers[member.id]
                  ? member.skills.join(', ')
                  : member.skills.slice(0, 5).join(', ')}
                {member.skills.length > 5 && (
                  // eslint-disable-next-line react/button-has-type
                  <button className="toggle-button" onClick={() => toggleExpand(member.id)}>
                    {expandedMembers[member.id] ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityMembersList;
