import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { ApiEndpoint } from '~/utils/URL';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import styles from './JobReorderModal.module.css';

function JobReorderModal({
  isOpen,
  toggle,
  onJobsReordered,
  darkMode,
  checkPermission,
  items = [],
  selectedCategory = '',
  searchTerm = '',
}) {
  const [displayItems, setDisplayItems] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canReorderJobs = checkPermission('reorderJobs');

  // When there is no search/category filter, the main page displays
  // category cards. Otherwise, it displays individual jobs.
  const isCategoryView = !selectedCategory && !searchTerm;

  /*
   * Fetch all jobs because the reorder API expects a complete job
   * ordering. This also prevents jobs that are not currently visible
   * on the main page from being accidentally lost from the ordering.
   */
  const fetchAllJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ApiEndpoint}/jobs?limit=100`);

      const fetchedJobs = Array.isArray(response.data?.jobs) ? response.data.jobs : [];

      const sortedJobs = [...fetchedJobs].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }

        return new Date(b.datePosted) - new Date(a.datePosted);
      });

      const jobsWithPositions = sortedJobs.map((job, index) => ({
        ...job,
        originalPosition: index + 1,
      }));

      setAllJobs(jobsWithPositions);

      /*
       * Collaboration.jsx supplies exactly what is currently displayed.
       * Use that for the modal instead of always displaying all jobs.
       */
      setDisplayItems(items);
    } catch (err) {
      console.error('Error fetching jobs for reorder:', err);
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /*
   * Open modal -> fetch the complete job list.
   */
  useEffect(() => {
    if (isOpen) {
      fetchAllJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /*
   * Keep the modal synchronized when the main page changes
   * search/category/displayed items.
   */
  useEffect(() => {
    if (isOpen) {
      setDisplayItems(items);
    }
  }, [items, isOpen]);

  /*
   * Drag and drop works for both:
   *
   * Category view:
   *   [Engineering, Software, Plumbing]
   *
   * Job view:
   *   [Job A, Job B, Job C]
   */
  const handleDragEnd = result => {
    if (!result.destination) return;

    const reorderedItems = Array.from(displayItems);

    const [reorderedItem] = reorderedItems.splice(result.source.index, 1);

    reorderedItems.splice(result.destination.index, 0, reorderedItem);

    setDisplayItems(reorderedItems);
  };

  /*
   * Build the complete job order expected by:
   *
   * POST /jobs/reorder
   *
   * {
   *   jobIds: [...]
   * }
   *
   * The backend then assigns displayOrder based on this array.
   */
  const buildJobOrder = () => {
    if (!allJobs.length) {
      return [];
    }

    /*
     * CATEGORY VIEW
     *
     * Example:
     *
     * Current categories:
     * Engineering
     * Software
     * Plumbing
     *
     * User changes to:
     * Plumbing
     * Engineering
     * Software
     *
     * We convert that into:
     *
     * Plumbing jobs
     * Engineering jobs
     * Software jobs
     *
     * so the first job of each category determines the category
     * card order on the landing page.
     */
    if (isCategoryView) {
      const categoryOrder = displayItems
        .filter(item => item?.type === 'category')
        .map(item => item.category);

      const orderedJobs = [];
      const usedJobIds = new Set();

      categoryOrder.forEach(category => {
        allJobs.forEach(job => {
          if (job.category === category && job._id && !usedJobIds.has(job._id)) {
            orderedJobs.push(job._id);
            usedJobIds.add(job._id);
          }
        });
      });

      /*
       * Keep any categories/jobs that were not represented in
       * displayItems at the end.
       */
      allJobs.forEach(job => {
        if (job?._id && !usedJobIds.has(job._id)) {
          orderedJobs.push(job._id);
          usedJobIds.add(job._id);
        }
      });

      return orderedJobs;
    }

    /*
     * JOB VIEW
     *
     * Only the jobs currently displayed by Collaboration.jsx
     * are reordered.
     *
     * Jobs outside the current filtered/page view keep their
     * relative positions.
     */
    const reorderedJobIds = displayItems
      .filter(item => item?.type === 'job' && item.id)
      .map(item => item.id);

    if (!reorderedJobIds.length) {
      return allJobs.filter(job => job?._id).map(job => job._id);
    }

    const reorderedSet = new Set(reorderedJobIds);
    let reorderedIndex = 0;

    return allJobs
      .filter(job => job?._id)
      .map(job => {
        if (reorderedSet.has(job._id)) {
          const newId = reorderedJobIds[reorderedIndex];
          reorderedIndex += 1;
          return newId;
        }

        return job._id;
      });
  };

  const saveNewOrder = async () => {
    if (!canReorderJobs) {
      setError('You do not have permission to reorder jobs');
      return;
    }

    const jobIds = buildJobOrder();

    if (!jobIds.length) {
      setError('No jobs available to reorder.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${ApiEndpoint}/jobs/reorder`,
        { jobIds },
        {
          headers: {
            'Content-Type': 'application/json',
            userid: localStorage.getItem('userId'),
          },
        },
      );

      if (response.data.success) {
        toast.success('Jobs reordered successfully');

        if (onJobsReordered) {
          onJobsReordered();
        }

        toggle();
      } else {
        throw new Error('Failed to reorder jobs');
      }
    } catch (err) {
      console.error('Save error:', err);

      setError(err.response?.data?.error || 'Failed to save new order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader toggle={toggle}>
        <i className="fa fa-sort mr-2" aria-hidden="true" />

        {isCategoryView ? 'Reorder Job Categories' : 'Reorder Job Listings'}
      </ModalHeader>

      <ModalBody>
        {!canReorderJobs && (
          <Alert color="warning">
            <i className="fa fa-exclamation-triangle mr-2" aria-hidden="true" />
            You do not have permission to reorder jobs. You are viewing in read-only mode.
          </Alert>
        )}

        {error && (
          <Alert color="danger">
            <i className="fa fa-exclamation-circle mr-2" aria-hidden="true" />

            {error}
          </Alert>
        )}

        {!loading && (
          <div className={`${styles.reorderInstructions} mb-3`}>
            <p>
              <i className="fa fa-info-circle mr-2" aria-hidden="true" />

              {isCategoryView
                ? 'Drag and drop categories to change their order on the landing page.'
                : 'Drag and drop jobs to change their order on the landing page.'}
            </p>

            {selectedCategory && (
              <p className="mb-1">
                <strong>Category:</strong> {selectedCategory}
              </p>
            )}

            {searchTerm && (
              <p className="mb-0">
                <strong>Search:</strong> {searchTerm}
              </p>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="sr-only">Loading...</span>
            </div>

            <p>Loading jobs...</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={isCategoryView ? 'categories' : 'jobs'}>
              {droppableProvided => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={styles.jobsList}
                >
                  {displayItems.map((item, index) => {
                    const itemId = item.type === 'category' ? `category-${item.category}` : item.id;

                    const itemTitle = item.type === 'category' ? item.category : item.title;

                    const itemCategory =
                      item.type === 'category'
                        ? `${item.count || 0} ${item.count === 1 ? 'position' : 'positions'}`
                        : item.category;

                    const job = item.type === 'job' ? item.job : item.firstJob;

                    return (
                      <Draggable
                        key={itemId}
                        draggableId={itemId}
                        index={index}
                        isDragDisabled={!canReorderJobs}
                      >
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            className={`${styles.jobsItem} ${
                              snapshot.isDragging ? styles.dragging : ''
                            } ${job?.featured ? styles.featured : ''}`}
                          >
                            <div className={styles.positionNumber}>{index + 1}</div>

                            <div className={styles.jobTtemContent}>
                              {item.type === 'job' && job?.featured && (
                                <span className={styles.featuredBadge}>Featured</span>
                              )}

                              <h4>{itemTitle}</h4>

                              <div className={styles.jobDetails}>
                                <span className={styles.jobCategory}>{itemCategory}</span>

                                {item.type === 'job' && job?.datePosted && (
                                  <span className={styles.jobDate}>
                                    <i className="fa fa-calendar-o mr-1" aria-hidden="true" />

                                    {new Date(job.datePosted).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}

                  {droppableProvided.placeholder}

                  {!displayItems.length && (
                    <p className="text-center p-4">No items available to reorder.</p>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          <i className="fa fa-times mr-1" aria-hidden="true" />
          Cancel
        </Button>

        {canReorderJobs && (
          <Button color="primary" onClick={saveNewOrder} disabled={loading || !displayItems.length}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-1"
                  role="status"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              <>
                <i className="fa fa-save mr-1" aria-hidden="true" />
                Save Order
              </>
            )}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  checkPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JobReorderModal);
