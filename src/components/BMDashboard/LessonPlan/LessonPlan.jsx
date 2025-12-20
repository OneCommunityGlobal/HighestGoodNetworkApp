import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './LessonPlan.module.css';
import Template from './Template';
import Topics from './Topics';
import ActivitiesDraft from './ActivitiesDraft';
import ReviewAndSubmit from './ReviewAndSubmit';
import {
  fetchLessonPlanTemplates,
  saveLessonPlanComments,
} from '../../../actions/bmdashboard/lessonPlanBuilderActions';

const steps = [
  { id: 1, label: 'Choose Template' },
  { id: 2, label: 'Select Topics' },
  { id: 3, label: 'Draft Activities' },
  { id: 4, label: 'Review & Submit' },
];

const LessonPlan = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [chatInput, setChatInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [comments, setComments] = useState([
    {
      time: 'Dec 05, 05:30 AM',
      text: 'Great topic selection! Consider adding more hands-on activities.',
    },
    { time: 'Dec 06, 09:15 AM', text: 'Reflection questions are thoughtful and helpful.' },
  ]);

  const dispatch = useDispatch();
  const { lessonPlanTemplates, loading, error } = useSelector(state => state.lessonPlanBuilder);

  useEffect(() => {
    dispatch(fetchLessonPlanTemplates());
  }, [dispatch]);

  const sendComment = () => {
    if (!chatInput.trim()) return;

    const newComment = { time: 'Now', text: chatInput };
    setComments(prev => [newComment, ...prev]);
    setChatInput('');
    dispatch(saveLessonPlanComments([newComment]));
  };

  return (
    <div className={styles.lessonPlanRoot}>
      <div className={styles.page}>
        {!isSidebarOpen && (
          <div className={styles.commentToggleBar}>
            <button className={styles.openSidebarBtn} onClick={() => setIsSidebarOpen(true)}>
              ☰ Comments
            </button>
          </div>
        )}
        <div
          className={`${styles.mainContent} ${
            isSidebarOpen ? styles.withSidebar : styles.fullWidth
          }`}
        >
          <div className={styles.progressStepper}>
            <div className={styles.stepWrapper}>
              {steps.map(step => (
                <div key={step.id} className={styles.stepItem}>
                  <div
                    className={`${styles.circle} ${
                      currentStep === step.id ? styles.activeCircle : ''
                    }`}
                  >
                    {step.id}
                  </div>
                  <p
                    className={`${styles.stepLabel} ${
                      currentStep === step.id ? styles.activeLabel : ''
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.midSectionWrapper}>
            <div className={styles.midSectionHeader}>
              {currentStep > 1 && (
                <button className={styles.midPrevButton} onClick={() => setCurrentStep(p => p - 1)}>
                  ◀ Previous
                </button>
              )}

              <div className={styles.midHeaderText}>
                <h1>Build Lesson Plan</h1>
                <p>Step {currentStep} of 4</p>
              </div>

              {currentStep < steps.length && (
                <button
                  className={styles.midNextButton}
                  disabled={
                    (currentStep === 1 && !selectedTemplate) ||
                    (currentStep === 2 && selectedAtoms.length === 0) ||
                    (currentStep === 3 && activities.length === 0)
                  }
                  onClick={() => setCurrentStep(p => p + 1)}
                >
                  Next ▶
                </button>
              )}
            </div>
          </div>
          <div className={styles.body}>
            <div className={styles.container}>
              <div className={styles.content}>
                {currentStep === 1 && (
                  <Template
                    templates={lessonPlanTemplates}
                    loading={loading}
                    error={error}
                    onSelectTemplate={template => {
                      setSelectedTemplate(template);
                      setCurrentStep(2);
                    }}
                  />
                )}

                {currentStep === 2 && (
                  <Topics
                    template={selectedTemplate}
                    selectedAtoms={selectedAtoms}
                    setSelectedAtoms={setSelectedAtoms}
                  />
                )}

                {currentStep === 3 && (
                  <ActivitiesDraft activities={activities} setActivities={setActivities} />
                )}

                {currentStep === 4 && (
                  <ReviewAndSubmit
                    template={selectedTemplate}
                    topics={selectedAtoms}
                    activities={activities}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        {isSidebarOpen && (
          <div className={styles.sidebar}>
            <button className={styles.closeSidebarBtn} onClick={() => setIsSidebarOpen(false)}>
              ✕
            </button>

            <h2>Educator Collaboration</h2>

            <div className={styles.statusBox}>
              <strong>Status: Draft Ready</strong>
              <p>Your lesson plan looks great! Ready for educator review.</p>
            </div>

            <h3>Recent Comments</h3>
            <div className={styles.commentThread}>
              {comments.map((c, i) => (
                <div key={i} className={styles.commentItem}>
                  <small>{c.time}</small>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>

            <h3>Ask a Question</h3>
            <textarea
              className={styles.chatInput}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button className={styles.sendButton} onClick={sendComment}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlan;
