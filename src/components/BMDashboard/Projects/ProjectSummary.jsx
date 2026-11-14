import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ProjectKpiCard from './ProjectKpiCard';
import styles from './ProjectSummary.module.css';

function ProjectSummary({ project }) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const projectId = typeof project._id === 'string' ? project._id.trim() : '';
  const cards = [
    {
      title: 'Hours',
      unavailableReason: 'Reliable total project hours are not available.',
      detailsTo: '/bmdashboard/timelog',
      detailsContext: 'select project',
    },
    {
      title: 'Materials Cost',
      unavailableReason: 'Actual materials costs are not available.',
      detailsTo: '/bmdashboard/materials',
      detailsContext: 'materials, all projects',
    },
    {
      title: 'Equipment Cost',
      unavailableReason: 'Actual equipment costs are not available.',
      detailsTo: '/bmdashboard/equipment',
      detailsContext: 'equipment, all projects',
    },
    {
      title: 'Waste %',
      unavailableReason: 'A waste percentage formula has not been established.',
    },
    {
      title: 'Members',
      value: Array.isArray(project.members) ? project.members.length : null,
      unavailableReason: 'Project member data is not available.',
      detailsTo: projectId ? `/bmdashboard/projects/${encodeURIComponent(projectId)}/teams` : null,
      detailsContext: 'project teams',
    },
    {
      title: 'Rentals',
      unavailableReason: 'Reliable rental and due-date information is not available.',
      detailsTo: '/bmdashboard/rentalchart',
      detailsContext: 'rental costs, all projects',
    },
    {
      title: 'Most-Bought Material',
      unavailableReason: 'A reliable comparison across material units is not available.',
      detailsTo: '/bmdashboard/materials',
      detailsContext: 'materials, all projects',
    },
    {
      title: 'Stock Health',
      unavailableReason: 'Inventory reorder thresholds are not available.',
      detailsTo: '/bmdashboard/materials',
      detailsContext: 'materials, all projects',
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
    _id: PropTypes.string,
    members: PropTypes.array,
  }).isRequired,
};

export default ProjectSummary;
