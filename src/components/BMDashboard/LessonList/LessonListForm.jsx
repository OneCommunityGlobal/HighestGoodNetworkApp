import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import { Form, FormControl, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { fetchBMLessons, refreshBMLessons } from '~/actions/bmdashboard/lessonsAction';
import {
  DATE_FILTERS,
  LESSON_SORTS,
  serializeLessonQuery,
  readLessonTags,
  normalizeLessonTagCounts,
} from '~/utils/lessonListQuery';
import { ENDPOINTS } from '~/utils/URL';
import { escapeLessonCSV } from '~/utils/lessonListCsv';
import Lessons from './Lessons';
import ConfirmationModal from './ConfirmationModal';
import ExportConfirmationModal from './ExportConfirmationModal';
import styles from './LessonListForm.module.css';
import LessonListRemovableTag from './LessonListRemovableTag';
import LessonTagPicker from './LessonTagPicker';

function LessonList({ lessons, darkMode, dispatch, request }) {
  const [filters, setFilters] = useState(() => ({
    tags: readLessonTags(),
    tagFilterLogic: 'AND',
    filterOption: '1',
    sortOption: '1',
  }));
  const { tags, tagFilterLogic, filterOption, sortOption } = filters;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const query = useMemo(
    () => ({
      tags,
      tagMatch: tagFilterLogic === 'OR' ? 'any' : 'all',
      dateFilter: DATE_FILTERS[filterOption],
      timeZone,
      sort: LESSON_SORTS[sortOption],
    }),
    [tags, tagFilterLogic, filterOption, sortOption, timeZone],
  );
  const queryKey = serializeLessonQuery(query);
  const [retry, setRetry] = useState(0);
  const isCurrent = request.queryKey === queryKey;
  // A request's query is not proof that the retained results belong to it.
  const hasCurrentResults = request.resultQueryKey === queryKey;
  const listError = isCurrent ? request.error : null;
  const isLoading = (!hasCurrentResults && !listError) || (isCurrent && request.loading);
  const isRefreshing = hasCurrentResults && isLoading;
  const filteredLessons = hasCurrentResults ? lessons : [];
  const [inputValue, setInputValue] = useState('');
  const [deleteValue, setDeleteInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [tagCounts, setTagCounts] = useState({});
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState('');
  const mounted = useRef(true);
  const catalogueRequest = useRef(0);
  const catalogueController = useRef(null);
  const [tagsToDelete, setTagsToDelete] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletingRef = useRef(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportingRef = useRef(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    dispatch(fetchBMLessons(query, { signal: controller.signal }));
    return () => controller.abort();
  }, [dispatch, query, retry]);

  useEffect(() => {
    try {
      if (tags.length) localStorage.setItem('lessonListSelectedTags', JSON.stringify(tags));
      else localStorage.removeItem('lessonListSelectedTags');
    } catch {
      /* Filtering remains usable when browser storage is unavailable. */
    }
  }, [tags]);

  const loadTagData = useCallback(async () => {
    if (!mounted.current) return;
    catalogueController.current?.abort();
    const controller = new AbortController();
    catalogueController.current = controller;
    const requestId = ++catalogueRequest.current;
    setCatalogueLoading(true);
    setCatalogueError('');
    try {
      // Global metadata is independent of the active filters and result pagination.
      const response = await axios.get(ENDPOINTS.BM_TAG_COUNTS, { signal: controller.signal });
      if (controller.signal.aborted || requestId !== catalogueRequest.current) return;
      const metadata = normalizeLessonTagCounts(response.data);
      setAvailableTags(metadata.tags);
      setTagCounts(metadata.counts);
    } catch {
      if (!controller.signal.aborted && requestId === catalogueRequest.current)
        setCatalogueError('Unable to load tag suggestions and global counts.');
    } finally {
      if (!controller.signal.aborted && requestId === catalogueRequest.current)
        setCatalogueLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    loadTagData();
    return () => {
      mounted.current = false;
      catalogueController.current?.abort();
      catalogueRequest.current += 1;
    };
  }, [loadTagData, request.tagMetadataVersion]);

  const changeFilters = patch => setFilters(previous => ({ ...previous, ...patch }));
  const addTag = tag => {
    setFilters(previous =>
      previous.tags.length >= 50 ||
      previous.tags.some(value => value.toLowerCase() === tag.toLowerCase())
        ? previous
        : { ...previous, tags: [...previous.tags, tag] },
    );
    setInputValue('');
  };
  const removeTag = tag =>
    setFilters(previous => ({ ...previous, tags: previous.tags.filter(value => value !== tag) }));
  const addDeleteTag = tag => {
    setTagsToDelete(previous =>
      previous.some(value => value.toLowerCase() === tag.toLowerCase())
        ? previous
        : [...previous, tag],
    );
    setDeleteInputValue('');
  };
  const removeDeleteTag = tag =>
    setTagsToDelete(previous => previous.filter(value => value !== tag));
  const resetAll = () => {
    setFilters({ tags: [], tagFilterLogic: 'AND', filterOption: '1', sortOption: '1' });
    setInputValue('');
    setDeleteInputValue('');
    setResetKey(value => value + 1);
  };
  const handleDeleteTags = async () => {
    if (deletingRef.current || !tagsToDelete.length) return;
    deletingRef.current = true;
    setIsDeleting(true);
    try {
      const outcomes = await Promise.allSettled(
        tagsToDelete.map(tag => axios.delete(`${ENDPOINTS.BM_TAGS}/${encodeURIComponent(tag)}`)),
      );
      if (!mounted.current) return;
      const deleted = tagsToDelete.filter((tag, index) => outcomes[index].status === 'fulfilled');
      const failed = tagsToDelete.filter((tag, index) => outcomes[index].status === 'rejected');
      const currentTags = filtersRef.current.tags;
      if (currentTags.some(tag => deleted.includes(tag))) {
        setFilters(previous => ({
          ...previous,
          tags: previous.tags.filter(tag => !deleted.includes(tag)),
        }));
      } else if (deleted.length) await dispatch(refreshBMLessons());
      setTagsToDelete(failed);
      if (!failed.length) setConfirmModal(false);
      if (deleted.length) toast.success(`${deleted.length} tag(s) deleted successfully`);
      if (failed.length)
        toast.error(`Failed to delete: ${failed.join(', ')}. You can retry these tags.`);
      if (deleted.length) await loadTagData();
    } finally {
      deletingRef.current = false;
      if (mounted.current) setIsDeleting(false);
    }
  };

  const stripHtmlTags = htmlString => {
    if (!htmlString || typeof htmlString !== 'string') {
      return String(htmlString || '');
    }

    try {
      // Use DOMParser to safely parse and extract text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      return doc.body.textContent || doc.body.innerText || '';
    } catch (error) {
      // Fallback: if DOMParser fails, return the original string
      // This should rarely happen, but provides a safety net
      console.warn('Error parsing HTML content:', error);
      return htmlString;
    }
  };

  const escapeCSV = escapeLessonCSV;

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
      filterDescriptions.push(`Tags (${tagFilterLogic}): ${tags.join(', ')}`);
    }

    // Sort option
    const sortMap = {
      '1': 'Newest',
      '2': 'Date (Oldest)',
      '3': 'Likes',
      '4': 'Tag Frequency',
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
    if (isLoading || listError) return;
    setShowExportModal(true);
  };

  const exportLessonData = () => {
    // Prevent multiple simultaneous exports
    if (exportingRef.current || isLoading || listError) {
      return;
    }

    exportingRef.current = true;
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

      csv += ['Export Date:', exportDateString].map(escapeCSV).join(',') + '\n';
      csv += ['Applied Filters:', getFilterDescription()].map(escapeCSV).join(',') + '\n';
      csv += ['Total Lessons:', filteredLessons.length].map(escapeCSV).join(',') + '\n';
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

          // Safely handle content - remove HTML tags and normalize newlines
          let content = '';
          if (lesson?.content) {
            // Remove HTML tags using DOMParser (ReDoS-safe and handles all cases)
            const textContent = stripHtmlTags(lesson.content);
            // Replace newlines with spaces to keep content on single line in CSV
            content = textContent
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .trim();
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
      exportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <div className={`${styles.mainContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={`${styles.formContainer}`}>
        <Form onSubmit={event => event.preventDefault()}>
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
                  aria-label="Date filter"
                  value={filterOption}
                  onChange={event => changeFilters({ filterOption: event.target.value })}
                  disabled={isLoading}
                >
                  <option value="1">All dates</option>
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
                  aria-label="Lesson sort"
                  value={sortOption}
                  onChange={event => changeFilters({ sortOption: event.target.value })}
                  disabled={isLoading}
                >
                  <option value="1">Newest</option>
                  <option value="2">Date</option>
                  <option value="3">Likes</option>
                  <option value="4">Tag Frequency</option>
                </FormControl>
              </Form.Group>
            </div>
            <div>
              <Form.Group
                className={`${styles.singleForm} ${styles.exportGroup}`}
                controlId="ExportButton"
              >
                <Form.Label>&nbsp;</Form.Label>
                <Button
                  variant="primary"
                  onClick={handleExportClick}
                  disabled={
                    isLoading || Boolean(listError) || isExporting || !filteredLessons.length
                  }
                  style={{ width: '100%', marginTop: '0' }}
                  aria-label="Export lesson data to CSV"
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
              </Form.Group>
            </div>
            <Button type="button" variant="secondary" onClick={resetAll} disabled={isDeleting}>
              Reset All
            </Button>
          </div>

          {/* Tags input */}
          <Form.Group>
            <Form.Label htmlFor="tagInput">Tags:</Form.Label>
            {tags.length > 1 && (
              <div className="mb-2" style={{ fontSize: '0.85rem' }}>
                <Form.Check
                  inline
                  name="tagMatch"
                  type="radio"
                  id="tagLogicAnd"
                  label="Match ALL tags (AND)"
                  checked={tagFilterLogic === 'AND'}
                  onChange={() => changeFilters({ tagFilterLogic: 'AND' })}
                />
                <Form.Check
                  inline
                  name="tagMatch"
                  type="radio"
                  id="tagLogicOr"
                  label="Match ANY tag (OR)"
                  checked={tagFilterLogic === 'OR'}
                  onChange={() => changeFilters({ tagFilterLogic: 'OR' })}
                />
              </div>
            )}
            <div className={`tags-input-container ${styles.tagsInputContainer}`}>
              <LessonTagPicker
                id="tagInput"
                label="Filter tags"
                value={inputValue}
                onInputChange={setInputValue}
                availableTags={availableTags}
                selectedTags={tags}
                counts={tagCounts}
                onSelect={addTag}
                disabled={
                  catalogueLoading || Boolean(catalogueError) || isDeleting || tags.length >= 50
                }
                resetKey={resetKey}
              />
              {tags.length >= 50 && <p role="status">A maximum of 50 tags can be selected.</p>}
              {tags.length > 0 && (
                <div
                  className={`${styles.tagContainer} ${darkMode ? styles.tagContainerDark : ''}`}
                >
                  {tags.map(tag => (
                    <LessonListRemovableTag
                      key={tag}
                      tag={tag}
                      darkMode={darkMode}
                      onRemove={removeTag}
                      variant="filter"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Delete tags */}
            <Form.Label htmlFor="deleteTagInput">
              Delete Tags (removes tags from all lessons):{' '}
            </Form.Label>
            <div className={`tags-input-container ${styles.tagsInputContainer}`}>
              <div className={`${styles.deleteInputWrapper}`}>
                <LessonTagPicker
                  id="deleteTagInput"
                  label="Tags to delete"
                  value={deleteValue}
                  onInputChange={setDeleteInputValue}
                  availableTags={availableTags}
                  selectedTags={tagsToDelete}
                  onSelect={addDeleteTag}
                  disabled={catalogueLoading || Boolean(catalogueError) || isDeleting}
                  resetKey={resetKey}
                />
                <div className={`${styles.tagContainer}`}>
                  {tagsToDelete.map(tag => (
                    <LessonListRemovableTag
                      key={tag}
                      tag={tag}
                      darkMode={darkMode}
                      onRemove={removeDeleteTag}
                      variant="delete"
                    />
                  ))}
                </div>
              </div>
              {tagsToDelete.length > 0 && (
                <Button
                  style={{ backgroundColor: 'red', marginLeft: '10px' }}
                  onClick={() => setConfirmModal(true)}
                  disabled={isDeleting || catalogueLoading}
                >
                  Delete
                </Button>
              )}

              <ConfirmationModal
                handleDeleteTags={handleDeleteTags}
                showConfirmModal={confirmModal}
                setConfirmModal={setConfirmModal}
                darkMode={darkMode}
                isDeleting={isDeleting}
              />
            </div>
          </Form.Group>
        </Form>
        {catalogueLoading && <p role="status">Loading tag suggestions…</p>}
        {catalogueError && (
          <div role="alert">
            {catalogueError}{' '}
            <Button type="button" onClick={loadTagData}>
              Retry suggestions
            </Button>
          </div>
        )}
        {isLoading && (
          <div role="status" className={styles.loading}>
            {isRefreshing ? 'Refreshing lessons…' : 'Loading lessons…'}
          </div>
        )}
        {listError && (
          <div role="alert">
            {listError}{' '}
            <Button type="button" onClick={() => setRetry(value => value + 1)}>
              Retry lessons
            </Button>
          </div>
        )}
        {!isLoading && !listError && (
          <output aria-live="polite">{filteredLessons.length} matching lesson(s)</output>
        )}
        {!isLoading && !listError && filteredLessons.length === 0 && (
          <div className={styles.emptyState}>No lessons match this filter.</div>
        )}
        <ExportConfirmationModal
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
          onConfirmExport={exportLessonData}
          filteredLessonsCount={filteredLessons?.length || 0}
          filterDescription={getFilterDescription()}
          darkMode={darkMode}
          isExporting={isExporting || isLoading || Boolean(listError)}
        />
        {/* Retain card identity/drafts during requests, but never expose another query's data. */}
        <div
          role="region"
          aria-label="Lesson results"
          aria-busy={isLoading}
          hidden={!hasCurrentResults || lessons.length === 0}
        >
          <Lessons filteredLessons={lessons} dispatch={dispatch} />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return {
    lessons: state.lessons.lessons,
    darkMode: state.theme?.darkMode || false,
    request: state.lessons,
  };
};

export default connect(mapStateToProps)(LessonList);
