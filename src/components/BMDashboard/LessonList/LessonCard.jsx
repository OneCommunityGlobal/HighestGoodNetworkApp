import { useState } from 'react';
import { useSelector } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import './LessonCard.css';
import ReactHtmlParser from 'react-html-parser';
import { formatDateAndTime } from 'utils/formatDate';
import DeleteLessonCardPopUp from './DeleteLessonCardPopUp';

function LessonCard({ filteredLessons, onEditLessonSummary, onDeliteLessonCard, handleLike }) {
  const maxSummaryLength = 1500;
  const [expandedCards, setExpandedCards] = useState([]);
  const auth = useSelector(state => state.auth);
  const currentUserId = auth.user.userid;
  const [editableLessonId, setEditableLessonId] = useState(null);
  const [editableLessonSummary, setEditableLessonSummary] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [lessonToDeleteId, setLessonToDeleteId] = useState(null);

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
    setExpandedCards(prevExpandedCards => {
      if (prevExpandedCards.includes(lessonId)) {
        // Collapse the clicked card
        return prevExpandedCards.filter(id => id !== lessonId);
      }
      // Expand the clicked card
      return [...prevExpandedCards, lessonId];
    });
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
    return (
      <Card key={lesson._id}>
        <Card.Header onClick={() => toggleCardExpansion(lesson._id)} style={{ cursor: 'pointer' }}>
          <Nav className="nav">
            <div className="nav-title-and-date">
              <Nav.Item className="nav-item-title">{lesson.title}</Nav.Item>
              <Nav.Item className="nav-item-date">Date: {formatDateAndTime(lesson.date)}</Nav.Item>
            </div>
            <div>
              <Nav.Item className="card-tag">
                {lesson.tag.map(tag => (
                  <span key={`${lesson._id} + ${tag}`} className="text-muted tag-item">
                    {`#${tag}`}
                  </span>
                ))}
              </Nav.Item>
            </div>
          </Nav>
        </Card.Header>
        {expandedCards.includes(lesson._id) && (
          <>
            <Card.Body className="scrollable-card-body">
              <Card.Text className="card-tag-and-file">
                Tags:{' '}
                {lesson.tag.map(tag => (
                  <span key={`${lesson._id} + ${tag}`} className="tag-item">
                    {`#${tag}`}
                  </span>
                ))}
              </Card.Text>
              <Card.Text className="lesson-summary">
                {editableLessonId === lesson._id ? (
                  <>
                    <textarea
                      className={`editable-lesson-summary ${validationError ? 'error' : ''}`}
                      value={editableLessonSummary}
                      onChange={e => setEditableLessonSummary(e.target.value)}
                    />
                    {validationError && <span className="validation-error">{validationError}</span>}
                    <button type="submit" onClick={() => handleSaveEdit(lesson._id)}>
                      Save
                    </button>
                    <button type="submit" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <span>
                    {ReactHtmlParser(
                      lesson.content.length > maxSummaryLength
                        ? `${lesson.content.slice(0, maxSummaryLength)}...`
                        : lesson.content,
                    )}
                  </span>
                )}
              </Card.Text>

              <Card.Text className="card-tag-and-file">
                File: <span className="lesson-file">file</span>
              </Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">
              <div>
                <span className="footer-items-author-and-from">Author: {lesson.author.name}</span>
                <span className="footer-items-author-and-from">
                  From: {lesson.relatedProject.name}
                </span>
              </div>
              <div className="footer-items">
                {currentUserId === lesson.author.id && (
                  <div>
                    <button
                      className="text-muted"
                      type="button"
                      onClick={() => handleEdit(lesson._id, lesson.content)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePopup(lesson._id)}
                      className="text-muted"
                      type="button"
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
                      if (e.key === 'Enter') {
                        handleLikeCount(lesson._id, currentUserId);
                      }
                    }}
                    style={{ outline: 'none' }}
                  >
                    <FontAwesomeIcon
                      className="ml-2"
                      icon={faHeart}
                      size="sm"
                      style={{ color: '##7A7D81', cursor: 'pointer' }}
                    />
                    Like:{lesson.totalLikes}
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
        <button type="submit" onClick={() => expandAll()} className="expand-lessons">
          Expand All
        </button>
        <button type="submit" onClick={() => collapseAll()} className="expand-lessons">
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
