import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './CertificationProfile.module.css';

export default function CertificationProfile({ educator, onClose, onSave }) {
  const modalRef = useRef(null);

  const [editing, setEditing] = useState(null);
  const [selectedCertId, setSelectedCertId] = useState(''); // For existing PM certification
  const [certName, setCertName] = useState(''); // For new certification name
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [expiryDate, setExpiryDate] = useState('');
  const [allCertifications, setAllCertifications] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  // Fetch all PM certifications
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

  // Start editing
  const startEdit = cert => {
    setEditing(cert);
    setSelectedCertId(cert.certificationId?._id || '');
    setCertName('');
    setDescription(cert.certificationId?.description || '');
    setStatus(cert.status || 'in-progress');
    setExpiryDate(cert.expiryDate?.slice(0, 10) || '');
  };

  // Start adding
  const startAdd = () => {
    setEditing(null);
    setSelectedCertId('');
    setCertName('');
    setDescription('');
    setStatus('in-progress');
    setExpiryDate('');
  };

  // Handle save (add or edit)
  const handleSave = async () => {
    if (!selectedCertId && !certName) {
      setError('Please select a certification or enter a new name');
      return;
    }

    if (!educator?.educator?._id) {
      setError('Educator ID is missing');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User not authenticated');
        setSaving(false);
        return;
      }

      const payload = {};

      if (editing) {
        // EDIT existing
        const id = selectedCertId || editing.certificationId?._id;
        if (id) payload.certificationId = id;
        if (description) payload.description = description;
        if (status) payload.status = status;
        if (expiryDate) payload.expiryDate = expiryDate;
      } else {
        // ADD new
        if (selectedCertId) {
          payload.certificationId = selectedCertId; // existing cert
        } else if (certName) {
          payload.certificationName = certName; // new cert
          if (description) payload.description = description;
        }

        if (status) payload.status = status;
        if (expiryDate) payload.expiryDate = expiryDate;
      }

      const url = ENDPOINTS.PM_ASSIGN_CERTIFICATIONS(educator.educator._id);

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: token,
        },
      });

      const certNameFromList =
        selectedCertId && certList?.find(c => c._id === selectedCertId)?.name;

      const finalCertName = certNameFromList || certName || 'Unnamed Certification';

      const updatedCert = {
        _id: response.data._id,
        status: response.data.status,
        expiryDate: response.data.expiryDate,
        assignedAt: response.data.assignedAt,
        assignedBy: response.data.assignedBy,
        certificationId: {
          _id: response.data.certificationId,
          name: finalCertName,
        },
      };
      onSave();
      onClose();
    } catch (err) {
      console.error('Axios Error:', err);
      if (err.response?.data?.error) setError(err.response.data.error);
      else setError('Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  const certList = educator.certifications || [];

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleBackdropClick(e)}
    >
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modalBody}>
          <h2 className={styles.modalTitle}>Certifications — {educator.educator.email}</h2>

          {error && <div className={styles.error}>{error}</div>}

          {/* Existing Certifications */}
          <div className={styles.certList}>
            {certList.map(cert => (
              <div key={cert._id} className={styles.certItem}>
                <div>
                  <div className={styles.certName}>{cert.certificationId?.name}</div>
                  <div
                    className={`${styles.certStatus} ${
                      styles[`status_${cert.status.replace(/-/g, '')}`]
                    }`}
                  >
                    {cert.status}
                  </div>
                </div>
                <button className={styles.editButton} onClick={() => startEdit(cert)}>
                  Edit
                </button>
              </div>
            ))}
          </div>

          <button className={styles.addButton} onClick={startAdd}>
            + Add Certification
          </button>

          {/* FORM */}
          <div className={styles.formSection}>
            {/* SELECT EXISTING */}
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

            {/* NEW CERT NAME */}
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

            {/* DESCRIPTION */}
            {(!editing && !selectedCertId) || editing ? (
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
            ) : null}

            {/* STATUS */}
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

            {/* EXPIRY */}
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
          {/* ACTIONS */}
          <div className={styles.modalActions}>
            <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
            <button className={styles.cancelButton} onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
