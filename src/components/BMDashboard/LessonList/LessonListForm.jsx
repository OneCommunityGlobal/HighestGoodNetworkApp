import { useState } from 'react';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LessonListForm.css';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';

function LessonList() {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const addTag = tag => {
    if (tag !== '') {
      setTags([...tags, tag]);
      setInputValue('');
    }
  };
  const handleInputKeyDown = event => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const removeTag = index => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  return (
    <div className="main-container">
      <div className="form-container">
        <Form>
          <div>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className="lesson-label">Lesson List</Form.Label>
            </Form.Group>
          </div>
          <div className="form-select-container">
            <div>
              <Form.Group className="single-form" controlId="Form.ControlSelect1">
                <Form.Label>Filter:</Form.Label>
                <FormControl
                  className="single-form-select"
                  as="select"
                  aria-label="Default select example"
                >
                  <option value="1">This Year</option>
                  <option value="2">This Month</option>
                  <option value="3">This Week</option>
                </FormControl>
              </Form.Group>
            </div>
            <div>
              <Form.Group className="single-form" controlId="Form.ControlSelect2">
                {/* By default the lesson can be read by anyone. The author can change the permission to only public to certain roles. */}
                <Form.Label>Sort:</Form.Label>
                <FormControl
                  className="single-form-select"
                  as="select"
                  aria-label="Default select example"
                >
                  <option value="1">Newest</option>
                  <option value="2">Date</option>
                  <option value="2">Likes</option>
                </FormControl>
              </Form.Group>
            </div>
          </div>
          <Form.Group controlId="tagInput">
            <Form.Label>Tags:</Form.Label>
            <InputGroup className="mb-3">
              {tags.map((tag, index) => (
                <div key={tag + index} className="tag">
                  <span>{tag}</span>
                  <Button variant="light" className="close-button" onClick={() => removeTag(index)}>
                    &times;
                  </Button>
                </div>
              ))}
              <FormControl
                placeholder="Add tags"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
            </InputGroup>
          </Form.Group>
        </Form>
        <Card>
          <Card.Header>
            <Nav className="nav">
              <Nav.Item className="nav-item-title">Title</Nav.Item>
              <Nav.Item>Date: MM/DD/YYYY HH.MM.SS</Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Card.Text className="card-tag-and-file">Tag: Weater</Card.Text>
            <Card.Text>Lesson List Summary</Card.Text>
            <Card.Text className="card-tag-and-file">File: xxx.xls</Card.Text>
          </Card.Body>
          <Card.Footer className="text-muted">
            <div>Author: Name Name From: Project 1</div>
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
      </div>
    </div>
  );
}
export default LessonList;
