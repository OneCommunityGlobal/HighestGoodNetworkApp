import { useState, useEffect, useRef } from 'react';
import styles from './CertificationProfile.module.css';

export default function CertificationProfile({ educator, onClose, onSave }) {
  const [editing, setEditing] = useState(null);
  const [certName, setCertName] = useState('');
  const [status, setStatus] = useState('Not Started');
  const modalRef = useRef(null);

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Click outside modal to close
  const handleBackdropClick = e => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Required by eslint (click events must have key events)
  const handleBackdropKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  };

  const startEdit = cert => {
    setEditing(cert);
    setCertName(cert.name);
    setStatus(cert.status);
  };

  const startAdd = () => {
    setEditing(null);
    setCertName('');
    setStatus('Not Started');
  };

  const handleSave = () => {
    let updatedCerts;

    if (editing) {
      // Update existing cert
      updatedCerts = educator.certifications.map(c =>
        c._id === editing._id ? { ...c, name: certName, status } : c,
      );
    } else {
      // Add new cert
      updatedCerts = [
        ...educator.certifications,
        {
          _id: crypto.randomUUID(),
          name: certName,
          status,
        },
      ];
    }

    onSave(educator.educator._id, updatedCerts);
    onClose();
  };

  return (
    <div
      className={styles.modalBackdrop}
      role="button"
      tabIndex={0}
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
    >
      <div className={styles.modal} ref={modalRef}>
        <h2 className={styles.modalTitle}>
          Certifications for {educator.educator.firstName} {educator.educator.lastName}
        </h2>

        <div className={styles.certList}>
          {educator.certifications.map(cert => (
            <div key={cert._id} className={styles.certItem}>
              <div>
                <div className={styles.certName}>{cert.name}</div>
                <div className={`${styles.certStatus} ${styles[cert.status.replace(' ', '')]}`}>
                  {cert.status}
                </div>
              </div>

              <button
                className={styles.editButton}
                onClick={() => startEdit(cert)}
                aria-label={`Edit certification ${cert.name}`}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        <button className={styles.addButton} onClick={startAdd} aria-label="Add new certification">
          + Add Certification
        </button>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="certNameInput">Certification Name</label>
            <input
              id="certNameInput"
              type="text"
              value={certName}
              onChange={e => setCertName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="certStatusSelect">Status</label>
            <select
              id="certStatusSelect"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className={styles.select}
            >
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.saveButton} onClick={handleSave}>
              {editing ? 'Update' : 'Add'}
            </button>

            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
