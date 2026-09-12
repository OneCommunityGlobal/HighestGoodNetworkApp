import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentProfile } from '~/actions/studentActions';
import styles from './StudentProfilePage.module.css';
import { formatByTimeZone } from '../../../utils/formatDate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLocationDot,
  faClock,
  faGraduationCap,
  faCalendarAlt,
  faHandHoldingHand,
} from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { profile, subjectProgress, error } = useSelector(state => state.student);
  const [activeTab, setActiveTab] = useState('Educational Progress');
  const history = useHistory();

  useEffect(() => {
    dispatch(fetchStudentProfile());
  }, [dispatch]);

  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!profile) return <p className={styles.loading}>Loading student profile...</p>;

  const formattedDateJoined = formatByTimeZone(profile.dateJoined, profile.timezone);

  console.log('Student Details:', profile);
  console.log('Subject Progress:', subjectProgress);
  console.log('Subject Progress:', subjectProgress.completionPercentage);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <img src={profile.avatar || '/profilepic.webp'} alt="Student" className={styles.avatar} />
          <div>
            <h2 className={styles.name}>{profile.fullName}</h2>
            <p className={styles.studentId}>Student ID: {profile.studentId}</p>
          </div>
        </div>

        <button className={styles.portfolioBtn} onClick={() => history.push(profile.portfolioLink)}>
          🏆 View Portfolio
        </button>
      </div>

      {/* Info Section */}
      <div className={styles.infoRow}>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faUser} className={styles.icon} />
            Teacher
          </span>
          <span>{profile.teacherName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faHandHoldingHand} className={styles.icon} />
            Support Member
          </span>
          <span>{profile.supportMemberName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.icon} />
            Location
          </span>
          <span>{profile.location}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faGraduationCap} className={styles.icon} />
            Grade Level
          </span>
          <span>{profile.gradeLevel.charAt(0).toUpperCase() + profile.gradeLevel.slice(1)}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            Joined
          </span>
          <span>{formattedDateJoined}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>
            <FontAwesomeIcon icon={faClock} className={styles.icon} />
            Timezone
          </span>
          <span>{profile.timezone}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['Educational Progress', 'Completed Lessons', 'Current Tasks', 'Student Interests'].map(
          tab => (
            <button
              key={tab}
              className={`${styles.tabButton} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Educational Progress Section */}
      {activeTab === 'Educational Progress' && (
        <div className={styles.progressSection}>
          <h3>Educational Progress Overview</h3>
          <p className={styles.subText}>
            Visual representation of learning progress across subjects
          </p>

          <div className={styles.subjectGrid}>
            {subjectProgress?.map(subject => (
              <div key={subject.id} className={styles.subjectCard}>
                <div className={styles.subjectCircleContainer}>
                  {/* The colored circle with text inside */}
                  <div
                    className={styles.subjectCircle}
                    style={{ backgroundColor: subject.color || '#b72828ff' }}
                    // Apply subject color
                  >
                    {subject.name}
                  </div>
                </div>
                {/* Subject name text below the circle */}
                <h4 className={styles.subjectNameBelow}>{subject.name}</h4>
                <div className={styles.progressDetails}>
                  <p>✅ {subject.completed} completed</p>
                  <p>🟣 {subject.inProgress} in progress</p>
                  <p>⚪ {subject.remaining} remaining</p>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      // Use the percentage directly from the API data
                      width: `${subject.completionPercentage || 0}%`,
                      // Set the fill color to match the subject's color
                      backgroundColor: subject.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
