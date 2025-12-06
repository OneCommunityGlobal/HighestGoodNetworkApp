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

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState({ title: 'Job', description: '', requirements: [] });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        let j = { title: 'Job', description: '', requirements: [] };

        // Check if requirements were passed via location.state (from SuggestedJobsList)
        const requirementsFromState = location.state?.requirements || [];

        try {
          const res = await fetch(`${ApiEndpoint}/jobs/${jobId}`, { method: 'GET' });
          if (res.ok) {
            const jd = await res.json();
            const source = jd?.job || jd || {};
            j.title = source.title || location.state?.jobTitle || 'Job';
            j.description = source.description || location.state?.jobDescription || '';
            j.requirements = source.requirements || requirementsFromState || [];
          } else {
            // Fallback to location.state if API fails
            j.title = location.state?.jobTitle || 'Job';
            j.description = location.state?.jobDescription || '';
            j.requirements = requirementsFromState;
          }
        } catch {
          // Use location.state as fallback
          j = {
            title: location.state?.jobTitle || 'Software Developer',
            description:
              location.state?.jobDescription ||
              'We would like to have multiple contributors and are open to exploring win-win relationships with people of varying skill levels to help develop our Highest Good Network Application (HGNA). The app is built using the MERN stack...',
            requirements: requirementsFromState,
          };
        }

        if (active) {
          setJob({ title: j.title, description: j.description, requirements: j.requirements });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId, referralToken, location.state]);

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
        requirements={job.requirements || []}
        referralToken={referralToken}
        darkMode={darkMode}
      />

      {/* Bottom banner (full width) */}
      <div className={`ja-edge ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <img src="/Bottom_image.png" alt="One Community footer" className="ja-edge-img" />
      </div>
    </div>
  );
}
