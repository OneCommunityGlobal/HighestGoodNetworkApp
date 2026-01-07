// src/pages/Collaboration/Collaboration.jsx
import { useEffect, useState } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { useSelector } from 'react-redux';
import OneCommunityImage from '../../assets/images/logo2.png';

const ADS_PER_PAGE = 18;

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const slugify = s =>
    (s || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  /* ================= FETCH JOBS ================= */
  const fetchJobs = async () => {
    try {
      const url =
        `${ApiEndpoint}/jobs` +
        `?search=${encodeURIComponent(searchTerm || '')}` +
        `&category=${encodeURIComponent(category || '')}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');

      const data = await res.json();

      const jobs = data.jobs || [];
      // const MULTIPLIER = 10;
      // const duplicatedJobs = jobs.flatMap((job, i) =>
      //   Array.from({ length: MULTIPLIER }).map((_, j) => ({
      //     ...job,
      //     _id: `${job._id}-dup-${i}-${j}`,
      //   })),
      // );
      setAllJobs(jobs);
      setTotalPages(Math.max(1, Math.ceil(jobs.length / ADS_PER_PAGE)));
    } catch {
      toast.error('Error fetching jobs');
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${ApiEndpoint}/jobs/categories`);
      const data = await res.json();
      setCategories((data.categories || []).sort());
    } catch {
      toast.error('Error fetching categories');
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
    setCurrentPage(1);
  }, [searchTerm, category]);

  useEffect(() => {
    const start = (currentPage - 1) * ADS_PER_PAGE;
    const end = start + ADS_PER_PAGE;
    setJobAds(allJobs.slice(start, end));
  }, [allJobs, currentPage]);

  /* ================= HANDLERS ================= */
  const handleSubmit = e => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleShowSummaries = async () => {
    try {
      const url =
        `${ApiEndpoint}/jobs/summaries` +
        `?search=${encodeURIComponent(searchTerm || '')}` +
        `&category=${encodeURIComponent(category || '')}`;

      const res = await fetch(url);
      const data = await res.json();
      setSummaries(data);
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  /* ================= SUMMARIES VIEW ================= */
  if (summaries) {
    return (
      <div className={`${styles.jobLanding} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.jobHeader}>
          <a href="https://www.onecommunityglobal.org/collaboration/">
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>

        <div className={styles.userCollaborationContainer}>
          <h2>Job Summaries</h2>

          {summaries.jobs?.length ? (
            summaries.jobs.map(job => (
              <div key={job._id} className="job-summary-item">
                <h3>
                  <a href={job.jobDetailsLink}>{job.title}</a>
                </h3>
                <p>{job.description}</p>
              </div>
            ))
          ) : (
            <p>No summaries found.</p>
          )}

          <button className="btn btn-secondary" onClick={() => setSummaries(null)}>
            ← Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  /* ================= MAIN VIEW ================= */
  return (
    <div className={`${styles.jobLanding} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.jobHeader}>
        <a href="https://www.onecommunityglobal.org/collaboration/">
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>

      <div className={styles.userCollaborationContainer}>
        {/* NAVBAR */}
        <nav className={styles.navbar}>
          <form className={styles.searchForm} onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search by title..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="btn btn-secondary" type="submit">
              Go
            </button>
          </form>

          <select
            className={`${styles.jobSelect} ${darkMode ? styles.jobSelectDark : ''}`}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">Select from Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </nav>

        {/* HEADING */}
        <div className={styles.headings}>
          <h1 className={styles.jobHead}>LIKE TO WORK WITH US? APPLY NOW!</h1>
          <p>
            <a className="btn" href="https://www.onecommunityglobal.org/collaboration/">
              ← Return to One Community Collaboration Page
            </a>
          </p>
        </div>

        {/* LISTING TEXT + SUMMARY BUTTON */}
        <div className="job-queries">
          <p className="job-query">
            {searchTerm || category
              ? `Listing results for ${
                  searchTerm && category
                    ? `'${searchTerm}' + '${category}'`
                    : `'${searchTerm || category}'`
                }`
              : 'Listing all job ads.'}
          </p>

          <button className="btn btn-secondary" type="button" onClick={handleShowSummaries}>
            Show Summaries
          </button>
        </div>

        {/* JOB GRID */}
        <div className={styles.jobList}>
          {jobAds.map(ad => (
            <div key={ad._id} className={styles.jobAd}>
              <img
                src={
                  ad.imageUrl ||
                  `/api/placeholder/640/480?text=${encodeURIComponent(ad.category || 'Job')}`
                }
                alt={ad.title}
              />
              <a
                href={`https://www.onecommunityglobal.org/collaboration/seeking-${slugify(
                  ad.category,
                )}`}
              >
                <h3>{ad.title}</h3>
              </a>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
            «
          </button>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? styles.paginationButtonActive : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            ›
          </button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default Collaboration;
