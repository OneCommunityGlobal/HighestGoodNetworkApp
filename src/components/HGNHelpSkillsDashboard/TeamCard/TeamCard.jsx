import styles from './TeamCard.module.css';
import { TeamMemberRow } from './TeamMemberRow';

export default function TeamCard() {
  const teamMembers = [
    { name: 'Shreya Laheri', score: '9/10', email: 'shreya.laheri@mock.com', slackId: 'U12345001' },
    {
      name: 'Shreya Vithala',
      score: '7/10',
      email: 'shreya.vithala@mock.com',
      slackId: 'U12345002',
    },
    { name: 'Jae Sabol', score: '5/10', email: '', slackId: '' },
    { name: 'Sara Sabol', score: '2/10', email: 'sara.sabol@mock.com', slackId: '' },
  ];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.teamCardContainer}>
        <div className={styles.teamCardHeader}>
          <h2 className={styles.teamCardTitle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="42"
              viewBox="0 0 40 42"
              fill="none"
            >
              <path
                d="M10 15.5234L20 25.8742L30 15.5234"
                stroke="#828282"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your Team_______ rating
          </h2>
        </div>
        <div>
          {teamMembers.map((member, index) => (
            <TeamMemberRow key={index} member={member} />
          ))}
        </div>
      </div>
      <div className={styles.showMoreSpan}>
        <span>
          <span className={styles.showMoreText}>Show your team member </span>
          <span className={styles.showMoreText} style={{ textDecoration: 'none' }}>
            &gt;
          </span>
        </span>
      </div>
    </div>
  );
}
