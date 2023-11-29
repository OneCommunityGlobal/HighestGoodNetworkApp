import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import './LessonCard.css';

function LessonCard({ dummyData }) {
  const maxSummaryLength = 1500;
  // State to manage the expansion/collapse of each card
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleCardExpansion = lessonId => {
    setExpandedCards(prevExpandedCards => {
      if (prevExpandedCards.includes(lessonId)) {
        // Collapse the clicked card
        return prevExpandedCards.filter(id => id !== lessonId);
      } else {
        // Expand the clicked card
        return [...prevExpandedCards, lessonId];
      }
    });
  };
  const expandAll = () => {
    setExpandedCards(dummyData.map(lesson => lesson.id));
  };

  const collapseAll = () => {
    setExpandedCards([]);
  };

  const lessonCards = dummyData.map(lesson => (
    <Card key={lesson.id}>
      <Card.Header onClick={() => toggleCardExpansion(lesson.id)} style={{ cursor: 'pointer' }}>
        <Nav className="nav">
          <div className="nav-title-and-date">
            <Nav.Item className="nav-item-title">{lesson.lessonTitle}</Nav.Item>
            <Nav.Item className="nav-item-date">Date: {lesson.date}</Nav.Item>
          </div>
          <div>
            <Nav.Item className="card-tag">
              {lesson.tags.map(tag => (
                <span key={`${lesson.id} + ${tag}`} className="text-muted tag-item">
                  {`#${tag}`}
                </span>
              ))}
            </Nav.Item>
          </div>
        </Nav>
      </Card.Header>
      {expandedCards.includes(lesson.id) && (
        <>
          <Card.Body className="scrollable-card-body">
            <Card.Text className="card-tag-and-file">
              Tags:{' '}
              {lesson.tags.map(tag => (
                <span key={`${lesson.id} + ${tag}`} className="tag-item">
                  {`#${tag}`}
                </span>
              ))}
            </Card.Text>
            <Card.Text className="lesson-summary">
              {lesson.lessonSummary.length > maxSummaryLength
                ? `${lesson.lessonSummary.slice(0, maxSummaryLength)}...`
                : lesson.lessonSummary}
            </Card.Text>
            <Card.Text className="card-tag-and-file">
              File: <span className="lesson-file">{lesson.file}</span>
            </Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">
            <div>
              <span className="footer-items-author-and-from">
                Author: {lesson.firstName} {lesson.lastName}
              </span>
              <span className="footer-items-author-and-from">From: {lesson.project}</span>
            </div>
            <div className="footer-items">
              <div>
                <button className="text-muted" type="button">
                  Edit
                </button>
                <button className="text-muted" type="button">
                  Delete
                </button>
              </div>
              <div>
                <span>
                  <FontAwesomeIcon
                    className="ml-2"
                    icon={faHeart}
                    size="sm"
                    style={{ color: '##7A7D81', cursor: 'pointer' }}
                  />
                  Like:0
                </span>
              </div>
            </div>
          </Card.Footer>
        </>
      )}
    </Card>
  ));

  return (
    <div>
      <div style={{ textAlign: 'right' }}>
        <button onClick={() => expandAll()} className="expand-lessons">
          Expand All
        </button>
        <button onClick={() => collapseAll()} className="expand-lessons">
          Collapse All
        </button>
      </div>
      {lessonCards}
    </div>
  );
}

export default LessonCard;
