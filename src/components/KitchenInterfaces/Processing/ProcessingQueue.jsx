import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSun,
  faSnowflake,
  faWarehouse,
  faArchive,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import styles from './ProcessingLandingPage.module.css';
import ProcessingProjectCard from './ProcessingProjectCard';

const ProcessingQueue = ({ title, subtitle, projects, onAddProject, type }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const getIcon = type => {
    switch (type) {
      case 'canning':
        return faArchive;
      case 'dehydration':
        return faSun;
      case 'freezeDrying':
        return faSnowflake;
      case 'cellarStorage':
        return faWarehouse;
      default:
        return faArchive;
    }
  };

  const getIconClass = type => {
    switch (type) {
      case 'canning':
        return styles.iconPurple;
      case 'dehydration':
        return styles.iconOrange;
      case 'freezeDrying':
        return styles.iconBlue;
      case 'cellarStorage':
        return styles.iconGreen;
      default:
        return styles.iconPurple;
    }
  };

  return (
    <div className={styles.queueContainer}>
      <div className={styles.queueHeader}>
        <div className={styles.queueTitleGroup}>
          <FontAwesomeIcon
            icon={getIcon(type)}
            className={`${styles.queueIcon} ${getIconClass(type)}`}
          />
          <div>
            <h2 className={styles.queueTitle}>{title}</h2>
            <p className={styles.queueSubtitle}>{subtitle}</p>
          </div>
        </div>
        <button className={styles.addProjectBtn} onClick={onAddProject}>
          <FontAwesomeIcon icon={faPlus} /> Add {type === 'cellarStorage' ? 'Item' : 'Project'}
        </button>
      </div>

      <div className={styles.projectsList}>
        {projects && projects.length > 0 ? (
          projects.map(project => (
            <ProcessingProjectCard key={project._id || project.id} project={project} />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No scheduled projects.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingQueue;
