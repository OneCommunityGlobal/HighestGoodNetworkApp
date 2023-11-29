import { useState } from 'react';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LessonListForm.css';
import Lessons from './Lessons';

function LessonList() {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = event => {
    setInputValue(event.target.value);
  };

  const addTag = tag => {
    // Check if the tag already exists
    if (tags.indexOf(tag) === -1) {
      setTags([...tags, tag]);
    }
    setInputValue('');
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
                <div key={tag} className="tag">
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
        <Lessons />
      </div>
    </div>
  );
}
export default LessonList;
