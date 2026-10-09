import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import styles from './LessonPlanBuilder.module.css';
import { submitLessonPlanDraft } from '../../../../services/lessonPlanDraftService';

const STEPS = [
  { id: 1, label: 'Add Goals' },
  { id: 2, label: 'Select Topics' },
  { id: 3, label: 'Suggest Tasks' },
  { id: 4, label: 'Review & Submit' },
];

const parseLines = value =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

const LessonPlanBuilder = () => {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const history = useHistory();

  const [currentStep, setCurrentStep] = useState(1);
  const [goalsInput, setGoalsInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [tasksInput, setTasksInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const goals = parseLines(goalsInput);
  const topics = parseLines(topicsInput);
  const suggestedTasks = parseLines(tasksInput);

  const goNext = () => setCurrentStep(step => Math.min(step + 1, STEPS.length));
  const goBack = () => setCurrentStep(step => Math.max(step - 1, 1));

  const canProceedFromStep2 = topics.length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await submitLessonPlanDraft({ goals, topics, suggestedTasks });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit your lesson plan draft. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
        <div className={`${styles.confirmationBox} ${darkMode ? styles.confirmationBoxDark : ''}`}>
          <h2>Draft submitted!</h2>
          <p>Your lesson plan proposal has been sent to your educator for review.</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => history.push('/educationportal/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
      <div className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}>
        <header className={styles.header}>
          <h2 className={styles.title}>Build a Lesson Plan</h2>
          <div className={styles.stepIndicator}>
            {STEPS.map(step => (
              <span
                key={step.id}
                className={`${styles.stepDot} ${
                  currentStep === step.id ? styles.stepDotActive : ''
                } ${currentStep > step.id ? styles.stepDotDone : ''}`}
              >
                {step.label}
              </span>
            ))}
          </div>
          <hr className={styles.divider} />
        </header>

        {error && <p className={styles.errorText}>{error}</p>}

        {currentStep === 1 && (
          <section className={styles.stepSection}>
            <h3>Step 1: Add Goals</h3>
            <p className={styles.stepHint}>
              What do you hope to achieve with this lesson plan? One goal per line.
            </p>
            <textarea
              className={styles.textarea}
              rows={6}
              value={goalsInput}
              onChange={e => setGoalsInput(e.target.value)}
              placeholder="e.g. Understand basic fractions"
            />
          </section>
        )}

        {currentStep === 2 && (
          <section className={styles.stepSection}>
            <h3>Step 2: Select Topics</h3>
            <p className={styles.stepHint}>
              List the topics you want to cover. One topic per line. At least one is required.
            </p>
            <textarea
              className={styles.textarea}
              rows={6}
              value={topicsInput}
              onChange={e => setTopicsInput(e.target.value)}
              placeholder="e.g. Fractions"
            />
          </section>
        )}

        {currentStep === 3 && (
          <section className={styles.stepSection}>
            <h3>Step 3: Suggest Tasks</h3>
            <p className={styles.stepHint}>
              Suggest tasks or activities for your educator to consider. One per line.
            </p>
            <textarea
              className={styles.textarea}
              rows={6}
              value={tasksInput}
              onChange={e => setTasksInput(e.target.value)}
              placeholder="e.g. Practice worksheet on fractions"
            />
          </section>
        )}

        {currentStep === 4 && (
          <section className={styles.stepSection}>
            <h3>Step 4: Review &amp; Submit</h3>
            <div className={styles.reviewBlock}>
              <h4>Goals</h4>
              {goals.length === 0 ? (
                <p className={styles.emptyText}>None added</p>
              ) : (
                <ul>
                  {goals.map(g => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
              <h4>Topics</h4>
              {topics.length === 0 ? (
                <p className={styles.emptyText}>None added</p>
              ) : (
                <ul>
                  {topics.map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <h4>Suggested Tasks</h4>
              {suggestedTasks.length === 0 ? (
                <p className={styles.emptyText}>None added</p>
              ) : (
                <ul>
                  {suggestedTasks.map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={goBack}
            disabled={currentStep === 1}
          >
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={goNext}
              disabled={currentStep === 2 && !canProceedFromStep2}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSubmit}
              disabled={submitting || topics.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit to Educator'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanBuilder;
