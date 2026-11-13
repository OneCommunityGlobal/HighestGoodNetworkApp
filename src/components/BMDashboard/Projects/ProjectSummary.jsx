import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ProjectKpiCard from './ProjectKpiCard';
import styles from './ProjectSummary.module.css';

function ProjectSummary({ project }) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const cards = [
    {
      title: 'Hours',
      unavailableReason: 'Reliable total project hours are not available.',
    },
    {
      title: 'Materials Cost',
      unavailableReason: 'Actual materials costs are not available.',
    },
    {
      title: 'Equipment Cost',
      unavailableReason: 'Actual equipment costs are not available.',
    },
    {
      title: 'Waste %',
      unavailableReason: 'A waste percentage formula has not been established.',
    },
    {
      title: 'Members',
      value: Array.isArray(project.members) ? project.members.length : null,
      unavailableReason: 'Project member data is not available.',
    },
    {
      title: 'Rentals',
      unavailableReason: 'Reliable rental and due-date information is not available.',
    },
    {
      title: 'Most-Bought Material',
      unavailableReason: 'A reliable comparison across material units is not available.',
    },
    {
      title: 'Stock Health',
      unavailableReason: 'Inventory reorder thresholds are not available.',
    },
  ];

  return (
    <section
      className={darkMode ? styles.darkProjectSummaryContent : styles.projectSummaryContent}
      aria-label={`${project.name} Summary`}
    >
      <h2 className={styles.projectSummaryHeader}>{project.name} Summary</h2>
      <div className={styles.kpiGrid} role="group" aria-label="Project KPI cards">
        {cards.map(card => (
          <ProjectKpiCard key={card.title} {...card} darkMode={darkMode} />
        ))}
      </div>
    </section>
  );
}

ProjectSummary.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    members: PropTypes.array,
  }).isRequired,
};

export default ProjectSummary;
