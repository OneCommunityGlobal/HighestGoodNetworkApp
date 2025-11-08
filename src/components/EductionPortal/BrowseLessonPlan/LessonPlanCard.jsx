import React from 'react';
import styles from './BrowseLessonPlan.module.css';

export default function LessonPlanCard({ plan, onSave, isSaved, darkMode }) {
  const { title, subject, subjects, difficulty, description, thumbnail } = plan;
  const subjectLabel = subject || (subjects && subjects[0]) || 'General';

  return (
    <div className={`${styles.card} ${darkMode ? styles.dark : ''}`}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className={styles.thumb} />
      ) : (
        <div className={styles.thumbPlaceholder}>No image</div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.tag}>{subjectLabel}</span>
          <span className={styles.tag}>{difficulty}</span>
        </div>
        <p className={styles.description}>
          {description
            ? description.length > 120
              ? `${description.slice(0, 120)}…`
              : description
            : 'No description.'}
        </p>
        <div className={styles.actions}>
          <button
            className={styles.view}
            onClick={() => {
              alert('Open lesson detail (not implemented)');
            }}
          >
            View
          </button>
          <button className={styles.save} onClick={onSave} disabled={!!isSaved}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
