// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const sortedMembers = [...members].sort((a, b) => scoreOf(b) - scoreOf(a));
  const sortedMembers = [...members].sort((a, b) => b.rating - a.rating);

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
          {sortedMembers.slice(0, 15).map(member => {
            const scoreVal = scoreOf(member);
            return (
              <tr key={member._id || member.id}>
                <td>{member.name}</td>
                <td>
                  {!member.email ? (
                    <span className={styles.private} title="No ID was found">
                      <FaEnvelope style={{ color: '#ccc', cursor: 'not-allowed' }} />
                    </span>
                  ) : (
                    <a
                      href={`mailto:${member.email}`}
                      title={member.email}
                      aria-label={`Email ${member.name}`}
                      className={darkMode ? styles.iconLinkDark : styles.iconLink}
                    >
                      <FaEnvelope />
                    </a>
                  )}
                </td>
                <td>
                  {!member.slack && !member.slackID ? (
                    <span title="No ID was found">
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
                    </span>
                  ) : (
                    <a
                      href={`https://highest-good.slack.com/team/@${member.slack ||
                        member.slackID}`}
                      target="_blank"
                      rel="noreferrer"
                      title={member.slack || member.slackID}
                    >
                      <img src={slackLogo} alt="Slack" style={{ width: '20px', height: '20px' }} />
                    </a>
                  )}
                </td>
                <td>
                  {!member.phoneNumber ? (
                    <span className={styles.private} title="Phone number not found">
                      <FaPhone style={{ color: '#ccc', cursor: 'not-allowed' }} />
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
      <a
        href="/hgnhelp?request=1"
          {sortedMembers.slice(0, 15).map(member => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>
                {!member.email ? (
                  <span className={styles.private} title="No ID was found">
                    <FaEnvelope style={{ color: '#ccc', cursor: 'not-allowed' }} />
                  </span>
                ) : (
                  <a
                    href={`mailto:${member.email}`}
                    title={member.email}
                    aria-label={`Email ${member.name}`}
                    className={darkMode ? styles.iconLinkDark : styles.iconLink}
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
                  <span className={styles.private} title="Phone number not found">
                    <FaPhone style={{ color: '#ccc', cursor: 'not-allowed' }} />
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
                <span
                  className={
                    parseInt(member.rating.split('/')[0], 10) < 5
                      ? styles.lowScore
                      : styles.highScore
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

      <a
        href="hgnhelp/community"
        className={darkMode ? styles.underlineLinkDark : styles.underlineLink}
      >
        Show your team members &gt;
      </a>
    </div>
  );
}

export default TopCommunityMembers;
