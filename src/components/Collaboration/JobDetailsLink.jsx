import { Route, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import styles from '../Collaboration/JobDetailsLink.module.css';
import { de } from 'date-fns/locale';
import JobApplyLink from './JobApplyLink';

function JobDetailsLink() {
  const { givenId } = useParams();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [jobsDetail, setJobsDetail] = useState([]);

  const [jobsDetailById, setJobsDetailById] = useState([]);
  const [loading, setLoading] = useState();

  const getJobDetails = async (givenCategory, givenPosition) => {
    setLoading(true);
    // Note: route params from the jobDetailsLink are URL-encoded (e.g. %26, %2F).
    // We decode them to get plain text values ("Creative & Media", "Photoshop/Graphic Designer")
    // and then re-encode once when building the API URL to avoid double-encoding (e.g. %252F).

    const decodedCategory = decodeURIComponent(givenCategory);
    const decodedPosition = decodeURIComponent(givenPosition);
    // eslint-disable-next-line no-console
    console.log(`category: ${decodeURIComponent(givenCategory)}`);
    // eslint-disable-next-line no-console
    console.log(`position: ${decodeURIComponent(givenPosition)}`);

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?
        category=${encodeURIComponent(decodedCategory)}
        &position=${encodeURIComponent(decodedPosition)}`,
        {
          method: 'GET',
        },
      );
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data.jobs);
      setJobsDetail(data.jobs);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs Details');
    }
  };

  const handleApplyNow = e => {
    console.log('handleApplyNow clicked');
    //const templateId = jobsDetailById.applyLink.split('templates/')[1];
    //console.log(templateId);
    //window.location.href = `/JobApplyLink/${templateId}`;
    console.log(jobsDetailById.applyLink);
    const formId = jobsDetailById.applyLink.split('jobforms/')[1];
    console.log(formId);
    window.location.href = `/JobApplyLink/${formId}`;

    //JobApplyLink/templateId;
  };
  const getJobDetailsById = async id => {
    setLoading(true);

    const givenIdDecoded = decodeURIComponent(givenId);
    // eslint-disable-next-line no-console
    console.log(`givenIdDecoded: ${decodeURIComponent(givenIdDecoded)}`);

    try {
      const response = await fetch(`${ApiEndpoint}/jobs/${id}`, {
        method: 'GET',
      });
      // eslint-disable-next-line no-console
      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);
      setJobsDetailById(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs Details');
    }
  };

  useEffect(() => {
    // getJobDetails(category, position);
    getJobDetailsById(givenId);
  }, []);
  return (
    <div className={`${styles['job-details-landing']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <div className={styles['job-details-header']}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      {!loading ? (
        <div className={styles['job-details-container']}>
          <h2>
            {`Job Details for Category: ${jobsDetailById.category},
           Position: ${jobsDetailById.title}`}
          </h2>
          <img
            src={`${jobsDetailById.imageUrl}`}
            onError={e => {
              e.target.onerror = null;
              e.target.src = 'https://img.icons8.com/cotton/200/working-with-a-laptop--v1.png';
            }}
            alt={jobsDetailById.title || 'Job Position'}
            loading="lazy"
            className={styles['job-details-image']}
          />
          {['description', 'skills', 'requirements', 'projects', 'whoareyou', 'whoweare'].map(
            key =>
              jobsDetailById[key] && (
                <div
                  key={key}
                  className={styles['job-details-card']}
                  dangerouslySetInnerHTML={{ __html: jobsDetailById[key] }}
                />
              ),
          )}
          ;
          {/*<div
            className={styles['job-details-card']}
            dangerouslySetInnerHTML={{ __html: jobsDetailById.skills }}
          />
          <div
            className={styles['job-details-card']}
            dangerouslySetInnerHTML={{ __html: jobsDetailById.requirements }}
          />
          <div
            className={styles['job-details-card']}
            dangerouslySetInnerHTML={{ __html: jobsDetailById.projects }}
          />
          <div
            className={styles['job-details-card']}
            dangerouslySetInnerHTML={{ __html: jobsDetailById.whoareyou }}
          />
          <div
            className={styles['job-details-card']}
            dangerouslySetInnerHTML={{ __html: jobsDetailById.whoweare }}
          /> */}
          <button type="button" className="btn-primary" onClick={handleApplyNow}>
            Apply Now
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default JobDetailsLink;
