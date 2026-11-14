import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import CertificationProfile from './CertificationProfile';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './EducatorTrainingDashboard.module.css';

export default function EducatorTrainingDashboard() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [educators, setEducators] = useState([]);
  const [selectedEducator, setSelectedEducator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCertifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(ENDPOINTS.PM_EDUCATOR_CERTIFICATIONS());
        const data = response.data || [];

        const grouped = {};
        data.forEach(item => {
          const educator = item.educatorId;
          if (!grouped[educator._id]) {
            grouped[educator._id] = {
              educator: {
                _id: educator._id,
                email: educator.email,
                firstName: educator.firstName || '',
                lastName: educator.lastName || '',
              },
              certifications: [],
            };
          }

          grouped[educator._id].certifications.push({
            _id: item._id,
            certificationId: item.certificationId || {},
            status: item.status || 'in-progress',
            expiryDate: item.expiryDate,
            assignedAt: item.assignedAt,
            assignedBy: item.assignedBy?.email || 'N/A',
          });
        });
        setEducators(Object.values(grouped));
      } catch (err) {
        console.error(err);
        setError('Failed to load educator certification data.');
      } finally {
        setLoading(false);
      }
    };

    // Trailing catch block handles raw script runtime lifecycle rejections cleanly
    fetchCertifications().catch(err => {
      console.error('Data retrieval chain failure:', err);
    });
  }, [refreshKey]);

  const updateEducatorCerts = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <div className={styles.loader}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.etdContainer} data-theme={darkMode ? 'dark' : 'light'}>
      <h1 className={styles.etdTitle}>Educator Training Dashboard</h1>

      <div className={styles.etdTableWrapper}>
        <table className={styles.etdTable}>
          <thead>
            <tr>
              <th>Educator</th>
              <th>Certifications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(educators || []).map(edu => (
              <tr key={edu.educator._id}>
                <td>
                  {edu.educator.firstName} {edu.educator.lastName}
                  <div className={styles.etdSubtext}>{edu.educator.email}</div>
                </td>
                <td>
                  {edu.certifications.map(cert => {
                    const cleanStatus = (cert.status || '').toLowerCase().replace(/[\s-]/g, '');
                    const statusClassName = styles[`etdStatus_${cleanStatus}`] || '';

                    return (
                      <div key={cert._id} className={styles.etdCertItem}>
                        <strong>{cert.certificationId?.name || 'Unnamed Certification'}</strong>
                        {' — '}
                        <span className={`${styles.etdCertStatus} ${statusClassName}`}>
                          {cert.status}
                        </span>
                      </div>
                    );
                  })}
                </td>
                <td>
                  <button
                    type="button"
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
          darkMode={darkMode}
          onClose={() => setSelectedEducator(null)}
          onSave={updateEducatorCerts}
        />
      )}
    </div>
  );
}
