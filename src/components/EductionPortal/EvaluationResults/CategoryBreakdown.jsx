import React from 'react';
import { Card, CardBody, CardHeader, Progress, Badge, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faClipboardCheck,
  faQuestion,
  faGraduationCap,
  faProjectDiagram,
  faWeight,
  faCheckCircle,
  faClock,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { getPerformanceLevel, calculateCategoryProgress } from './mockData_new';
import styles from './CategoryBreakdown.module.css';

const CategoryBreakdown = ({ categories, selectedCategory = 'all', isLoading }) => {
  if (isLoading) {
    return (
      <Card className={styles.breakdownCard}>
        <CardBody>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading category breakdown...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className={styles.breakdownCard}>
        <CardBody>
          <div className={styles.noDataContainer}>
            <FontAwesomeIcon icon={faChartPie} className={styles.noDataIcon} />
            <p className={styles.noDataText}>No category data available yet.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Filter categories based on selected category
  const filteredCategories =
    selectedCategory === 'all'
      ? categories
      : categories.filter(category => category.name.toLowerCase() === selectedCategory);

  const getCategoryIcon = categoryId => {
    const icons = {
      assignments: faClipboardCheck,
      quizzes: faQuestion,
      exams: faGraduationCap,
      projects: faProjectDiagram,
    };
    return icons[categoryId] || faClipboardCheck;
  };

  const getStatusIcon = status => {
    if (status === 'excellent') return faCheckCircle;
    if (status === 'good') return faCheckCircle;
    if (status === 'fair') return faClock;
    return faExclamationTriangle;
  };

  return (
    <Card
      className={`${styles.breakdownCard} ${selectedCategory !== 'all' ? styles.filtered : ''}`}
    >
      <CardHeader className={styles.breakdownHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <FontAwesomeIcon icon={faChartPie} className={styles.headerIcon} />
            <div>
              <h4 className={styles.headerTitle}>
                {selectedCategory === 'all'
                  ? 'Category Breakdown'
                  : `${selectedCategory.charAt(0).toUpperCase() +
                      selectedCategory.slice(1)} Performance`}
              </h4>
              <p className={styles.headerSubtitle}>
                {selectedCategory === 'all'
                  ? `Showing all ${categories.length} categories`
                  : `Showing ${filteredCategories.length} selected category`}
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <p className={styles.instructorInfo}>
              Instructor: Dr. Emily Rodriguez • Professor of Computer Science
            </p>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.breakdownBody}>
        <Row className={styles.categoriesGrid}>
          {filteredCategories.map(category => {
            const performanceInfo = getPerformanceLevel(category.percentage);
            const progressInfo = calculateCategoryProgress(category);
            const isOverdue = new Date(category.dueDate) < new Date() && !progressInfo.isComplete;

            return (
              <Col key={category.id} lg={6} className={styles.categoryCol}>
                <div className={`${styles.categoryCard} ${styles[performanceInfo.level]}`}>
                  {/* Category Header */}
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryInfo}>
                      <div className={styles.categoryIconWrapper}>
                        <FontAwesomeIcon
                          icon={getCategoryIcon(category.id)}
                          className={styles.categoryIcon}
                          style={{ color: category.color }}
                        />
                      </div>
                      <div className={styles.categoryDetails}>
                        <h5 className={styles.categoryName}>{category.name}</h5>
                        <p className={styles.categoryDescription}>{category.description}</p>
                      </div>
                    </div>
                    <div className={styles.categoryBadges}>
                      <Badge
                        color={
                          performanceInfo.level === 'excellent'
                            ? 'success'
                            : performanceInfo.level === 'good'
                            ? 'primary'
                            : performanceInfo.level === 'fair'
                            ? 'warning'
                            : 'danger'
                        }
                        className={styles.performanceBadge}
                      >
                        <FontAwesomeIcon
                          icon={getStatusIcon(performanceInfo.level)}
                          className={styles.badgeIcon}
                        />
                        {performanceInfo.label}
                      </Badge>
                      <Badge color="secondary" className={styles.weightBadge}>
                        <FontAwesomeIcon icon={faWeight} className={styles.badgeIcon} />
                        {category.weightage}%
                      </Badge>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className={styles.scoreSection}>
                    <div className={styles.mainScore}>
                      <div className={styles.scoreNumber}>{category.percentage.toFixed(1)}%</div>
                      <div className={styles.scoreDetails}>
                        <span className={styles.earnedMarks}>{category.earnedMarks}</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.totalMarks}>{category.totalMarks}</span>
                      </div>
                    </div>
                    <div className={styles.progressWrapper}>
                      <Progress
                        value={category.percentage}
                        color={
                          performanceInfo.level === 'excellent'
                            ? 'success'
                            : performanceInfo.level === 'good'
                            ? 'primary'
                            : performanceInfo.level === 'fair'
                            ? 'warning'
                            : 'danger'
                        }
                        className={styles.categoryProgress}
                      />
                      {/* Clear visual indicator instead of confusing lines */}
                      <div className={styles.performanceIndicatorBar}>
                        <div
                          className={`${styles.performanceLevel} ${styles[performanceInfo.level]}`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Completion Status */}
                  <div className={styles.completionSection}>
                    <div className={styles.completionRow}>
                      <div className={styles.completionLabel}>Completion:</div>
                      <div className={styles.completionValue}>
                        {category.completedItems}/{category.totalItems} (
                        {progressInfo.completionRate}%)
                      </div>
                    </div>
                    <div className={styles.submissionStats}>
                      <div className={styles.statItem}>
                        <div
                          className={styles.statDot}
                          style={{ backgroundColor: '#10b981' }}
                        ></div>
                        <span className={styles.statLabel}>
                          On Time: {category.submissions?.onTime || 0}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <div
                          className={styles.statDot}
                          style={{ backgroundColor: '#f59e0b' }}
                        ></div>
                        <span className={styles.statLabel}>
                          Late: {category.submissions?.late || 0}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <div
                          className={styles.statDot}
                          style={{ backgroundColor: '#ef4444' }}
                        ></div>
                        <span className={styles.statLabel}>
                          Missing: {category.submissions?.missing || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date Alerts Section */}
                  {(isOverdue || (!isOverdue && category.dueDate)) && (
                    <div className={styles.alertSection}>
                      {/* Overdue Alert */}
                      {isOverdue && (
                        <div className={styles.overdueAlert}>
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className={styles.alertIcon}
                          />
                          <span className={styles.alertText}>
                            Overdue:{' '}
                            {new Date(category.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}

                      {/* Due Date Info */}
                      {!isOverdue && category.dueDate && (
                        <div className={styles.dueDateInfo}>
                          <FontAwesomeIcon icon={faClock} className={styles.dueDateIcon} />
                          <span className={styles.dueDateText}>
                            Due:{' '}
                            {new Date(category.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Col>
            );
          })}
        </Row>

        {/* Summary Statistics */}
        <div className={styles.summarySection}>
          <h5 className={styles.summaryTitle}>Summary Statistics</h5>
          <Row className={styles.summaryStats}>
            <Col md={3} sm={6}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryNumber}>
                  {categories.reduce((sum, cat) => sum + cat.totalItems, 0)}
                </div>
                <div className={styles.summaryLabel}>Total Items</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryNumber}>
                  {categories.reduce((sum, cat) => sum + cat.completedItems, 0)}
                </div>
                <div className={styles.summaryLabel}>Completed</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryNumber}>
                  {Math.round(
                    categories.reduce((sum, cat) => sum + cat.percentage * cat.weightage, 0) /
                      categories.reduce((sum, cat) => sum + cat.weightage, 0),
                  )}
                  %
                </div>
                <div className={styles.summaryLabel}>Weighted Average</div>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryNumber}>
                  {
                    categories.filter(
                      cat => getPerformanceLevel(cat.percentage).level === 'excellent',
                    ).length
                  }
                </div>
                <div className={styles.summaryLabel}>Excellent Categories</div>
              </div>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

export default CategoryBreakdown;
