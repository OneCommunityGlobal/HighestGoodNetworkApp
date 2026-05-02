import hasPermission from '~/utils/permissions';
import { useSelector } from 'react-redux';
import styles from './PRDashboard.module.css';

/**
 * Dashboard sections configuration
 * These represent the future analytics graphs that will be implemented later.
 */
const DASHBOARD_SECTIONS = [
  {
    id: 'promotionEligibility',
    title: 'Promotion Eligibility',
    description: 'Graph showing weekly promotion eligibility metrics.',
  },
  {
    id: 'prQualityReviewers',
    title: 'PR Quality by Reviewers',
    description: 'Visualization of PR quality ratings grouped by reviewer.',
  },
  {
    id: 'popularPRs',
    title: 'Top 20 Most Popular PRs',
    description: 'Chart displaying the most reviewed pull requests.',
  },
  {
    id: 'prReviewInsights',
    title: 'PR Reviews Insights',
    description: 'Insights into PR review actions such as approvals and requested changes.',
  },
  {
    id: 'prQualityDistribution',
    title: 'PR Quality Distribution',
    description: 'Pie charts representing PR quality distribution across teams.',
  },
];

/**
 * Reusable dashboard card component
 * Used to render each placeholder section.
 */
function DashboardCard({ title, description, dm }) {
  return (
    <div className={`${styles.dashboardCard} ${dm}`}>
      <div className={`${styles.cardHeader} ${dm}`}>
        <h2 className={dm}>{title}</h2>
      </div>

      <div className={`${styles.cardBody} ${dm}`}>
        <div className={`${styles.placeholderGraph} ${dm}`}>
          <div className={styles.placeholderContent}>
            <span className={`${styles.placeholderTitle} ${dm}`}>
              Placeholder for future graph component
            </span>
            <span className={`${styles.placeholderSubtext} ${dm}`}>
              Graph will be implemented in a future update
            </span>
          </div>
        </div>

        <p className={`${styles.cardDescription} ${dm}`}>{description}</p>
      </div>
    </div>
  );
}

function PRDashboard({ authUser }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dm = darkMode ? styles['dark-mode'] : '';

  if (!hasPermission('accessPRTeamDashboard', authUser?.permissions)) {
    return <p>You do not have access to this dashboard.</p>;
  }

  return (
    <div className={`${styles.dashboardWrapper} ${dm}`}>
      <h1 className={`${styles.prdashcontainer} ${dm}`}>PR Team Analysis Dashboard</h1>

      {/* Dashboard cards grid */}
      <div className={styles.dashboardGrid}>
        {DASHBOARD_SECTIONS.map(section => (
          <DashboardCard
            key={section.id}
            title={section.title}
            description={section.description}
            dm={dm}
          />
        ))}
      </div>
    </div>
  );
}

export default PRDashboard;
