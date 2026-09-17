import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Badge, Collapse, Row, Col, Progress } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faList,
  faChevronDown,
  faChevronUp,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
  faFileAlt,
  faCalendar,
  faWeight,
  faComments,
  faDownload,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { getStatusInfo } from './mockData_new';
import styles from './TaskDetailsList.module.css';

const TaskDetailsList = ({ tasks, selectedCategory = 'all', categories, isLoading }) => {
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState(selectedCategory);
  const [sortBy, setSortBy] = useState('dueDate');

  // Update local filter when parent category changes
  React.useEffect(() => {
    setFilterCategory(selectedCategory);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <Card className={styles.tasksCard}>
        <CardBody>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading task details...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card className={styles.tasksCard}>
        <CardBody>
          <div className={styles.noDataContainer}>
            <FontAwesomeIcon icon={faList} className={styles.noDataIcon} />
            <p className={styles.noDataText}>No task details available yet.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const toggleTaskExpansion = taskId => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filterCategory === 'all') return true;
      // Handle both category name and category id formats
      return task.category === filterCategory || task.category === filterCategory.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'score') {
        return b.percentage - a.percentage;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  const getTaskTypeIcon = type => {
    if (type?.toLowerCase().includes('exam')) return faFileAlt;
    if (type?.toLowerCase().includes('quiz')) return faCheckCircle;
    if (type?.toLowerCase().includes('project')) return faEye;
    return faFileAlt;
  };

  const getCategoryColor = category => {
    const colors = {
      assignments: '#3b82f6',
      quizzes: '#10b981',
      exams: '#f59e0b',
      projects: '#8b5cf6',
    };
    return colors[category] || '#6b7280';
  };

  // Create dropdown options from parent categories or fallback to task categories
  const categoryOptions = categories
    ? ['all', ...categories.map(cat => cat.name.toLowerCase())]
    : ['all', ...new Set(tasks.map(task => task.category))];

  return (
    <Card className={styles.tasksCard}>
      <CardHeader className={styles.tasksHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <FontAwesomeIcon icon={faList} className={styles.headerIcon} />
            <div>
              <h4 className={styles.headerTitle}>
                {filterCategory === 'all'
                  ? 'Task Details'
                  : `${filterCategory.charAt(0).toUpperCase() + filterCategory.slice(1)} Tasks`}
              </h4>
              <p className={styles.headerSubtitle}>
                {filterCategory === 'all'
                  ? 'Detailed breakdown of all assignments and assessments'
                  : `Showing ${filteredTasks.length} ${filterCategory} task${
                      filteredTasks.length !== 1 ? 's' : ''
                    }`}
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Badge color="info" className={styles.countBadge}>
              {filteredTasks.length} tasks
            </Badge>
            {filterCategory !== 'all' && (
              <Badge color="primary" className={styles.filterBadge}>
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className={styles.controlsSection}>
          <div className={styles.filterControls}>
            <div className={styles.filterGroup}>
              <label htmlFor="categoryFilter" className={styles.filterLabel}>
                Category:
              </label>
              <select
                id="categoryFilter"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category === 'all'
                      ? 'All Categories'
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="sortByFilter" className={styles.filterLabel}>
                Sort by:
              </label>
              <select
                id="sortByFilter"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="dueDate">Due Date</option>
                <option value="score">Score</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.tasksBody}>
        <div className={styles.tasksList}>
          {filteredTasks.map(task => {
            const isExpanded = expandedTasks.has(task.id);
            const statusInfo = getStatusInfo(task.status);
            const categoryColor = getCategoryColor(task.category);
            const isOverdue = new Date(task.dueDate) < new Date() && task.status === 'Missing';

            return (
              <div
                key={task.id}
                className={`${styles.taskCard} ${isOverdue ? styles.overdue : ''}`}
              >
                {/* Task Header */}
                <div
                  className={styles.taskHeader}
                  onClick={() => toggleTaskExpansion(task.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTaskExpansion(task.id);
                    }
                  }}
                >
                  <div className={styles.taskInfo}>
                    <div className={styles.taskIcon}>
                      <FontAwesomeIcon
                        icon={getTaskTypeIcon(task.type)}
                        style={{ color: categoryColor }}
                      />
                    </div>
                    <div className={styles.taskMain}>
                      <h5 className={styles.taskName}>{task.name}</h5>
                      <div className={styles.taskMeta}>
                        <Badge
                          color="light"
                          className={styles.categoryBadge}
                          style={{ borderColor: categoryColor, color: categoryColor }}
                        >
                          {task.category}
                        </Badge>
                        <Badge color="secondary" className={styles.typeBadge}>
                          {task.type}
                        </Badge>
                        <span className={styles.weightInfo}>
                          <FontAwesomeIcon icon={faWeight} className={styles.weightIcon} />
                          {task.weightage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.taskSummary}>
                    <div className={styles.scoreDisplay}>
                      <div className={styles.scoreNumber} style={{ color: categoryColor }}>
                        {task.percentage}%
                      </div>
                      <div className={styles.scoreBreakdown}>
                        {task.earnedMarks}/{task.totalMarks}
                      </div>
                    </div>
                    <div className={styles.statusSection}>
                      <Badge
                        color={
                          statusInfo.color === '#10b981'
                            ? 'success'
                            : statusInfo.color === '#f59e0b'
                            ? 'warning'
                            : 'danger'
                        }
                        className={styles.statusBadge}
                      >
                        <FontAwesomeIcon icon={statusInfo.icon} className={styles.statusIcon} />
                        {statusInfo.label}
                      </Badge>
                      <div className={styles.dueDateInfo}>
                        <FontAwesomeIcon icon={faCalendar} className={styles.dueDateIcon} />
                        <span className={styles.dueDateText}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.expandToggle}>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className={styles.expandIcon}
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <Collapse isOpen={isExpanded}>
                  <div className={styles.taskDetails}>
                    {/* Progress Bar */}
                    <div className={styles.progressSection}>
                      <Progress
                        value={task.percentage}
                        color={
                          task.percentage >= 90
                            ? 'success'
                            : task.percentage >= 80
                            ? 'primary'
                            : task.percentage >= 70
                            ? 'warning'
                            : 'danger'
                        }
                        className={styles.taskProgress}
                      />
                      <div className={styles.progressLabel}>
                        Score: {task.percentage}% ({task.earnedMarks}/{task.totalMarks} points)
                      </div>
                    </div>

                    {/* Submission Info */}
                    <Row className={styles.detailsRow}>
                      <Col md={6}>
                        <div className={styles.detailSection}>
                          <h6 className={styles.detailTitle}>Submission Details</h6>
                          <div className={styles.detailItem}>
                            <strong>Submitted:</strong>{' '}
                            {task.submittedDate
                              ? new Date(task.submittedDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Not submitted'}
                          </div>
                          <div className={styles.detailItem}>
                            <strong>Due Date:</strong>{' '}
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {task.timeSpent && (
                            <div className={styles.detailItem}>
                              <strong>Time Spent:</strong> {task.timeSpent}
                            </div>
                          )}
                          {task.attempts && (
                            <div className={styles.detailItem}>
                              <strong>Attempts:</strong> {task.attempts}
                              {task.maxAttempts && ` / ${task.maxAttempts}`}
                            </div>
                          )}
                        </div>
                      </Col>

                      <Col md={6}>
                        <div className={styles.detailSection}>
                          <h6 className={styles.detailTitle}>Additional Info</h6>
                          {task.rubricScores && (
                            <div className={styles.rubricSection}>
                              <strong>Rubric Breakdown:</strong>
                              <div className={styles.rubricScores}>
                                {Object.entries(task.rubricScores).map(([criteria, score]) => (
                                  <div key={criteria} className={styles.rubricItem}>
                                    <span className={styles.rubricCriteria}>{criteria}:</span>
                                    <span className={styles.rubricScore}>
                                      {score.earned}/{score.total}
                                    </span>
                                    <Progress
                                      value={(score.earned / score.total) * 100}
                                      color="primary"
                                      className={styles.rubricProgress}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.sections && (
                            <div className={styles.sectionsInfo}>
                              <strong>Exam Sections:</strong>
                              <div className={styles.sectionScores}>
                                {Object.entries(task.sections).map(([section, score]) => (
                                  <div key={section} className={styles.sectionItem}>
                                    <span className={styles.sectionName}>{section}:</span>
                                    <span className={styles.sectionScore}>
                                      {score.earned}/{score.total}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.technologies && (
                            <div className={styles.technologiesInfo}>
                              <strong>Technologies:</strong>
                              <div className={styles.techTags}>
                                {task.technologies.map(tech => (
                                  <Badge key={tech} color="secondary" className={styles.techTag}>
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* Teacher Feedback */}
                    {task.teacherFeedback && (
                      <div className={styles.feedbackSection}>
                        <h6 className={styles.detailTitle}>
                          <FontAwesomeIcon icon={faComments} className={styles.feedbackIcon} />
                          Teacher Feedback
                        </h6>
                        <div className={styles.feedbackContent}>
                          <p className={styles.feedbackText}>{task.teacherFeedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div className={styles.attachmentsSection}>
                        <h6 className={styles.detailTitle}>
                          <FontAwesomeIcon icon={faDownload} className={styles.attachmentIcon} />
                          Attachments
                        </h6>
                        <div className={styles.attachmentsList}>
                          {task.attachments.map(attachment => (
                            <div key={attachment} className={styles.attachmentItem}>
                              <FontAwesomeIcon icon={faFileAlt} className={styles.fileIcon} />
                              <span className={styles.fileName}>{attachment}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default TaskDetailsList;
