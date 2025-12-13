//Job application page Wrapper
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ApiEndpoint } from '../../utils/URL';
import JobApplicationForm from './JobApplicationForm';
import './JobApplicationForm.css';

export default function JobApplicationPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const referralToken = qs.get('token') || '';

  const darkMode = useSelector(s => s.theme.darkMode);
  const userRole = useSelector(s => s.auth?.user?.role);
  const isAdmin = userRole === 'Administrator' || userRole === 'Owner';

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState({ title: 'Job', description: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        let j = { title: 'Job', description: '' };

        try {
          const res = await fetch(`${ApiEndpoint}/jobs/${jobId}`, { method: 'GET' });
          if (res.ok) {
            const jd = await res.json();
            const source = jd?.job || jd || {};
            j.title = source.title || 'Job';
            j.description = source.description || '';
          }
        } catch {
          j = {
            title: 'Software Developer',
            description:
              'We would like to have multiple contributors and are open to exploring win-win relationships with people of varying skill levels to help develop our Highest Good Network Application (HGNA). The app is built using the MERN stack...',
          };
        }

        if (active) {
          setJob({ title: j.title, description: j.description });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, referralToken]);

  if (loading) {
    return (
      <div className={`ja-loading ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>Loading…</div>
    );
  }

  return (
    <div className={darkMode ? 'bg-oxford-blue' : ''} style={{ minHeight: '100vh' }}>
      {/* Top banner (full width) */}
      <div className={`ja-edge ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <img src="/Top_image.png" alt="One Community header" className="ja-edge-img" />
      </div>

      {/* Job Application Form */}
      <JobApplicationForm
        jobTitle={job.title}
        jobDescription={job.description}
        darkMode={darkMode}
        isAdmin={isAdmin}
      />

      {/* Bottom banner (full width) */}
      <div className={`ja-edge ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <img src="/Bottom_image.png" alt="One Community footer" className="ja-edge-img" />
      </div>
    </div>
  );
}
