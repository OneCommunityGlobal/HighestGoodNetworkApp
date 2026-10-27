import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { toast } from 'react-toastify';
import { uploadStudentTaskFile, updateStudentTask } from '../../../actions/studentTasks';
import styles from './TaskUploadButton.module.css';

const acceptedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export default function TaskUploadButton({ task, darkMode = false, onComplete }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [simulate, setSimulate] = useState(false);
  const simulationAvailable =
    import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const pendingRef = useRef(false);
  const eligible =
    task.task_type === 'write' &&
    !task.is_completed &&
    ['assigned', 'in_progress'].includes(task.status);

  const close = () => {
    if (pendingRef.current) return;
    setOpen(false);
    setFile(null);
    setError('');
    setSimulate(false);
  };

  const submit = async event => {
    event.preventDefault();
    if (pendingRef.current || !file) return;
    if (file.size > 10 * 1024 * 1024 || !acceptedTypes.includes(file.type)) {
      setError('Choose a PDF, DOCX, TXT, JPEG, PNG, or GIF file no larger than 10 MB.');
      return;
    }
    pendingRef.current = true;
    setPending(true);
    setError('');
    try {
      if (simulationAvailable && simulate) {
        if (
          !eligible ||
          !Number.isFinite(task.suggested_total_hours) ||
          task.suggested_total_hours < 0
        ) {
          setError('Task is not eligible or suggested hours are invalid.');
          return;
        }
        const completedAt = new Date().toISOString();
        dispatch(
          updateStudentTask(task.id || task._id, {
            status: 'completed',
            is_completed: true,
            logged_hours: task.suggested_total_hours,
            completedAt,
            last_logged_date: completedAt,
            simulated_upload: true,
          }),
        );
        toast.info(
          'Simulated upload only — no file or task changes were saved. Refresh to restore API data.',
        );
        setOpen(false);
        setFile(null);
        setSimulate(false);
        onComplete?.();
        return;
      }
      const result = await dispatch(uploadStudentTaskFile(task.id || task._id, file));
      if (result.success) {
        setOpen(false);
        setFile(null);
        onComplete?.();
      } else setError(result.error);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return (
    <>
      {task.simulated_upload && <span role="status">Simulated completion — not saved</span>}
      {eligible && (
        <button type="button" className={styles.uploadButton} onClick={() => setOpen(true)}>
          Upload
        </button>
      )}
      <Modal
        isOpen={open}
        toggle={close}
        labelledBy="task-upload-title"
        backdrop="static"
        keyboard={!pending}
        contentClassName={darkMode ? styles.dark : styles.light}
      >
        <ModalHeader toggle={pending ? undefined : close} id="task-upload-title">
          Upload submission
        </ModalHeader>
        <ModalBody>
          <form onSubmit={submit} className={styles.form} aria-busy={pending}>
            <label htmlFor="task-upload-file">Submission file</label>
            <input
              id="task-upload-file"
              type="file"
              accept={acceptedTypes.join(',')}
              disabled={pending}
              aria-describedby="task-upload-help"
              onChange={event => {
                setFile(event.target.files[0] || null);
                setError('');
              }}
            />
            <p id="task-upload-help">PDF, DOCX, TXT, JPEG, PNG, or GIF; up to 10 MB.</p>
            {simulationAvailable && (
              <label>
                <input
                  type="checkbox"
                  checked={simulate}
                  disabled={pending}
                  onChange={event => setSimulate(event.target.checked)}
                />
                Simulate upload locally (not saved; resets on refresh)
              </label>
            )}
            {error && <p role="alert">{error}</p>}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.uploadButton}
                disabled={pending}
                onClick={close}
              >
                Cancel
              </button>
              <button type="submit" className={styles.uploadButton} disabled={pending || !file}>
                {pending ? 'Uploading…' : 'Submit file'}
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
}
