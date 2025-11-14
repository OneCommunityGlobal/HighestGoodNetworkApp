import { useState } from 'react';
import styles from './LessonPlan.module.css';

const steps = [
  { id: 1, label: 'Select Template' },
  { id: 2, label: 'Select Topic' },
  { id: 3, label: 'Draft Activities' },
  { id: 4, label: 'Review & Submit' },
];

const LessonPlan = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.stepWrapper}>
          {steps.map(step => {
            const isActive = currentStep === step.id;
            return (
              <div key={step.id} className={styles.stepItem}>
                <div className={`${styles.circle} ${isActive ? styles.activeCircle : ''}`}>
                  {step.id}
                </div>

                <p className={`${styles.stepLabel} ${isActive ? styles.activeLabel : ''}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.container}>
          {currentStep > 1 && (
            <button className={styles.prevButton} onClick={handlePrev}>
              ◀ Previous
            </button>
          )}

          {currentStep < steps.length && (
            <button className={styles.nextButton} onClick={handleNext}>
              Next ▶
            </button>
          )}
          <div className={styles.content}>
            {currentStep === 1 && <h2>Select a Template</h2>}
            {currentStep === 2 && <h2>Select Topic</h2>}
            {currentStep === 3 && <h2>Draft Activities</h2>}
            {currentStep === 4 && <h2>Review & Submit</h2>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlan;
