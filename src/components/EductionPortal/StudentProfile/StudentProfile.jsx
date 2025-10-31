import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getEducatorStudentProgress } from '../../../services/educationService';
import styles from './StudentProfile.module.css';

const SubjectCard = ({ subject, completed, inProgress, remaining, onClick }) => {
  const total = completed + inProgress + remaining;
  const getSubjectDisplayName = name => {
    if (name.toLowerCase().includes('arts') && name.toLowerCase().includes('trade')) {
      return 'Arts/Trades';
    }
    if (name.toLowerCase().includes('social') && name.toLowerCase().includes('studies')) {
      return 'Social Studies';
    }
    if (name.toLowerCase().includes('tech') && name.toLowerCase().includes('innovation')) {
      return 'Tech & Innovation';
    }

    if (name.length <= 12) {
      return name;
    }

    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 8) + (name.length > 8 ? '...' : '');
    } else {
      if (words.length <= 3) {
        return words.join(' ');
      } else {
        return words.slice(0, 2).join(' ') + '...';
      }
    }
  };

  const getSubjectColor = name => {
    const n = name.toLowerCase();
    if (
      n.includes('math') ||
      n.includes('algebra') ||
      n.includes('geometry') ||
      n.includes('calculus')
    ) {
      return 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)';
    }
    if (
      n.includes('english') ||
      n.includes('language') ||
      n.includes('literature') ||
      n.includes('writing')
    ) {
      return 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)';
    }
    if (
      n.includes('science') ||
      n.includes('biology') ||
      n.includes('chemistry') ||
      n.includes('physics')
    ) {
      return 'linear-gradient(135deg, #00bcd4 0%, #009688 100%)';
    }
    if (n.includes('art') || n.includes('trade') || n.includes('craft') || n.includes('design')) {
      return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    }
    if (
      n.includes('health') ||
      n.includes('wellness') ||
      n.includes('fitness') ||
      n.includes('nutrition')
    ) {
      return 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)';
    }
    if (
      n.includes('social') ||
      n.includes('history') ||
      n.includes('geography') ||
      n.includes('culture')
    ) {
      return 'linear-gradient(135deg, #795548 0%, #5d4037 100%)';
    }
    if (
      n.includes('tech') ||
      n.includes('computer') ||
      n.includes('coding') ||
      n.includes('innovation')
    ) {
      return 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)';
    }
    if (
      n.includes('value') ||
      n.includes('ethics') ||
      n.includes('character') ||
      n.includes('moral')
    ) {
      return 'linear-gradient(135deg, #e91e63 0%, #ad1457 100%)';
    }
    if (n.includes('music') || n.includes('audio')) {
      return 'linear-gradient(135deg, #ff5722 0%, #d84315 100%)';
    }
    if (n.includes('sport') || n.includes('physical') || n.includes('exercise')) {
      return 'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)';
    }
    if (n.includes('business') || n.includes('economics') || n.includes('finance')) {
      return 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)';
    }

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)',
      'linear-gradient(135deg, #009688 0%, #00796b 100%)',
      'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
      'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
      'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
      'linear-gradient(135deg, #ff5722 0%, #e64a19 100%)',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={styles.subjectCard}
      onClick={onClick}
      onKeyPress={e => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
    >
      <div className={styles.subjectIcon} style={{ background: getSubjectColor(subject) }}>
        <span className={styles.subjectIconText}>{getSubjectDisplayName(subject)}</span>
      </div>
      <h3 className={styles.subjectName}>{subject}</h3>
      <div className={styles.stats}>
        <div>🟡 {completed} completed</div>
        <div>🟢 {inProgress} in progress</div>
        <div>⚫ {remaining} remaining</div>
      </div>
      <div className={styles.progressBars}>
        <div
          className={styles.bar}
          style={{
            width: `${total > 0 ? (completed / total) * 100 : 0}%`,
            backgroundColor: '#FFD700',
          }}
        />
        <div
          className={styles.bar}
          style={{
            width: `${total > 0 ? (inProgress / total) * 100 : 0}%`,
            backgroundColor: '#4CAF50',
          }}
        />
        <div
          className={styles.bar}
          style={{
            width: `${total > 0 ? (remaining / total) * 100 : 0}%`,
            backgroundColor: '#BDBDBD',
          }}
        />
      </div>
    </div>
  );
};

