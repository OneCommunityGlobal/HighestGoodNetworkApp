import { useEffect, useState } from 'react';
import axios from 'axios';
import RankedUserList from './RankedUserList';

const availableSkills = [
  'React', 'Redux', 'HTML', 'CSS',
  'MongoDB', 'Database', 'Agile'
];

function SkillFilterTest() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [rankedUsers, setRankedUsers] = useState([]);

  const handleCheckboxChange = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  useEffect(() => {
    if (selectedSkills.length === 0) return;

    const fetchRanked = async () => {
      try {
        const res = await axios.get('/api/hgnform/ranked', {
          params: { skills: selectedSkills.join(',') }
        });
        setRankedUsers(res.data);
      } catch (err) {
        console.error('Error fetching ranked users:', err);
      }
    };

    fetchRanked();
  }, [selectedSkills]);

  return (
    <div>
      <h2>Select Skills to Filter By</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {availableSkills.map((skill) => (
          <label key={skill}>
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => handleCheckboxChange(skill)}
            />
            {skill}
          </label>
        ))}
      </div>

      {selectedSkills.length > 0 && (
        <RankedUserList selectedSkills={selectedSkills} />
      )}
    </div>
  );
}

export default SkillFilterTest;
