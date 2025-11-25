import { useEffect, useState } from 'react';
import axios from 'axios';
import UserCard from './UserCard';
import { ENDPOINTS } from '~/utils/URL';
import { useSelector } from 'react-redux';

const availableSkills = ['React', 'Redux', 'HTML', 'CSS', 'MongoDB', 'Database', 'Agile'];

export default function CommunityMembersPage() {
  const loggedInUser = useSelector(state => state.auth.user);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);

      try {
        const response = await axios.get(ENDPOINTS.TEAM_MEMBER_TASKS(loggedInUser.userid));

        const members = response.data || [];

        setTeamMembers(members);
        setFilteredMembers(members);
      } catch (err) {
        console.error('Failed to fetch HGN team', err);
      }

      setLoading(false);
    };

    fetchTeam();
  }, [loggedInUser.userid]);

  useEffect(() => {
    if (selectedSkills.length === 0) {
      setFilteredMembers(teamMembers);
      return;
    }

    const lower = selectedSkills.map(s => s.toLowerCase());

    const filtered = teamMembers.filter(member => {
      const memberSkills = (member.skills || []).map(s => s.toLowerCase());
      return memberSkills.some(s => lower.includes(s));
    });

    setFilteredMembers(filtered);
  }, [selectedSkills, teamMembers]);

  const toggleSkill = skill => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill],
    );
  };

  return (
    <div>
      <h1>Your HGN Team Members</h1>

      <p>Select skills to filter your team:</p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {availableSkills.map(skill => (
          <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />
            {skill}
          </label>
        ))}
      </div>

      {loading && <p>Loading team members…</p>}

      {!loading && filteredMembers.length === 0 && <p>No team members match these skills.</p>}

      {!loading && (
        <div className="user-card-container">
          {filteredMembers.map(user => (
            <UserCard key={user.personId} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
