// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line import/order
import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';
import './TopCommunityMembers.module.css';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import slackLogo from '../../../assets/images/slack.png';

const skillOptions = [
  'HTML',
  'Bootstrap',
  'CSS',
  'React',
  'Redux',
  'WebSocketCom',
  'ResponsiveUI',
  'UnitTest',
  'Documentation',
  'UIUXTools',
];

function TopCommunityMembers() {
  const [selectedSkill, setSelectedSkill] = useState('HTML');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await httpService.get(
          ENDPOINTS.HGN_FORM_GET_TEAM_MEMBERS_BY_SKILL(selectedSkill),
        );
        setMembers(response.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching members:', error);
        setMembers([]); // fallback in case of error
      }
    };

    if (selectedSkill) {
      fetchMembers();
    }
  }, [selectedSkill]);

  const sortedMembers = [...members].sort((a, b) => b.rating - a.rating);

  return (
    <div className="center-container component-box">
      <h2>Top 15 Community Members</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="skill-select">Select Skill: </label>
        <select
          id="skill-select"
          value={selectedSkill}
          onChange={e => setSelectedSkill(e.target.value)}
        >
          {skillOptions.map(skill => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Slack ID</th>
            <th>Phone Number</th>
            <th>Skill Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.slice(0, 15).map(member => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>
                {!member.email ? (
                  <span className="private" title="No ID was found">
                    <FaEnvelope style={{ color: '#ccc', cursor: 'not-allowed' }} />
                  </span>
                ) : (
                  <a
                    href={`mailto:${member.email}`}
                    title={member.email}
                    aria-label={`Email ${member.name}`}
                  >
                    <FaEnvelope />
                  </a>
                )}
              </td>
              <td>
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
              </td>
              <td>
                {!member.phoneNumber ? (
                  <span className="private" title="Phone number not found">
                    <FaPhone style={{ color: '#ccc', cursor: 'not-allowed' }} />
                  </span>
                ) : (
                  <a
                    href={`tel:${member.phoneNumber}`}
                    title={member.phoneNumber}
                    aria-label={`Call ${member.name}`}
                  >
                    <FaPhone style={{ marginRight: '5px' }} />
                    {member.phoneNumber}
                  </a>
                )}
              </td>
              <td>
                <span
                  className={
                    parseInt(member.rating.split('/')[0], 10) < 5 ? 'low-score' : 'high-score'
                  }
                >
                  {member.rating.split('/')[0]}
                </span>
                /10
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <a href="hgnhelp/community" className="underline-link">
        Show your team members &gt;
      </a>
    </div>
  );
}

export default TopCommunityMembers;
