// src/pages/Collaboration/Collaboration.jsx
import { useEffect, useState, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { useSelector } from 'react-redux';
import OneCommunityImage from '../../assets/images/logo2.png';

const ADS_PER_PAGE = 18;

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [summaries, setSummaries] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState('');

  const dropdownRef = useRef(null);
  const [selectedJob, setSelectedJob] = useState(null);

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
        `&category=${encodeURIComponent(JSON.stringify(categoriesSelected))}`;

      const res = await fetch(url);
      const data = await res.json();
      setAllJobs(data.jobs || []);
    } catch {
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${ApiEndpoint}/jobs/categories`);
      const data = await res.json();
      setCategories((data.categories || []).sort((a, b) => a.localeCompare(b)));
    } catch {
      toast.error('Error fetching categories');
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs();
  }, [searchTerm, categoriesSelected]);

  /* ================= FILTERED JOBS ================= */
  const filteredJobs = useMemo(() => {
    if (!selectedPosition) return allJobs;

    return allJobs.filter(job =>
      (job.position || job.title || '').toLowerCase().includes(selectedPosition.toLowerCase()),
    );
  }, [allJobs, selectedPosition]);

  /* ================= PAGINATION ================= */
  useEffect(() => {
    const start = (currentPage - 1) * ADS_PER_PAGE;
    setJobAds(filteredJobs.slice(start, start + ADS_PER_PAGE));

    const calculatedPages = Math.ceil(filteredJobs.length / ADS_PER_PAGE);
    setTotalPages(Math.max(calculatedPages, 1));
  }, [filteredJobs, currentPage]);

  /* ================= ESC CLOSE MODAL ================= */
  useEffect(() => {
    if (!selectedJob) return;
    const esc = e => e.key === 'Escape' && setSelectedJob(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [selectedJob]);

  /* ================= CLICK OUTSIDE DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = e => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleClearAllFilters = () => {
    setCategoriesSelected([]);
    setSelectedPosition('');
    setSearchTerm('');
    setQuery('');
    setCurrentPage(1);
  };

  const handleShowSummaries = async () => {
    try {
      const res = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${encodeURIComponent(
          JSON.stringify(categoriesSelected),
        )}`,
      );
      setSummaries(await res.json());
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  const handleJobClick = ad => {
    const title = ad.title || '';
    const search = title ? `?jobTitle=${encodeURIComponent(title)}` : '';
    history.push({
      pathname: '/job-application',
      search,
      state: {
        jobId: ad._id,
        jobTitle: title,
        jobDescription: ad.description || '',
        requirements: ad.requirements || [],
        category: ad.category || 'General',
      },
    });
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

        <div className={`${styles.userCollaborationContainer} ${darkMode ? styles.dark : ''}`}>
          <h2>Job Summaries</h2>

          {summaries.jobs?.length ? (
            summaries.jobs.map(job => (
              <div key={job._id}>
                <h4>
                  <a href={job.jobDetailsLink}>{job.title}</a>
                </h4>
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
            <button className="btn btn-secondary">Go</button>
          </form>

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setShowCategoryDropdown(p => !p)}>
              Select Categories ▼
            </button>

            {showCategoryDropdown && (
              <div className={styles.jobSelect}>
                {categories.map(cat => (
                  <label key={cat} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={categoriesSelected.includes(cat)}
                      onChange={() =>
                        setCategoriesSelected(prev =>
                          prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat],
                        )
                      }
                    />
                    {cat}
                  </label>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* HEADINGS */}
        <div className={styles.headings}>
          <h1 className={styles.jobHead}>LIKE TO WORK WITH US? APPLY NOW!</h1>
        </div>

        {/* QUERY TEXT */}
        <div>
          <p>
            {searchTerm
              ? `Listing results for '${searchTerm}'`
              : selectedPosition
              ? `Listing results for '${selectedPosition}'`
              : categoriesSelected.length
              ? 'Listing results for selected categories'
              : 'Listing all job ads.'}
          </p>
          <button className="btn btn-secondary" onClick={handleShowSummaries}>
            Show Summaries
          </button>
        </div>

        {/* FILTER CHIPS */}
        {(categoriesSelected.length > 0 || selectedPosition) && (
          <div className={styles.jobQueries}>
            {categoriesSelected.map(cat => (
              <span key={cat} className={styles.chip}>
                {cat}
              </span>
            ))}
            <button className={styles.clearAllButton} onClick={handleClearAllFilters}>
              Clear All
            </button>
          </div>
        )}

        {/* JOB GRID */}
        <div className={styles.jobList}>
          {jobAds.map(ad => (
            <button
              key={ad._id}
              type="button"
              className={styles.jobAd}
              onClick={() => handleJobClick(ad)}
            >
              <img
                src={
                  ad.imageUrl ||
                  `/api/placeholder/640/480?text=${encodeURIComponent(ad.category || 'Job')}`
                }
                alt={ad.title}
              />
              <h3>{ad.title}</h3>
            </button>
          ))}
        </div>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={
                currentPage === i + 1 ? styles.paginationButtonActive : styles.paginationButton
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={() => setSelectedJob(null)}>
              ×
            </button>

            <h2>{selectedJob.title}</h2>
            <p>
              <strong>Category:</strong> {selectedJob.category}
            </p>
            <p>{selectedJob.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaboration;
