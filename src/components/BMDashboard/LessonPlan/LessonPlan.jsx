import { useState } from 'react';
import styles from './LessonPlan.module.css';
import Template from './Template';
import Topics from './Topics';
import ActivitiesDraft from './ActivitiesDraft';

const steps = [
  { id: 1, label: 'Choose Template' },
  { id: 2, label: 'Select Topics' },
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
      <div className={styles.progressStepper}>
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

      <div className={styles.midSectionWrapper}>
        <div className={styles.midSectionHeader}>
          {currentStep > 1 && (
            <button className={styles.midPrevButton} onClick={handlePrev}>
              ◀ Previous
            </button>
          )}

          <div className={styles.midHeaderText}>
            <h1>Build Lesson Plan</h1>
            <p>Step {currentStep} of 4</p>
          </div>

          {currentStep < steps.length && (
            <button className={styles.midNextButton} onClick={handleNext}>
              Next ▶
            </button>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.content}>
            {currentStep === 1 && <Template />}
            {currentStep === 2 && <Topics />}
            {currentStep === 3 && <ActivitiesDraft />}
            {currentStep === 4 && <h2>Review & Submit</h2>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlan;
