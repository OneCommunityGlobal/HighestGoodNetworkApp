import { toast } from 'react-toastify';

export default function AssignLessonPlanModal({ onClose, assignTasks, isAssigning }) {
  const handleConfirm = async () => {
    if (isAssigning) {
      return;
    }
    // Close the modal immediately
    onClose();

    // Call the centralized API function passed from the parent, with `isAutoAssigned = false`
    try {
      await assignTasks(false);
    } catch (error) {
      toast.error(`Task assignment failed. ${error.message}`);
    }
  };

  return (
    <dialog
      open
      aria-labelledby="assignment-dialog-title"
      aria-describedby="assignment-dialog-description"
      className="modal d-block"
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'inherit',
        margin: 0,
        border: 0,
        padding: 0,
        maxWidth: 'none',
        maxHeight: 'none',
      }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 id="assignment-dialog-title" className="modal-title">
              Confirm Assignment
            </h5>
            <button type="button" className="close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p id="assignment-dialog-description">
              This will assign tasks to all eligible students. Do you want to proceed?
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={isAssigning}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
