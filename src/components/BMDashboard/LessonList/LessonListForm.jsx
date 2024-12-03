import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LessonListForm.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { fetchBMLessons } from 'actions/bmdashboard/lessonsAction';
import Lessons from './Lessons';
import {
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';

function LessonList(props) {
  const { lessons, dispatch } = props;
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteInputValue] = useState('');
  const [filteredLessons, setFilteredLessons] = useState(lessons);
  const [filterOption, setFilterOption] = useState('1');
  const [sortOption, setSortOption] = useState('1');
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [showConfirmModal, setConfirmModal] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both lessons and tags in parallel
        const [lessonsResponse, tagsResponse] = await Promise.all([
          axios.get(`${ENDPOINTS.BM_LESSONS}`),
          axios.get(`${ENDPOINTS.BM_TAGS}`)
        ]);
  
        // Update Redux store 
        dispatch({
          type: 'SET_LESSONS',
          payload: lessonsResponse.data
        });
  
        // Update available tags
        setAvailableTags(tagsResponse.data);
        
        // Update filtered lessons
        setFilteredLessons(lessonsResponse.data);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      }
    };
  
    fetchData();
  }, []);

  const getFilteredTags = () => {
    return availableTags.filter(tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) && 
      !tags.includes(tag)
    );
  };

  const getFilteredTagsToDelete = () => {
    return availableTags.filter(tag => 
      tag.toLowerCase().includes(deleteValue.toLowerCase())
    );
  }

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

  const ConfirmationModal = () => (
    <Modal isOpen={showConfirmModal} toggle={() => setConfirmModal(false)}>
      <ModalBody>
        <p>Whoa tiger! This is a very aggressive move… please confirm you are SURE you want to do this. Deleting tags cannot be undone and removes them from every lesson that uses them, not just this one.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={() => {
          handleDeleteTags();
          setConfirmModal(false);
        }}>
          Yep, I'm sure, scratch them!
        </Button>
        <Button color="secondary" onClick={() => setConfirmModal(false)}>
          No, take me back!
        </Button>
      </ModalFooter>
    </Modal>
  );

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
    const handleClickOutside = event => {
      if (!event.target.closest('.tags-input-container')) {
        setShowDropdown(false);
        setShowDeleteDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

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

  const addDeleteTag = tag => {
    if (!tagsToDelete.includes(tag)) {
      setTagsToDelete(prev => [...prev, tag]);
    }
    setDeleteInputValue('');
    setShowDeleteDropdown(false);
  }

  const handleInputKeyDown = event => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const handleDeleteKeyDown = event => {
    if (event.key === 'Enter' && deleteValue.trim()) {
      addDeleteTag(deleteValue.trim());
    }
  };

  const handleDeleteButtonClick = () => {
    setConfirmModal(true);
  }

  const handleDeleteTags = async() => {
    try {
      const tagExistsChecks = tagsToDelete.map(tag => 
        availableTags.includes(tag)
      );

      if (tagExistsChecks.includes(false)) {
        toast.error("One or more tags don't exist");
        return;
      }
      
      const deletePromises = tagsToDelete.map(tag => 
        axios.delete(`${ENDPOINTS.BM_TAGS}/${tag}`)
      );
      
      // Wait for all deletions to process
      await Promise.all(deletePromises);
      
      const lessonsResponse = await axios.get(`${ENDPOINTS.BM_LESSONS}`);
      
      // Update Redux store 
      dispatch({
        type: 'SET_LESSONS',
        payload: lessonsResponse.data
      });
      
      // filter lessons
      setFilteredLessons(lessonsResponse.data);

      // Update available tags
      const updatedTagsResponse = await axios.get(`${ENDPOINTS.BM_TAGS}`);
      setAvailableTags(updatedTagsResponse.data);
      
      setTagsToDelete([]);
      setConfirmModal(false);
      toast.success('Tags deleted successfully');
      
    } catch (error) {
      console.error('Error deleting tags: ', error);
      toast.error('Failed to delete tags');
    }
  }

  const removeTag = index => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  const filterLessonsByTags = () => {
    let filtered = [...lessons];
  
    // If tags exist
    if (tags.length > 0) {
      filtered = filtered.filter(lesson => 
        lesson.tags && tags.every(tag => lesson.tags.includes(tag))
      );
    }
  
    //  date filtering
    switch (filterOption) {
      case '2':
        filtered = filtered.filter(item => isInThisYear(item.date));
        break;
      case '3':
        filtered = filtered.filter(item => isInThisMonth(item.date));
        break;
      case '4':
        filtered = filtered.filter(item => isInThisWeek(item.date));
        break;
    }
  
    //  apply sorting
    switch (sortOption) {
      case '1':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case '2':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case '3':
        filtered.sort((a, b) => b.totalLikes - a.totalLikes);
        break;
    }
  
    setFilteredLessons(filtered);
  };
  

  useEffect(() => {
    filterLessonsByTags();
  }, [tags, lessons, filterOption, sortOption]);
  

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
          <div className="tags-input-container">
            <InputGroup className="tags-wrapper">
              <input
                type="text"
                placeholder="Select tag"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="form-control"
              />
              {showDropdown && inputValue && (
                <div className="tag-dropdown">
                  {getFilteredTags().map(tag => (
                    <div
                      key={tag}
                      className="tag-dropdown-item"
                      onClick={() => {
                        addTag(tag);
                        setShowDropdown(false);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
              
            </InputGroup>
            <div className="tag-container">
              {tags.map((tag, index) => (
                <div key={index} className="tag">
                  <span>{tag}</span>
                  <Button
                    className = "button-close"
                    onClick={() => removeTag(index)}
                  >
                    x
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Form.Label>Delete Tags (Press enter to add a tag to delete): </Form.Label>
          <div className="tags-input-container">
            <div className="delete-input-wrapper">
              <input
                    type="text"
                    placeholder="Search tag to delete"
                    value={deleteValue}
                    className="form-control-delete"
                    onChange={(e) => {
                      setDeleteInputValue(e.target.value);
                      setShowDeleteDropdown(true);
                    }}
                    onFocus ={()=>setShowDeleteDropdown(true)}
                    onKeyDown={handleDeleteKeyDown}
              />
              {showDeleteDropdown && deleteValue && (
                <div className="tag-dropdown">
                  {getFilteredTagsToDelete().map(tag => (
                    <div
                      key={tag}
                      className="tag-dropdown-item"
                      onClick={() => addDeleteTag(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              )}
              <div className="tag-container">
                {tagsToDelete.map((tag, index) => (
                  <div key={index} className="tag">
                    <span>{tag}</span>
                    <Button
                      className="button-close"
                      onClick={() => {
                        const newTags = tagsToDelete.filter((_, i) => i !== index);
                        setTagsToDelete(newTags);
                      }}
                    >
                      x
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            {tagsToDelete.length > 0 && (
                <Button 
                  style={{ backgroundColor: 'red', marginLeft: '10px' }}
                  onClick={handleDeleteButtonClick}
                >
                  Delete
                </Button>
              )}

              <ConfirmationModal />
          </div>
          
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

