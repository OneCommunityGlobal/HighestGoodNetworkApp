import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import './LessonCard.css';

function LessonCard({ dummyData }) {
  const maxSummaryLength = 1500;

  const lessonCards = dummyData.map(lesson => (
    <Card key={lesson.id}>
      <Card.Header>
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
    </Card>
  ));

  return (
  <div>
    <ul>{lessonCards}</ul>
    </div>
)}

export default LessonCard;
