import { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
  const { lessons, dispatch } = props;
  const history = useHistory();
  const location = useLocation();

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
  const [confirmModal, setConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize state from URL on mount (filter, sort, tags)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const f = q.get('filter');
    const s = q.get('sort');
    const t = q.get('tags'); // comma-separated
    if (f) setFilterOption(f);
    if (s) setSortOption(s);
    if (t) setTags(t.split(',').filter(Boolean));
    // no deps: set once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        await dispatch(fetchBMLessons());
        const tagsResponse = await axios.get(`${ENDPOINTS.BM_TAGS}`);
        setAvailableTags(tagsResponse.data);
      } catch (e) {
        setError('Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

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

  // Remove tag by value (fix: previous version removed by wrong index)
  const removeTag = tagToRemove => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      // console.log('Starting filtering with:', {
      //  lessonsCount: lessons?.length || 0,
      //  firstLesson: lessons?.[0],
      // });
      let filtered = [...lessons];

      // 1) tags
      if (tags.length > 0) {
        filtered = filtered.filter(lesson => {
          // console.log('Checking lesson:', lesson.title, 'tags:', lesson.tags);
          const hasAllTags = lesson.tags && tags.every(tag => lesson.tags.includes(tag));
          // console.log('Has all tags?', hasAllTags);
          return hasAllTags;
        });
      }

      // 2) date filtering
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

      // 3) sorting
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
  }, [lessons, tags, filterOption, sortOption]);

  // Keep URL in sync with state (filter, sort, tags)
  useEffect(() => {
    const q = new URLSearchParams();
    if (filterOption) q.set('filter', filterOption);
    if (sortOption) q.set('sort', sortOption);
    if (tags.length) q.set('tags', tags.join(','));
    history.replace({ pathname: location.pathname, search: q.toString() });
  }, [filterOption, sortOption, tags, history, location.pathname]);

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
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  <option value="1">Newest</option>
                  <option value="2">Date</option>
                  <option value="3">Likes</option>
                </FormControl>
              </Form.Group>
            </div>
          </div>

          {/* Tags input */}
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
                  disabled={isLoading}
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
                        disabled={isLoading}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </InputGroup>
              <div className={`${styles.tagContainer}`}>
                {tags.map(tag => (
                  <div key={tag} className={`${styles.tag}`}>
                    <span>{tag}</span>
                    <Button className={`${styles.buttonClose}`} onClick={() => removeTag(tag)}>
                      x
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delete tags */}
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
                  disabled={isLoading}
                />
                {showDeleteDropdown && deleteValue && (
                  <div className={`${styles.tagDropdown}`}>
                    {getFilteredTagsToDelete().map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagDropdownItem}
                        onClick={() => addDeleteTag(tag)}
                        disabled={isLoading}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className={`${styles.tagContainer}`}>
                  {tagsToDelete.map(tag => (
                    <div key={tag} className={`${styles.tag}`}>
                      <span>{tag}</span>
                      <Button
                        className={`${styles.buttonClose}`}
                        onClick={() => setTagsToDelete(prev => prev.filter(t => t !== tag))}
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
                  disabled={isLoading}
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

        {/* Loading and empty-state messaging */}
        {isLoading && <div className={styles.loading}>Loading lessons…</div>}
        {!isLoading && filteredLessons.length === 0 && (
          <div className={styles.emptyState}>No lessons match this filter.</div>
        )}

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
  };
};

export default connect(mapStateToProps)(LessonList);
