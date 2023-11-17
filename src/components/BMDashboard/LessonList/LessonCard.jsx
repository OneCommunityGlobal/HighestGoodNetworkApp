import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import './LessonCard.css';

function LessonCard({ dummyData }) {
  const lessonCards = dummyData.map(lesson => (
    <Card key={lesson.id}>
      <Card.Header>
        <Nav className="nav">
          <Nav.Item className="nav-item-title">{lesson.lessonTitle}</Nav.Item>
          <Nav.Item>Date: {lesson.date}</Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Card.Text className="card-tag-and-file">
          Tag:{' '}
          {lesson.tags.map(tag => (
            <span key={`${lesson.id} + ${tag}`} className="tag-item">
              {tag}
            </span>
          ))}
        </Card.Text>
        <Card.Text>{lesson.lessonSummary}</Card.Text>
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
          <span>Edit</span>
          <span>Delete</span>
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
      </Card.Footer>
    </Card>
  ));
  return <ul>{lessonCards}</ul>;
}

export default LessonCard;
