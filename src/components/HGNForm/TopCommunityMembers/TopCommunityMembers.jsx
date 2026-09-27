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
  const [fetchError, setFetchError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  const normalizeMember = member => ({
    id: member?._id || member?.id,
    name: member?.name || null,
    email: member?.email || null,
    slack: member?.slack || null,
    phoneNumber: member?.phoneNumber || null,
    score: typeof member?.score === 'number' ? member.score : 0,
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await httpService.get(ENDPOINTS.HGN_FORM_RANKED, {
          params: { skills: selectedSkill },
        });
        setMembers(Array.isArray(response?.data) ? response.data : []);
        setFetchError(null);
      } catch (error) {
        setMembers([]);
        setFetchError(error.message || 'Unable to load community members.');
      }
    };

    if (selectedSkill) {
      fetchMembers();
    }
  }, [selectedSkill]);

  const scoreOf = m => (typeof m?.score === 'number' ? m.score : 0);
  const normalizedMembers = members.map(normalizeMember);
  const sortedMembers = [...normalizedMembers].sort((a, b) => scoreOf(b) - scoreOf(a));

  return (
    <div
      className={`${styles.centerContainer} ${styles.componentBox} ${
        darkMode ? styles.darkMode : ''
      }`}
    >
      <h2>Top 15 Community Members</h2>

      <div className={styles.filterRow}>
        <label htmlFor="skill-select">Select Skill:</label>
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

      <div className={styles.tableScroll}>
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
            {sortedMembers.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  {fetchError || 'No members found for this skill.'}
                </td>
              </tr>
            )}
            {sortedMembers.slice(0, 15).map((member, index) => {
              const scoreVal = scoreOf(member);
              return (
                <tr key={member.id || `${member.name || 'member'}-${index}`}>
                  <td>{member.name || 'Unavailable'}</td>
                  <td>
                    {!member.email ? (
                      <span className={styles.private} title="Email is private or unavailable">
                        <FaEnvelope className={styles.privateIcon} />
                        <span>Private</span>
                      </span>
                    ) : (
                      <a
                        href={`mailto:${member.email}`}
                        title={member.email}
                        aria-label={`Email ${member.name}`}
                        className={darkMode ? styles.iconLinkDark : styles.iconLink}
                      >
                        <FaEnvelope />
                        <span>{member.email}</span>
                      </a>
                    )}
                  </td>
                  <td>
                    {member.slack ? (
                      <a
                        href={`https://highest-good.slack.com/team/@${member.slack}`}
                        target="_blank"
                        rel="noreferrer"
                        title={member.slack}
                        className={darkMode ? styles.iconLinkDark : styles.iconLink}
                      >
                        <img src={slackLogo} alt="Slack" className={styles.slackLogo} />
                        <span>{member.slack}</span>
                      </a>
                    ) : (
                      <span className={styles.private} title="Slack is private or unavailable">
                        <img src={slackLogo} alt="Slack" className={styles.slackLogoPrivate} />
                        <span>Private</span>
                      </span>
                    )}
                  </td>
                  <td>
                    {!member.phoneNumber ? (
                      <span
                        className={styles.private}
                        title="Phone number is private or unavailable"
                      >
                        <FaPhone className={styles.privateIcon} />
                        <span>Private</span>
                      </span>
                    ) : (
                      <a
                        href={`tel:${member.phoneNumber}`}
                        title={member.phoneNumber}
                        aria-label={`Call ${member.name}`}
                        className={darkMode ? styles.iconLinkDark : styles.iconLink}
                      >
                        <FaPhone />
                        <span>{member.phoneNumber}</span>
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
      </div>
      <Link
        to={{ pathname: '/hgnhelp/community', state: { initialSkills: [selectedSkill] } }}
        className={darkMode ? styles.underlineLinkDark : styles.underlineLink}
      >
        Show your team members &gt;
      </Link>
    </div>
  );
}

export default TopCommunityMembers;