const MoleculeChart = ({ subject, completedAtoms, inProgressAtoms, notStartedAtoms }) => {
  const [tooltip, setTooltip] = useState(null);
  const TOTAL_MOLECULES = 25;
  const createMolecules = () => {
    const molecules = [];
    const allRealAtoms = [
      ...completedAtoms.map(atom => ({ ...atom, status: 'completed' })),
      ...inProgressAtoms.map(atom => ({ ...atom, status: 'in_progress' })),
      ...notStartedAtoms.map(atom => ({ ...atom, status: 'not_started' })),
    ];

    for (let i = 0; i < TOTAL_MOLECULES; i++) {
      if (i < allRealAtoms.length) {
        molecules.push(allRealAtoms[i]);
      } else {
        molecules.push({
          atomId: `${subject}-molecule-${i}`,
          name: `${subject} Module ${i + 1}`,
          status: 'not_started',
          difficulty: 'medium',
          description: `Learning module for ${subject}`,
          isPlaceholder: true,
        });
      }
    }

    return molecules;
  };

  const allAtoms = createMolecules();

  const getPositions = count => {
    const positions = [];
    const centerX = 150,
      centerY = 150;

    if (count === 0) return positions;

    const circles = [
      { radius: 0, maxAtoms: 1 },
      { radius: 40, maxAtoms: 6 },
      { radius: 75, maxAtoms: 10 },
      { radius: 110, maxAtoms: 8 },
    ];

    let atomIndex = 0;

    for (const circle of circles) {
      if (atomIndex >= count) break;

      const atomsInThisCircle = Math.min(circle.maxAtoms, count - atomIndex);

      if (circle.radius === 0) {
        positions.push({ x: centerX, y: centerY });
        atomIndex++;
      } else {
        for (let i = 0; i < atomsInThisCircle; i++) {
          const angle = (i / atomsInThisCircle) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + circle.radius * Math.cos(angle);
          const y = centerY + circle.radius * Math.sin(angle);
          positions.push({ x, y });
          atomIndex++;
        }
      }
    }

    return positions;
  };

  const positions = getPositions(TOTAL_MOLECULES);

  return (
    <div className={styles.chartContainer}>
      <svg viewBox="0 0 300 300" className={styles.svg}>
        <circle cx="150" cy="150" r="140" fill="#E8F5E9" stroke="#D4EDDA" strokeWidth="1" />

        {allAtoms.map((atom, i) => {
          const pos = positions[i];
          if (!pos) return null;

          return (
            <g key={i}>
              {atom.status === 'completed' ? (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill="#FFD700"
                  stroke="#FFA500"
                  strokeWidth="2"
                  className={styles.completedMolecule}
                  onMouseEnter={e => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      atom,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ) : atom.status === 'in_progress' ? (
                <>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill="#9E9E9E"
                    className={styles.inProgressMolecule}
                    onMouseEnter={e => {
                      const rect = e.target.getBoundingClientRect();
                      setTooltip({
                        atom,
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={15}
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="3"
                  />
                </>
              ) : (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={12}
                  fill="#9E9E9E"
                  stroke="#BDBDBD"
                  strokeWidth="1"
                  className={styles.notStartedMolecule}
                  onMouseEnter={e => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({
                      atom,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              )}
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
          <h4>{tooltip.atom.name}</h4>
          <p>Status: {tooltip.atom.status.replace('_', ' ')}</p>
          {tooltip.atom.difficulty && <p>Difficulty: {tooltip.atom.difficulty}</p>}
        </div>
      )}
    </div>
  );
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStudentProgress();
  }, [studentId]);

  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape' && showModal) {
        handleCloseModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showModal]);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEducatorStudentProgress(studentId);
      setStudentData(data);
    } catch (err) {
      setError('Failed to load student progress data');
      toast.error('Failed to load student progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPortfolio = () => {
    // Navigate to student portfolio page (to be implemented)
    toast.info('Portfolio view coming soon');
  };

  const handleViewDailyLog = () => {
    // Navigate to daily log activity (to be implemented)
    toast.info('Daily log view coming soon');
  };

  const handleSubjectClick = subject => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading student progress...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error || 'Student data not found'}</p>
          <button onClick={() => history.goBack()} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { student, progress, summary } = studentData;

  const groupBySubject = atoms => {
    const grouped = {};
    atoms.forEach(atom => {
      const subject = atom.subject || 'Unspecified';
      if (!grouped[subject]) {
        grouped[subject] = [];
      }
      grouped[subject].push(atom);
    });
    return grouped;
  };

  const completedBySubject = groupBySubject(progress.completed);
  const inProgressBySubject = groupBySubject(progress.inProgress);
  const notStartedBySubject = groupBySubject(progress.notStarted);

  // Get all unique subjects
  const allSubjects = new Set([
    ...Object.keys(completedBySubject),
    ...Object.keys(inProgressBySubject),
    ...Object.keys(notStartedBySubject),
  ]);

  const subjects = Array.from(allSubjects);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <button onClick={() => history.goBack()} className={styles.backLink}>
          ← Back
        </button>

        <div className={styles.studentInfo}>
          <div className={styles.avatar}>
            <img
              src={student.profilePic || '/default-avatar.png'}
              alt={`${student.firstName} ${student.lastName}`}
              onError={e => {
                e.target.src = `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=random`;
              }}
            />
          </div>

          <div className={styles.studentDetails}>
            <h1 className={styles.studentName}>
              {student.firstName} {student.lastName}
            </h1>
            <p className={styles.studentId}>
              Student ID: {studentId.substring(0, 8).toUpperCase()}
            </p>
          </div>

          <button onClick={handleViewPortfolio} className={styles.viewPortfolioBtn}>
            View Portfolio
          </button>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>👨‍🏫</span>
            <div>
              <p className={styles.infoLabel}>Teacher</p>
              <p className={styles.infoValue}>Ms. Sarah Wilson</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>♥</span>
            <div>
              <p className={styles.infoLabel}>Support Member</p>
              <p className={styles.infoValue}>Dr. Michael Chen</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📍</span>
            <div>
              <p className={styles.infoLabel}>Location</p>
              <p className={styles.infoValue}>{student.location || 'San Francisco, CA'}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🕐</span>
            <div>
              <p className={styles.infoLabel}>Timezone</p>
              <p className={styles.infoValue}>PST (UTC-8)</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎓</span>
            <div>
              <p className={styles.infoLabel}>Grade Level</p>
              <p className={styles.infoValue}>
                {student.educationProfile?.learningLevel || '10th Grade'}
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📅</span>
            <div>
              <p className={styles.infoLabel}>Joined</p>
              <p className={styles.infoValue}>8/3/2024</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <p className={styles.infoLabel}>Completed Lessons</p>
              <p className={styles.infoValue}>
                {summary.totalCompleted}/{summary.totalAtoms}
              </p>
            </div>
            <button onClick={handleViewDailyLog} className={styles.linkButton}>
              View Daily Log Activity
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.tabActive}`}>Educational Progress</button>
        <button className={styles.tab}>Completed Lessons</button>
        <button className={styles.tab}>Current Tasks</button>
        <button className={styles.tab}>Student Interests</button>
      </div>

      {/* Progress Overview Section */}
      <div className={styles.progressSection}>
        <h2 className={styles.sectionTitle}>Educational Progress Overview</h2>
        <p className={styles.sectionSubtitle}>
          Visual representation of learning progress across subjects
        </p>

        <div className={styles.chartsGrid}>
          {subjects.length > 0 ? (
            subjects.map(subject => (
              <SubjectCard
                key={subject}
                subject={subject}
                completed={(completedBySubject[subject] || []).length}
                inProgress={(inProgressBySubject[subject] || []).length}
                remaining={(notStartedBySubject[subject] || []).length}
                onClick={() => handleSubjectClick(subject)}
              />
            ))
          ) : (
            <div className={styles.noData}>
              <p>No progress data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.summarySection}>
        <div className={styles.statCard}>
          <h3>Total Completed</h3>
          <p className={styles.statNumber}>{summary.totalCompleted}</p>
        </div>
        <div className={styles.statCard}>
          <h3>In Progress</h3>
          <p className={styles.statNumber}>{summary.totalInProgress}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Remaining</h3>
          <p className={styles.statNumber}>{summary.totalNotStarted}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Atoms</h3>
          <p className={styles.statNumber}>{summary.totalAtoms}</p>
        </div>
      </div>

      {/* Progress Detail Modal */}
      {showModal && selectedSubject && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            className={styles.modalBackdrop}
            onClick={handleCloseModal}
            aria-label="Close modal"
            type="button"
          />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 id="modal-title">{selectedSubject} Educational Progress</h2>
              <button onClick={handleCloseModal} className={styles.closeBtn}>
                ✕
              </button>
            </div>
            <MoleculeChart
              subject={selectedSubject}
              completedAtoms={completedBySubject[selectedSubject] || []}
              inProgressAtoms={inProgressBySubject[selectedSubject] || []}
              notStartedAtoms={notStartedBySubject[selectedSubject] || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
