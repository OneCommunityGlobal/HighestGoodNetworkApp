import { useState } from 'react';
import styles from './templateCard.module.css';

const TemplateCard = ({ template }) => {
  const [open, setOpen] = useState(false);

  const { title, level, description, details, subjects } = template;

  return (
    <>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{title}</h3>
          <span
            className={`${styles.levelBadge} ${
              level === 'advanced' ? styles.advanced : styles.intermediate
            }`}
          >
            {level}
          </span>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.detailGrid}>
          <div>
            <span className={styles.label}>Age Band:</span>
            <p>{details.ageBand}</p>
          </div>
          <div>
            <span className={styles.label}>Duration:</span>
            <p>{details.duration}</p>
          </div>
        </div>

        <div className={styles.themeSection}>
          <span className={styles.label}>Theme:</span>
          <p className={styles.themeValue}>{details.theme}</p>
        </div>

        <div className={styles.subjectSection}>
          <span className={styles.label}>Subjects:</span>
          <div className={styles.subjectPills}>
            {subjects.map((s, i) => (
              <span key={i} className={styles.pill}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className={styles.previewBtn} onClick={() => setOpen(true)}>
            👁 Preview
          </button>
          <button className={styles.selectBtn}>Select</button>
        </div>
      </div>

      {open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              ✖
            </button>

            <h2 className={styles.modalTitle}>{title}</h2>
            <p className={styles.modalDescription}>{description}</p>

            <div className={styles.modalContent}>
              <div>
                <h4>Template Details</h4>
                <p>
                  <strong>Age Band:</strong> {details.ageBand}
                </p>
                <p>
                  <strong>Duration:</strong> {details.duration}
                </p>
                <p>
                  <strong>Theme:</strong> {details.theme}
                </p>
                <p>
                  <strong>Difficulty:</strong> {level}
                </p>
              </div>

              <div>
                <h4>Included Subjects</h4>
                <div className={styles.subjectPills}>
                  {subjects.map((s, i) => (
                    <span key={i} className={styles.pill}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.closeModalBtn} onClick={() => setOpen(false)}>
                Close
              </button>
              <button className={styles.modalSelectBtn}>Select Template</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateCard;
