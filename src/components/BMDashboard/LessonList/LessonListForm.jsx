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
  const [sortOption, setSortOption] = useState('1');

  useEffect(() => {
    dispatch(fetchBMLessons());
  }, []);
  const getWeekNumber = date => {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    // Set to the first day of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    // Get first day of year
    const start = new Date(currentDate.getFullYear(), 0, 1);

    // Calculate full weeks to the first day of the week
    const weekNumber = Math.ceil(((currentDate - start) / 86400000 + 1) / 7);

    return weekNumber;
  };

  const isInThisWeek = date => {
    // Convert the date string to a Date object with consistent formatting
    const lessonDate = new Date(date);

    const currentDate = new Date();

    // Check if the year and week are the same
    if (
      currentDate.getFullYear() === lessonDate.getFullYear() &&
      getWeekNumber(currentDate) === getWeekNumber(lessonDate)
    ) {
      // Check if the difference in days is within the same week
      const dayDifference = Math.abs(currentDate - lessonDate) / (1000 * 60 * 60 * 24);
      return dayDifference < 7;
    }

    return false;
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

  useEffect(() => {
    // Update filteredLessons based on the lessons prop
    setFilteredLessons(prevFilteredLessons => {
      return prevFilteredLessons.map(filteredLesson => {
        const updatedLesson = lessons.find(lesson => lesson._id === filteredLesson._id);
        return updatedLesson || filteredLesson;
      });
    });
  }, [lessons]);

  useEffect(() => {
    const filterAndSort = () => {
      // Filter logic
      switch (filterOption) {
        case '2':
          setFilteredLessons(prevLessons => prevLessons.filter(item => isInThisYear(item.date)));
          break;
        case '3':
          setFilteredLessons(prevLessons => prevLessons.filter(item => isInThisMonth(item.date)));
          break;
        case '4':
          setFilteredLessons(prevLessons => prevLessons.filter(item => isInThisWeek(item.date)));
          break;
        default:
          setFilteredLessons(lessons);
          break;
      }

      // Sort logic
      switch (sortOption) {
        case '1':
          setFilteredLessons(prevLessons =>
            [...prevLessons].sort((a, b) => new Date(a.date) - new Date(b.date)),
          );
          break;
        case '2':
          setFilteredLessons(prevLessons =>
            [...prevLessons].sort((a, b) => new Date(b.date) - new Date(a.date)),
          );
          break;
        case '3':
          setFilteredLessons(prevLessons =>
            [...prevLessons].sort((a, b) => b.totalLikes - a.totalLikes),
          );
          break;
        default:
          // Default: no sorting
          break;
      }
    };

    filterAndSort(); // Initial filter and sort when component mounts
  }, [filterOption, sortOption, lessons]);

  const addTag = tag => {
    // Check if the tag already exists
    if (tags.indexOf(tag) === -1) {
      setTags(prevTags => [...prevTags, tag]);
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
  const filterLessonsByTags = () => {
    if (tags.length === 0) {
      // No tags to filter, show all lessons
      setFilteredLessons(lessons);
    } else {
      // Filter lessons based on tags
      setFilteredLessons(
        lessons.filter(lesson => lesson.tag && tags.some(tag => lesson.tag.includes(tag))),
      );
    }
  };

  useEffect(() => {
    filterLessonsByTags();
  }, [tags, lessons]);

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
                  value={sortOption}
                  onChange={event => setSortOption(event.target.value)}
                >
                  <option value="1">Newest</option>
                  <option value="2">Date</option>
                  <option value="3">Likes</option>
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
                onKeyDown={handleInputKeyDown}
                onChange={e => setInputValue(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Form>
        <Lessons
          filteredLessons={filteredLessons}
          setFilteredLessons={setFilteredLessons}
          dispatch={dispatch}
          lessons={lessons}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  lessons: state.lessons.lessons,
});

export default connect(mapStateToProps)(LessonList);
