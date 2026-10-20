import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './CertificationProfile.module.css';

export default function CertificationProfile({ educator, darkMode, onClose, onSave }) {
  const modalRef = useRef(null);

  const [editing, setEditing] = useState(null);
  const [selectedCertId, setSelectedCertId] = useState('');
  const [certName, setCertName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [expiryDate, setExpiryDate] = useState('');
  const [allCertifications, setAllCertifications] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = e => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  useEffect(() => {
    const fetchAllCerts = async () => {
      try {
        const res = await axios.get(ENDPOINTS.PM_CERTIFICATIONS());
        setAllCertifications(res.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load certifications.');
      }
    };

    fetchAllCerts();
  }, []);

  const startEdit = cert => {
    setEditing(cert);
    setSelectedCertId(cert.certificationId?._id || '');
    setCertName('');
    setDescription(cert.certificationId?.description || '');
    setStatus(cert.status || 'in-progress');
    setExpiryDate(cert.expiryDate?.slice(0, 10) || '');
  };

  const startAdd = () => {
    setEditing(null);
    setSelectedCertId('');
    setCertName('');
    setDescription('');
    setStatus('in-progress');
    setExpiryDate('');
  };

  const validateSaveInput = (selectedId, name, educatorId, token) => {
    if (!selectedId && !name) {
      return 'Please select a certification or enter a new name';
    }
    if (!educatorId) {
      return 'Educator ID is missing';
    }
    if (!token) {
      return 'User not authenticated';
    }
    return null;
  };

  const buildCertPayload = (isEditing, selectedId, name, desc, currentStatus, date) => {
    const payload = {};
    if (currentStatus) payload.status = currentStatus;
    if (date) payload.expiryDate = date;

    if (isEditing) {
      const id = selectedId || isEditing.certificationId?._id;
      if (id) payload.certificationId = id;
      if (desc) payload.description = desc;
      return payload;
    }

    if (selectedId) {
      payload.certificationId = selectedId;
    } else if (name) {
      payload.certificationName = name;
      if (desc) payload.description = desc;
    }
    return payload;
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const educatorId = educator?.educator?._id;

    const validationError = validateSaveInput(selectedCertId, certName, educatorId, token);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = buildCertPayload(
        editing,
        selectedCertId,
        certName,
        description,
        status,
        expiryDate,
      );

      const url = ENDPOINTS.PM_ASSIGN_CERTIFICATIONS(educatorId);
      await axios.post(url, payload, {
        headers: { Authorization: token },
      });

      onSave();
      onClose();
    } catch (err) {
      console.error('Axios Error:', err);
      setError(err.response?.data?.error || 'Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  const certList = educator.certifications || [];

  // Cleaned up statement instead of a complex inline nested ternary
  const shouldRenderDescription = editing || !selectedCertId;

  return (
    <div
      className={styles.modalBackdrop}
      data-theme={darkMode ? 'dark' : 'light'}
      onClick={handleBackdropClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleBackdropClick(e)}
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Certifications — {educator.educator.email}</h2>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.certList}>
            {certList.map(cert => {
              const cleanStatus = (cert.status || '').toLowerCase().replace(/[\s-]/g, '');
              const statusClassName = styles[`status_${cleanStatus}`] || '';

              return (
                <div key={cert._id} className={styles.certItem}>
                  <div>
                    <div className={styles.certName}>{cert.certificationId?.name}</div>
                    <div className={`${styles.certStatus} ${statusClassName}`}>{cert.status}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => startEdit(cert)}
                  >
                    Edit
                  </button>
                </div>
              );
            })}
          </div>

          <button type="button" className={styles.addButton} onClick={startAdd}>
            + Add Certification
          </button>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="existingCertSelect">Select Existing Certification</label>
              <select
                id="existingCertSelect"
                value={selectedCertId}
                onChange={e => setSelectedCertId(e.target.value)}
                className={styles.select}
                disabled={saving || editing}
              >
                <option value="">-- Select --</option>
                {allCertifications.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {!editing && !selectedCertId && (
              <div className={styles.formGroup}>
                <label htmlFor="newCertName">New Certification Name</label>
                <input
                  id="newCertName"
                  type="text"
                  value={certName}
                  onChange={e => setCertName(e.target.value)}
                  className={styles.input}
                  disabled={saving}
                />
              </div>
            )}

            {shouldRenderDescription && (
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={styles.textarea}
                  rows={3}
                  disabled={saving}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={styles.select}
                disabled={saving}
              >
                <option value="active">Active</option>
                <option value="in-progress">In Progress</option>
                <option value="revoked">Revoked</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className={styles.input}
                disabled={saving}
              />
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
