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
import ExportConfirmationModal from './ExportConfirmationModal';
import styles from './LessonListForm.module.css';

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
  const [confirmModal, setConfirmModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const removeTag = index => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      // console.log('Starting filtering with:', {
      //  lessonsCount: lessons?.length || 0,
      //  firstLesson: lessons?.[0],
      // });
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

  const escapeCSV = value => {
    // Handle null, undefined, and empty values
    if (value === null || value === undefined || value === '') {
      return '';
    }

    // Convert to string safely
    let stringValue;
    try {
      stringValue = String(value);
    } catch (error) {
      console.warn('Error converting value to string:', error);
      return '';
    }

    // Remove or replace problematic characters that could break CSV
    // Replace carriage returns and normalize line breaks
    stringValue = stringValue
      .replace(/\r\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ');

    // If value contains comma, quote, or starts/ends with whitespace, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || /^\s|\s$/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  const formatDateForCSV = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If invalid date, try to return original string or empty
        return typeof dateString === 'string' ? dateString.substring(0, 50) : '';
      }
      // Format as MM/DD/YYYY for Excel compatibility
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.warn('Error formatting date:', error, dateString);
      // Return a safe fallback
      return typeof dateString === 'string' ? dateString.substring(0, 50) : '';
    }
  };

  const getFilterDescription = () => {
    const filterDescriptions = [];

    // Date filter
    if (filterOption !== '1') {
      const filterMap = {
        '2': 'This Year',
        '3': 'This Month',
        '4': 'This Week',
      };
      filterDescriptions.push(`Date Filter: ${filterMap[filterOption]}`);
    }

    // Tag filter
    if (tags.length > 0) {
      filterDescriptions.push(`Tags: ${tags.join(', ')}`);
    }

    // Sort option
    const sortMap = {
      '1': 'Newest',
      '2': 'Date (Oldest)',
      '3': 'Likes',
    };
    filterDescriptions.push(`Sort: ${sortMap[sortOption]}`);

    return filterDescriptions.length > 0 ? filterDescriptions.join(' | ') : 'No filters applied';
  };

  const handleExportClick = () => {
    // Validate data before showing modal
    if (!filteredLessons || !Array.isArray(filteredLessons) || filteredLessons.length === 0) {
      toast.error('No lesson data available to export. Please adjust your filters.');
      return;
    }
    setShowExportModal(true);
  };

  const exportLessonData = () => {
    // Prevent multiple simultaneous exports
    if (isExporting) {
      return;
    }

    setIsExporting(true);

    let blobUrl = null;
    let downloadLink = null;

    try {
      // Validate data again before export
      if (!filteredLessons || !Array.isArray(filteredLessons) || filteredLessons.length === 0) {
        toast.error('No lesson data available to export');
        setIsExporting(false);
        setShowExportModal(false);
        return;
      }

      // Create CSV content with UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      let csv = BOM;

      // Add metadata about filters applied
      const exportDate = new Date();
      const exportDateString = exportDate.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      csv += `Export Date: ${exportDateString}\n`;
      csv += `Applied Filters: ${getFilterDescription()}\n`;
      csv += `Total Lessons: ${filteredLessons.length}\n`;
      csv += '\n';

      // CSV Headers
      const headers = [
        'Lesson Title',
        'Date',
        'Tags',
        'Author',
        'Related Project',
        'Total Likes',
        'Content Summary',
      ];
      csv += headers.map(escapeCSV).join(',') + '\n';

      // CSV Data rows with robust error handling
      filteredLessons.forEach((lesson, index) => {
        try {
          // Safely extract lesson data with fallbacks
          const title = lesson?.title || '';
          const date = lesson?.date ? formatDateForCSV(lesson.date) : '';
          const tags =
            Array.isArray(lesson?.tags) && lesson.tags.length > 0 ? lesson.tags.join('; ') : '';
          const author = lesson?.author?.name || 'Unknown';
          const project = lesson?.relatedProject?.name || 'Unknown Project';
          const likes = typeof lesson?.totalLikes === 'number' ? lesson.totalLikes : 0;

          // Safely handle content - remove HTML tags, newlines, and limit length
          let content = '';
          if (lesson?.content) {
            // Remove HTML tags if present
            const textContent =
              typeof lesson.content === 'string'
                ? lesson.content.replace(/<[^>]*>/g, '')
                : String(lesson.content);
            // Replace newlines and limit length
            content = textContent
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .trim()
              .substring(0, 500);
          }

          const row = [title, date, tags, author, project, likes, content];
          csv += row.map(escapeCSV).join(',') + '\n';
        } catch (rowError) {
          // Log error but continue with other rows
          console.warn(`Error processing lesson at index ${index}:`, rowError);
          // Add a placeholder row to maintain CSV structure (7 columns matching headers)
          const errorRow = ['Error processing this lesson', '', '', '', '', '', ''];
          csv += errorRow.map(escapeCSV).join(',') + '\n';
        }
      });

      // Validate CSV content before creating blob
      const minExpectedLength = 100; // BOM + metadata + headers should be at least this
      if (!csv || csv.length < minExpectedLength) {
        throw new Error('Generated CSV content is invalid or too short');
      }

      // Create blob with UTF-8 encoding
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      if (!blob || blob.size === 0) {
        throw new Error('Failed to create file blob');
      }

      blobUrl = URL.createObjectURL(blob);

      if (!blobUrl) {
        throw new Error('Failed to create download URL');
      }

      // Create download link
      downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;

      // Generate safe filename with date
      const dateString = exportDate
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '_');
      downloadLink.download = `lesson_data_${dateString}.csv`;

      // Ensure link is properly configured
      downloadLink.style.display = 'none';
      downloadLink.setAttribute('download', downloadLink.download);

      // Append to body, click, and cleanup
      if (document.body) {
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Cleanup with error handling - delay to ensure download starts
        setTimeout(() => {
          try {
            if (document.body && document.body.contains(downloadLink)) {
              document.body.removeChild(downloadLink);
            }
            if (blobUrl) {
              URL.revokeObjectURL(blobUrl);
            }
          } catch (cleanupError) {
            console.warn('Error during cleanup:', cleanupError);
          }
        }, 200);
      } else {
        throw new Error('Document body not available');
      }

      // Close modal and show success only after successful export
      setShowExportModal(false);
      toast.success(`Successfully exported ${filteredLessons.length} lesson(s) to CSV`);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to export lesson data: ${errorMessage}. Please try again.`);
      // Cleanup on error
      if (blobUrl) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch (cleanupError) {
          console.warn('Error revoking URL on error:', cleanupError);
        }
      }
      if (downloadLink && document.body && document.body.contains(downloadLink)) {
        try {
          document.body.removeChild(downloadLink);
        } catch (cleanupError) {
          console.warn('Error removing link on error:', cleanupError);
        }
      }
      // Keep modal open on error so user can retry
      // Modal stays open - user can try again or cancel
    } finally {
      setIsExporting(false);
    }
  };

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
            <div>
              <Form.Group className={`${styles.singleForm}`} controlId="ExportButton">
                <Form.Label>&nbsp;</Form.Label>
                <Button
                  variant="primary"
                  onClick={handleExportClick}
                  disabled={isExporting || !filteredLessons || filteredLessons.length === 0}
                  style={{ width: '100%', marginTop: '0' }}
                  aria-label="Export lesson data to CSV"
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
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
                  {tagsToDelete.map(tag => (
                    <div key={tag} className={`${styles.tag}`}>
                      <span>{tag}</span>
                      <Button
                        className={`${styles.buttonClose}`}
                        onClick={() => {
                          const newTags = tagsToDelete.filter((_, i) => i !== tag);
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

              <ConfirmationModal
                handleDeleteTags={handleDeleteTags}
                showConfirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
              />
            </div>
          </Form.Group>
        </Form>
        <ExportConfirmationModal
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
          onConfirmExport={exportLessonData}
          filteredLessonsCount={filteredLessons?.length || 0}
          filterDescription={getFilterDescription()}
          darkMode={darkMode}
          isExporting={isExporting}
        />
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
