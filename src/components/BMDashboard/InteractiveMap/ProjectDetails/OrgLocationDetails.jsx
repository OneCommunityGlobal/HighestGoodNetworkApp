import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import styles from './OrgLocationDetails.module.css';

const OrgLocationDetails = () => {
  const { orgId } = useParams();
  const history = useHistory();

  const darkMode = useSelector(state => state.theme.darkMode);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(ENDPOINTS.ORG_DETAILS(orgId));

        setProject(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load project details.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProject();
  }, [orgId]);

  const formatDate = date => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : styles.light}`}>
        <div className={styles.message}>Loading project details...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : styles.light}`}>
        <div className={styles.message}>
          <p>{error || 'Project not found.'}</p>
          <button type="button" className={styles.backButton} onClick={() => history.goBack()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : styles.light}`}>
      <div className={styles.header}>
        <div>
          <h1>{project.name}</h1>
          <p>Project ID: {project.orgId}</p>
        </div>

        <span className={`${styles.status} ${styles[project.status?.toLowerCase()] || ''}`}>
          {project.status}
        </span>
      </div>

      <section className={styles.card}>
        <h2>Project Overview</h2>
        <p>{project.description || 'No description available.'}</p>
      </section>

      <section className={styles.card}>
        <h2>Project Information</h2>

        <div className={styles.grid}>
          <div>
            <span className={styles.fieldLabel}>Country</span>
            <p>{project.country || 'N/A'}</p>
          </div>

          <div>
            <span className={styles.fieldLabel}>Latitude</span>
            <p>{project.latitude ?? 'N/A'}</p>
          </div>

          <div>
            <span className={styles.fieldLabel}>Longitude</span>
            <p>{project.longitude ?? 'N/A'}</p>
          </div>

          <div>
            <span className={styles.fieldLabel}>Start Date</span>
            <p>{formatDate(project.startDate)}</p>
          </div>

          <div>
            <span className={styles.fieldLabel}>End Date</span>
            <p>{formatDate(project.endDate)}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrgLocationDetails;
