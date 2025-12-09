import { useState } from 'react';
import { useSelector } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import parse from 'html-react-parser';
import { formatDateAndTime } from '~/utils/formatDate';
import DeleteLessonCardPopUp from './DeleteLessonCardPopUp';
import styles from './LessonCard.module.css';

function LessonCard({ filteredLessons, onEditLessonSummary, onDeliteLessonCard, handleLike }) {
  const maxSummaryLength = 1500;
  const [expandedCards, setExpandedCards] = useState([]);
  const [editableLessonId, setEditableLessonId] = useState(null);
  const [editableLessonSummary, setEditableLessonSummary] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [lessonToDeleteId, setLessonToDeleteId] = useState(null);

  const auth = useSelector(state => state.auth);
  const currentUserId = auth.user.userid;
  const lessons = useSelector(state => state.lessons.lessons);

  const getLikeStatus = lessonId => {
    const lesson = lessons.find(l => l._id === lessonId);
    return {
      isLiked: lesson?.likes?.includes(currentUserId),
      totalLikes: lesson?.totalLikes || 0,
    };
  };

  const handleEdit = (lessonId, lessonSummary) => {
    setEditableLessonId(lessonId);
    setEditableLessonSummary(lessonSummary);
  };

  const handleCancelEdit = () => {
    setEditableLessonId(null);
    setEditableLessonSummary('');
  };

  const handleSaveEdit = lessonId => {
    if (editableLessonSummary.trim() !== '') {
      onEditLessonSummary(lessonId, editableLessonSummary);
      setEditableLessonId(null);
      setEditableLessonSummary('');
      setValidationError('');
    } else {
      setValidationError('Summary cannot be empty.');
    }
  };

  const toggleCardExpansion = lessonId => {
    setExpandedCards(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId],
    );
  };

  const expandAll = () => {
    setExpandedCards(filteredLessons.map(lesson => lesson._id));
  };

  const collapseAll = () => {
    setExpandedCards([]);
  };

  const handleDeletePopup = lessonId => {
    setShowDeletePopup(!showDeletePopup);
    setLessonToDeleteId(lessonId);
  };

  const handleLikeCount = (lessonId, userId) => {
    handleLike(lessonId, userId);
  };

  const lessonCards = filteredLessons.map(lesson => {
    const { isLiked, totalLikes } = getLikeStatus(lesson._id);

    return (
      <Card key={lesson._id} className={styles.lessonCard}>
        <Card.Header
          onClick={() => toggleCardExpansion(lesson._id)}
          style={{ cursor: 'pointer' }}
          className={styles.lessonCardHeader}
        >
          <Nav className={styles.lessonCardNav}>
            <div className={styles.navTitleAndDate}>
              <Nav.Item className={`${styles.lessonCardNavItem} ${styles.navItemTitle}`}>
                {lesson.title}
              </Nav.Item>
              <Nav.Item className={`${styles.lessonCardNavItem} nav-item-date`}>
                Date: {formatDateAndTime(lesson.date)}
              </Nav.Item>
            </div>

            <div>
              <Nav.Item className={styles.lessonCardTag}>
                {lesson.tags?.length > 0 &&
                  lesson.tags.map(tag => (
                    <span
                      key={`tag-in-header-${tag}-${lesson._id}`}
                      className={`text-muted ${styles.tagItem}`}
                    >
                      #{tag}
                    </span>
                  ))}
              </Nav.Item>
            </div>
          </Nav>
        </Card.Header>

        {expandedCards.includes(lesson._id) && (
          <>
            <Card.Body className={styles.scrollableCardBody}>
              <Card.Text className={styles.cardTagAndFile}>
                Tags:{' '}
                {lesson.tags?.length > 0 &&
                  lesson.tags.map(tag => (
                    <span
                      key={`tag-in-body-${tag}-${lesson._id}`}
                      className={`text-muted ${styles.tagItem}`}
                    >
                      #{tag}
                    </span>
                  ))}
              </Card.Text>

              <Card.Text className={styles.lessonSummary}>
                {editableLessonId === lesson._id ? (
                  <>
                    <textarea
                      className={`editable-lesson-summary ${validationError ? 'error' : ''}`}
                      value={editableLessonSummary}
                      onChange={e => setEditableLessonSummary(e.target.value)}
                    />
                    {validationError && (
                      <span className={styles.validationError}>{validationError}</span>
                    )}
                    <button type="submit" onClick={() => handleSaveEdit(lesson._id)}>
                      Save
                    </button>
                    <button type="submit" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <span>
                    {parse(
                      lesson.content.length > maxSummaryLength
                        ? `${lesson.content.slice(0, maxSummaryLength)}...`
                        : lesson.content,
                    )}
                  </span>
                )}
              </Card.Text>

              <Card.Text className={styles.cardTagAndFile}>
                File: <span className={styles.lessonFile}>file</span>
              </Card.Text>
            </Card.Body>

            <Card.Footer className={`${styles.lessonCardFooter} text-muted`}>
              <div>
                <span className={styles.footerItemsAuthorAndFrom}>
                  Author: {lesson.author?.name || 'Unknown'}
                </span>
                <span className={styles.footerItemsAuthorAndFrom}>
                  From: {lesson.relatedProject?.name || 'Unknown Project'}
                </span>
              </div>

              <div className={styles.lessonCardFooterItems}>
                {currentUserId === lesson.author?.id && (
                  <div>
                    <button
                      className="text-muted"
                      type="button"
                      onClick={() => handleEdit(lesson._id, lesson.content)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-muted"
                      type="button"
                      onClick={() => handleDeletePopup(lesson._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}

                <div>
                  <span
                    role="button"
                    tabIndex="0"
                    onClick={() => handleLikeCount(lesson._id, currentUserId)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleLikeCount(lesson._id, currentUserId);
                    }}
                    style={{ outline: 'none' }}
                  >
                    <FontAwesomeIcon
                      className="ml-2"
                      icon={faHeart}
                      size="sm"
                      style={{
                        color: isLiked ? '#ff4d4d' : '#7A7D81',
                        cursor: 'pointer',
                        fill: isLiked ? '#ff4d4d' : 'none',
                      }}
                    />
                    Like: {totalLikes}
                  </span>
                </div>
              </div>
            </Card.Footer>
          </>
        )}
      </Card>
    );
  });

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <button type="submit" onClick={expandAll} className={styles.expandLessons}>
          Expand All
        </button>

        <button type="submit" onClick={collapseAll} className={styles.expandLessons}>
          Collapse All
        </button>
      </div>

      <DeleteLessonCardPopUp
        open={showDeletePopup}
        setDeletePopup={setShowDeletePopup}
        deleteLesson={onDeliteLessonCard}
        lessonId={lessonToDeleteId}
      />

      {lessonCards}
    </div>
  );
}

export default LessonCard;
