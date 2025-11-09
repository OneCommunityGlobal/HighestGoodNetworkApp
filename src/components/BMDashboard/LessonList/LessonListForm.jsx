import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Form, FormControl, InputGroup, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { fetchBMLessons } from '~/actions/bmdashboard/lessonsAction';
import { ENDPOINTS } from '~/utils/URL';
import Lessons from './Lessons';
import ConfirmationModal from './ConfirmationModal';
import styles from './LessonListForm.module.css';

function LessonList(props) {
  const { lessons, dispatch, darkMode } = props;
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteInputValue] = useState('');
  const [filteredLessons, setFilteredLessons] = useState(lessons || []);
  const [filterOption, setFilterOption] = useState('1');
  const [sortOption, setSortOption] = useState('1');
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);

  // Load saved tags from localStorage on mount
  useEffect(() => {
    const savedTags = localStorage.getItem('lessonListSelectedTags');
    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags);
        if (Array.isArray(parsedTags) && parsedTags.length > 0) {
          // Remove duplicates when loading from localStorage
          const uniqueTags = [...new Set(parsedTags)];
          setTags(uniqueTags);
        }
      } catch (error) {
        // If parsing fails, ignore and use empty array
        console.error('Failed to parse saved tags:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchBMLessons());
        const tagsResponse = await axios.get(`${ENDPOINTS.BM_TAGS}`);
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, [dispatch]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (tags.length > 0) {
      localStorage.setItem('lessonListSelectedTags', JSON.stringify(tags));
    } else {
      localStorage.removeItem('lessonListSelectedTags');
    }
  }, [tags]);

  useEffect(() => {
    if (lessons) {
      setFilteredLessons(lessons);
    }
  }, [lessons]);

  const handleDeleteTags = async () => {
    try {
      const tagExistsChecks = tagsToDelete.map(tag => availableTags.includes(tag));

      if (tagExistsChecks.includes(false)) {
        toast.error("One or more tags don't exist");
        return;
      }

      const deletePromises = tagsToDelete.map(tag => axios.delete(`${ENDPOINTS.BM_TAGS}/${tag}`));

      // Wait for all deletions to process
      await Promise.all(deletePromises);

      const lessonsResponse = await axios.get(`${ENDPOINTS.BM_LESSONS}`);

      // Update Redux store
      dispatch({
        type: 'SET_LESSONS',
        payload: lessonsResponse.data,
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
      toast.error('Failed to delete tags');
    }
  };

  const getFilteredTags = () => {
    return availableTags.filter(
      tag => tag.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(tag),
    );
  };

  const getFilteredTagsToDelete = () => {
    return availableTags.filter(tag => tag.toLowerCase().includes(deleteValue.toLowerCase()));
  };

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
    // console.log('Year comparison:', {
    //  date,
    //  currentYear: currentDate.getFullYear(),
    //  lessonYear: lessonDate.getFullYear(),
    //  isValid: !isNaN(lessonDate.getTime()),
    // });
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
    setFilteredLessons(prevFilteredLessons => {
      const updated = prevFilteredLessons.map(filteredLesson => {
        const updatedLesson = lessons.find(lesson => lesson._id === filteredLesson._id);
        return updatedLesson || filteredLesson;
      });
      return updated;
    });
  }, [lessons]);

  useEffect(() => {
    const handleClickOutside = event => {
      // Don't close dropdown if clicking on tag close button or tag container
      const buttonClose = event.target.closest('button[aria-label*="Remove"]');
      const tagContainer = event.target.closest(`.${styles.tagContainer}`);

      if (buttonClose || tagContainer) {
        return;
      }

      if (!event.target.closest('.tags-input-container')) {
        setShowDropdown(false);
        setShowDeleteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addTag = tag => {
    // Check if the tag already exists (case-insensitive check)
    const tagLower = tag.toLowerCase();
    const tagExists = tags.some(existingTag => existingTag.toLowerCase() === tagLower);

    if (!tagExists) {
      setTags(prevTags => {
        // Ensure no duplicates when adding
        const newTags = [...prevTags, tag];
        return [...new Set(newTags)];
      });
    }
    setInputValue('');
  };

  const addDeleteTag = tag => {
    if (!tagsToDelete.includes(tag)) {
      setTagsToDelete(prev => [...prev, tag]);
    }
    setDeleteInputValue('');
    setShowDeleteDropdown(false);
  };

  /** 
  const handleInputKeyDown = event => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(inputValue.trim());
    }
  };
  */

  const handleDeleteKeyDown = event => {
    if (event.key === 'Enter' && deleteValue.trim()) {
      addDeleteTag(deleteValue.trim());
    }
  };

  const handleDeleteButtonClick = () => {
    setConfirmModal(true);
  };

  const removeTag = tagToRemove => {
    if (!tagToRemove) return;

    setTags(prevTags => {
      // Filter out the tag to remove, using exact match
      const newTags = prevTags.filter(tag => tag !== tagToRemove);
      return newTags;
    });
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      // console.log('Starting filtering with:', {
      //  lessonsCount: lessons?.length || 0,
      //  firstLesson: lessons?.[0],
      // });
      if (!lessons || !Array.isArray(lessons) || lessons.length === 0) {
        setFilteredLessons([]);
        return;
      }
      let filtered = [...lessons];

      // 1. Apply tag filtering
      if (tags.length > 0) {
        filtered = filtered.filter(lesson => {
          // console.log('Checking lesson:', lesson.title, 'tags:', lesson.tags);
          const hasAllTags = lesson.tags && tags.every(tag => lesson.tags.includes(tag));
          // console.log('Has all tags?', hasAllTags);
          return hasAllTags;
        });
      }

      // 2. Apply date filtering
      // console.log('Before date filtering:', filtered.length, 'lessons');
      switch (filterOption) {
        case '2':
          // console.log('Applying year filter...');
          filtered = filtered.filter(item => {
            const result = isInThisYear(item.date);
            // console.log(`Lesson ${item._id}: ${result}`);
            return result;
          });
          break;
        case '3':
          filtered = filtered.filter(item => isInThisMonth(item.date));
          break;
        case '4':
          filtered = filtered.filter(item => isInThisWeek(item.date));
          break;
        default:
          break;
      }
      // console.log('After date filtering:', filtered.length, 'lessons');

      // 3. Apply sorting
      // console.log(
      //  'Before sorting:',
      //  filtered.map(l => ({ title: l.title, date: l.date })),
      // );
      switch (sortOption) {
        case '1': // Newest
          filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case '2': // Date (oldest)
          filtered = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case '3': // Likes
          filtered = filtered.sort((a, b) => b.totalLikes - a.totalLikes);
          break;
        default:
          break;
      }

      // console.log('Final filtered lessons:', filtered);

      setFilteredLessons(filtered);
    };

    applyFiltersAndSort();
  }, [lessons, tags, filterOption, sortOption]); // All dependencies that should trigger filtering

  return (
    <div className={`${styles.mainContainer}`}>
      <div className={`${styles.formContainer}`}>
        <Form>
          <div>
            <Form.Group controlId="exampleForm.ControlTextarea1">
              <Form.Label className={`${styles.lessonLabel}`}>Lesson List</Form.Label>
            </Form.Group>
          </div>
          <div className={`${styles.formSelectContainer}`}>
            <div>
              <Form.Group className={`${styles.singleForm}`} controlId="Form.ControlSelect1">
                <Form.Label>Filter:</Form.Label>
                <FormControl
                  className={`${styles.singleFormSelect}`}
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
              <Form.Group className={`${styles.singleForm}`} controlId="Form.ControlSelect2">
                <Form.Label>Sort:</Form.Label>
                <FormControl
                  className={`${styles.singleFormSelect}`}
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
            <div className={`${styles.tagsInputContainer}`}>
              <InputGroup className={`${styles.tagsWrapper}`}>
                <input
                  type="text"
                  placeholder="Select tag"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className={`${styles.formControl}`}
                />
                {showDropdown && inputValue && (
                  <div className={`${styles.tagDropdown}`}>
                    {getFilteredTags().map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagDropdownItem}
                        onClick={() => {
                          addTag(tag);
                          setShowDropdown(false);
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </InputGroup>
              {tags.length > 0 && (
                <div
                  className={`${styles.tagContainer} ${darkMode ? styles.tagContainerDark : ''}`}
                >
                  {tags.map((tag, index) => {
                    const handleRemoveClick = e => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeTag(tag);
                    };

                    return (
                      <div
                        key={`filter-tag-${tag}-${index}`}
                        className={`${styles.tag} ${darkMode ? styles.tagDark : ''}`}
                      >
                        <span className={darkMode ? styles.tagTextDark : ''}>{tag}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          className={`${styles.buttonClose} ${
                            darkMode ? styles.buttonCloseDark : ''
                          }`}
                          onClick={handleRemoveClick}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRemoveClick(e);
                            }
                          }}
                          aria-label={`Remove ${tag} tag`}
                          style={{
                            pointerEvents: 'auto',
                            zIndex: 100,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Form.Label>Delete Tags (Press enter to add a tag to delete): </Form.Label>
            <div className={`${styles.tagsInputContainer}`}>
              <div className={`${styles.deleteInputWrapper}`}>
                <input
                  type="text"
                  placeholder="Search tag to delete"
                  value={deleteValue}
                  className={`${styles.formControlDelete}`}
                  onChange={e => {
                    setDeleteInputValue(e.target.value);
                    setShowDeleteDropdown(true);
                  }}
                  onFocus={() => setShowDeleteDropdown(true)}
                  onKeyDown={handleDeleteKeyDown}
                />
                {showDeleteDropdown && deleteValue && (
                  <div className={`${styles.tagDropdown}`}>
                    {getFilteredTagsToDelete().map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagDropdownItem}
                        onClick={() => addDeleteTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`${styles.tagContainer}`}>
                  {tagsToDelete.map((tag, index) => {
                    const handleRemoveDeleteTag = e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newTags = tagsToDelete.filter(t => t !== tag);
                      setTagsToDelete(newTags);
                    };

                    return (
                      <div key={`delete-tag-${tag}-${index}`} className={`${styles.tag}`}>
                        <span>{tag}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          className={`${styles.buttonClose}`}
                          onClick={handleRemoveDeleteTag}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRemoveDeleteTag(e);
                            }
                          }}
                          aria-label={`Remove ${tag} from delete list`}
                          style={{
                            pointerEvents: 'auto',
                            zIndex: 100,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ×
                        </span>
                      </div>
                    );
                  })}
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

              <ConfirmationModal
                handleDeleteTags={handleDeleteTags}
                showConfirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
              />
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

const mapStateToProps = state => {
  // console.log('Current Redux state:', state);
  return {
    lessons: state.lessons.lessons,
    darkMode: state.theme?.darkMode || false,
  };
};

export default connect(mapStateToProps)(LessonList);
