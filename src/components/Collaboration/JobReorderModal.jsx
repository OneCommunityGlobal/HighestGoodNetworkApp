import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert } from 'reactstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { ApiEndpoint } from '~/utils/URL';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import './JobReorderModal.css';

function JobReorderModal({ isOpen, toggle, onJobsReordered, darkMode, checkPermission }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canReorderJobs = checkPermission('reorderJobs');

  // Define fetchAllJobs first
  const fetchAllJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${ApiEndpoint}/jobs?limit=100`);
      // Sort jobs by displayOrder first, then by datePosted
      const sortedJobs = response.data.jobs.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return new Date(b.datePosted) - new Date(a.datePosted);
      });

      // Assign initial position numbers to each job
      const jobsWithPositions = sortedJobs.map((job, index) => ({
        ...job,
        originalPosition: index + 1,
      }));

      setJobs(jobsWithPositions);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all jobs when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllJobs();
    }
  }, [isOpen]);

  const handleDragEnd = result => {
    if (!result.destination) return;

    const items = Array.from(jobs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the jobs with new order, but keep original position numbers
    setJobs(items);
  };

  const saveNewOrder = async () => {
    if (!canReorderJobs) {
      setError('You do not have permission to reorder jobs');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const jobIds = jobs.map(job => job._id);
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
        if (onJobsReordered) onJobsReordered();
        toggle();
      } else {
        throw new Error('Failed to reorder jobs');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save new order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" className={darkMode ? 'dark-mode' : ''}>
      <ModalHeader toggle={toggle}>
        <i className="fa fa-sort mr-2" aria-hidden="true" />
        Reorder Job Listings
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

        {loading ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading jobs...</p>
          </div>
        ) : (
          <div className="reorder-instructions mb-3">
            <p>
              <i className="fa fa-info-circle mr-2" aria-hidden="true" />
              Drag and drop jobs to change their order on the landing page. Jobs will appear in the
              order shown here.
            </p>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {droppableProvided => (
              <div
                ref={droppableProvided.innerRef}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...droppableProvided.droppableProps}
                className="jobs-list"
              >
                {jobs.map((job, index) => (
                  <Draggable
                    key={job._id}
                    draggableId={job._id}
                    index={index}
                    isDragDisabled={!canReorderJobs}
                  >
                    {(draggableProvided, snapshot) => {
                      return (
                        <div
                          ref={draggableProvided.innerRef}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...draggableProvided.draggableProps}
                          // eslint-disable-next-line react/jsx-props-no-spreading
                          {...draggableProvided.dragHandleProps}
                          className={`job-item ${snapshot.isDragging ? 'dragging' : ''} ${
                            job.featured ? 'featured' : ''
                          }`}
                        >
                          <div className="position-number">{job.originalPosition}</div>
                          <div className="job-item-content">
                            {job.featured && <span className="featured-badge">Featured</span>}
                            <h4>{job.title}</h4>
                            <div className="job-details">
                              <span className="job-category">{job.category}</span>
                              <span className="job-date">
                                <i className="fa fa-calendar-o mr-1" aria-hidden="true" />
                                {new Date(job.datePosted).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={loading}>
          <i className="fa fa-times mr-1" aria-hidden="true" />
          Cancel
        </Button>
        {canReorderJobs && (
          <Button color="primary" onClick={saveNewOrder} disabled={loading}>
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
