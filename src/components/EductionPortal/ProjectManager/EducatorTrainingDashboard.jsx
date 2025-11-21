import { useState } from 'react';
import CertificationProfile from './CertificationProfile';
import { mockEducatorCertifications } from './mockCertification';
import styles from './EducatorTrainingDashboard.module.css';

export default function EducatorTrainingDashboard() {
  const [educators, setEducators] = useState(mockEducatorCertifications);
  const [selectedEducator, setSelectedEducator] = useState(null);

  const updateEducatorCerts = (id, updatedCerts) => {
    setEducators(prev =>
      prev.map(e => (e.educator._id === id ? { ...e, certifications: updatedCerts } : e)),
    );
  };

  return (
    <div className={styles.etdContainer}>
      <h1 className={styles.etdTitle}>Educator Training Dashboard</h1>
      <p className={styles.etdSubtitle}>Track and manage educator certifications.</p>

      <div className={styles.etdTableWrapper}>
        <table className={styles.etdTable}>
          <thead className={styles.etdThead}>
            <tr>
              <th className={styles.etdTh}>Educator</th>
              <th className={styles.etdTh}>Certifications</th>
              <th className={styles.etdTh}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {educators.map(edu => (
              <tr key={edu.educator._id} className={styles.etdRow}>
                <td className={styles.etdTd}>
                  {edu.educator.firstName} {edu.educator.lastName}
                  <div className={styles.etdSubtext}>{edu.educator.email}</div>
                </td>

                <td className={styles.etdTd}>
                  {edu.certifications.map(c => (
                    <div key={c._id} className={styles.etdCertItem}>
                      <span className={styles.etdCertName}>{c.name}</span> —{' '}
                      <span
                        className={`${styles.etdCertStatus} ${
                          styles[`etdStatus_${c.status.replace(/\s+/g, '')}`]
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))}
                </td>

                <td className={styles.etdTd}>
                  <button
                    className={styles.etdActionButton}
                    onClick={() => setSelectedEducator(edu)}
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEducator && (
        <CertificationProfile
          educator={selectedEducator}
          onClose={() => setSelectedEducator(null)}
          onSave={updateEducatorCerts}
        />
      )}
    </div>
  );
}
