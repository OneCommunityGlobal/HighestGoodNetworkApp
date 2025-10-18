import React from 'react';
import styles from './BrowseLessonPlan.module.css';

export default function LessonPlanCard({ plan, onSave }) {
  const { title, subject, difficulty, description, thumbnail } = plan;
  return (
    <div className={styles.card}>
      {thumbnail ? (
        <img src={thumbnail} alt={title} className={styles.thumb} />
      ) : (
        <div className={styles.thumbPlaceholder}>No image</div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.tag}>{subject}</span>
          <span className={styles.tag}>{difficulty}</span>
        </div>
        <p className={styles.description}>
          {description
            ? description.slice(0, 120) + (description.length > 120 ? '…' : '')
            : 'No description.'}
        </p>
        <div className={styles.actions}>
          <button className={styles.view}>View</button>
          <button className={styles.save} onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
