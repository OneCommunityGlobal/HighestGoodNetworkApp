// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// eslint-disable-next-line import/order
import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './TopCommunityMembers.module.css';
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
  const darkMode = useSelector(state => state.theme.darkMode);

  const normalizeMember = member => {
    const fullName = [member?.firstName, member?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();

    const phoneValue = Array.isArray(member?.phoneNumber)
      ? member.phoneNumber[0]
      : member?.phoneNumber || member?.phone || member?.contact?.phoneNumber;

    return {
      id: member?._id || member?.id || member?.userId || member?.user_id,
      name: member?.name || member?.userInfo?.name || member?.fullName || fullName || null,
      email: member?.email || member?.userInfo?.email || member?.contact?.email || null,
      slack:
        member?.slack ||
        member?.slackID ||
        member?.slackId ||
        member?.userInfo?.slack ||
        member?.userInfo?.slackID ||
        null,
      phoneNumber: phoneValue || null,
      rating: member?.rating,
      skillScore: member?.skillScore,
    };
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await httpService.get(
          ENDPOINTS.HGN_FORM_GET_TEAM_MEMBERS_BY_SKILL(selectedSkill),
        );
        const primaryData = Array.isArray(response?.data) ? response.data : [];

        if (primaryData.length > 0) {
          setMembers(primaryData);
          return;
        }

        // Fallback: team-level endpoint can return data even when the userProfile endpoint is empty.
        const fallbackResponse = await httpService.get(
          ENDPOINTS.HGN_FORM_GET_TEAM_MEMBERS_BY_SKILL_FALLBACK(selectedSkill),
        );
        const fallbackData = Array.isArray(fallbackResponse?.data) ? fallbackResponse.data : [];
        setMembers(fallbackData);
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

  // normalize rating for sorting and display: supports "7/10" or numeric skillScore
  const scoreOf = m => {
    if (typeof m?.rating === 'string') {
      const [n] = m.rating.split('/');
      const num = parseInt(n, 10);
      return Number.isFinite(num) ? num : 0;
    }
    if (typeof m?.skillScore === 'number') return m.skillScore;
    return 0;
  };
  const normalizedMembers = members.map(normalizeMember);
  const sortedMembers = [...normalizedMembers].sort((a, b) => scoreOf(b) - scoreOf(a));

  return (
    <div
      className={`${styles.centerContainer} ${styles.componentBox} ${
        darkMode ? styles.darkMode : ''
      }`}
    >
      <h2>Top 15 Community Members</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="skill-select">Select Skill: </label>
        <select
          id="skill-select"
          className={darkMode ? styles.selectDark : styles.select}
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

      <table className={darkMode ? styles.tableDark : styles.table}>
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
          {sortedMembers.slice(0, 15).map((member, index) => {
            const scoreVal = scoreOf(member);
            return (
              <tr key={member.id || `${member.name || 'member'}-${index}`}>
                <td>{member.name || 'Unavailable'}</td>
                <td>
                  {!member.email ? (
                    <span className={styles.private} title="Email is private or unavailable">
                      <FaEnvelope style={{ color: '#ccc', cursor: 'not-allowed' }} />
                      &nbsp;Private
                    </span>
                  ) : (
                    <a
                      href={`mailto:${member.email}`}
                      title={member.email}
                      aria-label={`Email ${member.name}`}
                      className={darkMode ? styles.iconLinkDark : styles.iconLink}
                    >
                      <FaEnvelope /> {member.email}
                    </a>
                  )}
                </td>
                <td>
                  {!member.slack ? (
                    <span className={styles.private} title="Slack is private or unavailable">
                      <img
                        src={slackLogo}
                        alt="Slack"
                        style={{
                          width: '20px',
                          height: '20px',
                          opacity: 0.4,
                          cursor: 'not-allowed',
                        }}
                      />
                      &nbsp;Private
                    </span>
                  ) : (
                    <a
                      href={`https://highest-good.slack.com/team/@${member.slack}`}
                      target="_blank"
                      rel="noreferrer"
                      title={member.slack}
                      className={darkMode ? styles.iconLinkDark : styles.iconLink}
                    >
                      <img src={slackLogo} alt="Slack" style={{ width: '20px', height: '20px' }} />{' '}
                      {member.slack}
                    </a>
                  )}
                </td>
                <td>
                  {!member.phoneNumber ? (
                    <span className={styles.private} title="Phone number is private or unavailable">
                      <FaPhone style={{ color: '#ccc', cursor: 'not-allowed' }} />
                      &nbsp;Private
                    </span>
                  ) : (
                    <a
                      href={`tel:${member.phoneNumber}`}
                      title={member.phoneNumber}
                      aria-label={`Call ${member.name}`}
                      className={darkMode ? styles.iconLinkDark : styles.iconLink}
                    >
                      <FaPhone style={{ marginRight: '5px' }} />
                      {member.phoneNumber}
                    </a>
                  )}
                </td>
                <td>
                  <span className={scoreVal < 5 ? styles.lowScore : styles.highScore}>
                    {scoreVal}
                  </span>
                  /10
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Link
        to="/hgnhelp/community"
        className={darkMode ? styles.underlineLinkDark : styles.underlineLink}
      >
        Show your team members &gt;
      </Link>
    </div>
  );
}

export default TopCommunityMembers;
