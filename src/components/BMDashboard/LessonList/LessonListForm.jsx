import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LessonListForm.css';
import { fetchBMLessons } from 'actions/bmdashboard/lessonsAction';
import Lessons from './Lessons';

function LessonList(props) {
  const { lessons, dispatch } = props;
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredLessons, setFilteredLessons] = useState(lessons);
  const [filterOption, setFilterOption] = useState('1');

  useEffect(() => {
    dispatch(fetchBMLessons());
  }, []);

  useEffect(() => {
    setFilteredLessons([...lessons]);
  }, [lessons]);

  const getWeekNumber = date => {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
  };
  const isInThisWeek = date => {
    const currentDate = new Date();
    const lessonDate = new Date(date);

    // Get the current date's week and the lesson date's week
    const currentWeek = getWeekNumber(currentDate);
    const lessonWeek = getWeekNumber(lessonDate);

    return currentDate.getFullYear() === lessonDate.getFullYear() && currentWeek === lessonWeek;
  };
  const isInThisYear = date => {
    const currentDate = new Date();
    const lessonDate = new Date(date);
    return currentDate.getFullYear() === lessonDate.getFullYear();
  };

  const isInThisMonth = date => {
    const currentDate = new Date();
    const lessonDate = new Date(date);
    return (
      currentDate.getFullYear() === lessonDate.getFullYear() &&
      currentDate.getMonth() === lessonDate.getMonth()
    );
  };
  const filterLessons = () => {
    switch (filterOption) {
      case '2':
        setFilteredLessons(lessons.filter(item => isInThisYear(item.date)));
        break;
      case '3':
        setFilteredLessons(lessons.filter(item => isInThisMonth(item.date)));
        break;
      case '4':
        setFilteredLessons(lessons.filter(item => isInThisWeek(item.date)));
        break;
      default:
        setFilteredLessons(lessons);
        break;
    }
  };

  useEffect(() => {
    filterLessons();
  }, [lessons, filterOption]);

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
                  value={filterOption}
                  onChange={event => setFilterOption(event.target.value)}
                >
                  <option value="1">Select a Filter</option>
                  <option value="2">This Year</option>
                  <option value="3">This Month</option>
                  <option value="4">This Week</option>
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
        <Lessons
          filteredLessons={filteredLessons}
          setFilteredLessons={setFilteredLessons}
          dispatch={dispatch}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  lessons: state.lessons.lessons,
});

export default connect(mapStateToProps)(LessonList);
