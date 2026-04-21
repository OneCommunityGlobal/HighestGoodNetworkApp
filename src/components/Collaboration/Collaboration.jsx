// src/pages/Collaboration/Collaboration.jsx
import { useEffect, useState, useMemo, useRef } from 'react';
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
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [summaries, setSummaries] = useState(null);
  // const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const categoryRef = useRef(null);
  const positionRef = useRef(null);

  // Modal
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
        `&category=${encodeURIComponent(selectedCategory || '')}`;

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

  /* ================= FETCH CATEGORIES ================= */
  const fetchPositions = async () => {
    try {
      const res = await fetch(`${ApiEndpoint}/jobs/positions`);
      const data = await res.json();

      setPositions((data.positions || []).sort((a, b) => a.localeCompare(b)));
    } catch {
      toast.error('Error fetching positions');
    }
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchJobs();
  }, [searchTerm, selectedCategory]);

  const filteredJobs = useMemo(() => {
    if (!selectedPosition) return allJobs;

    return allJobs.filter(job =>
      (job.position || job.title || '').toLowerCase().includes(selectedPosition.toLowerCase()),
    );
  }, [allJobs, selectedPosition]);

  const positions = useMemo(() => {
    const uniquePositions = [
      ...new Set(
        allJobs
          .filter(
            job =>
              !selectedCategory || job.category?.toLowerCase() === selectedCategory.toLowerCase(),
          )
          .map(job => job.position || job.title)
          .filter(Boolean),
      ),
    ];

    return uniquePositions.sort((a, b) => a.localeCompare(b));
  }, [allJobs, selectedCategory]);

  useEffect(() => {
    const start = (currentPage - 1) * ADS_PER_PAGE;
    setJobAds(filteredJobs.slice(start, start + ADS_PER_PAGE));

    const calculatedPages = Math.ceil(filteredJobs.length / ADS_PER_PAGE);
    setTotalPages(Math.max(calculatedPages, 1));
  }, [filteredJobs, currentPage]);

  useEffect(() => {
    if (!selectedJob) return;
    const esc = e => e.key === 'Escape' && setSelectedJob(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [selectedJob]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }

      if (positionRef.current && !positionRef.current.contains(event.target)) {
        setShowPositionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* ================= HANDLERS ================= */
  const handleSubmit = e => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('');
    setSelectedPosition('');
    setSearchTerm('');
    setQuery('');
    setCurrentPage(1);
  };

  const handleShowSummaries = async () => {
    try {
      const res = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${selectedCategory}`,
      );
      setSummaries(await res.json());
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

        <div className={`${styles.userCollaborationContainer} ${darkMode ? styles.dark : ''}`}>
          <h2>Job Summaries</h2>

          {summaries.jobs?.length ? (
            summaries.jobs.map(job => (
              <div key={job._id} className="job-summary-item">
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

          <div className={styles.dropdownWrapper} ref={categoryRef}>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(prev => !prev);
                setShowPositionDropdown(false);
              }}
              aria-expanded={showCategoryDropdown}
            >
              {selectedCategory || 'Select Categories'} ▼
            </button>

            {showCategoryDropdown && (
              <div className={styles.jobSelect}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedPosition('');
                      setShowCategoryDropdown(false);
                      setCurrentPage(1);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.dropdownWrapper} ref={positionRef}>
            <button
              type="button"
              disabled={!selectedCategory}
              onClick={() => {
                if (!selectedCategory) return;
                setShowPositionDropdown(prev => !prev);
                setShowCategoryDropdown(false);
              }}
              aria-expanded={showPositionDropdown}
            >
              {selectedPosition || 'Select Positions'} ▼
            </button>

            {showPositionDropdown && selectedCategory && (
              <div className={styles.jobSelect}>
                {positions.length > 0 ? (
                  positions.map(pos => (
                    <button
                      key={pos}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => {
                        setSelectedPosition(pos);
                        setShowPositionDropdown(false);
                        setCurrentPage(1);
                      }}
                    >
                      {pos}
                    </button>
                  ))
                ) : (
                  <div className={styles.dropdownItem}>No positions found</div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* HEADINGS */}
        <div className={styles.headings}>
          <h1 className={styles.jobHead}>LIKE TO WORK WITH US? APPLY NOW!</h1>
          <a className="btn" href="https://www.onecommunityglobal.org/collaboration/">
            ← Return to One Community Collaboration Page
          </a>
        </div>

        {/* QUERY TEXT */}
        <div className="job-queries">
          <p>
            {searchTerm
              ? `Listing results for '${searchTerm}'`
              : selectedPosition
              ? `Listing results for '${selectedPosition}' in '${selectedCategory}'`
              : selectedCategory
              ? `Listing results for '${selectedCategory}'`
              : 'Listing all job ads.'}
          </p>
          <button className="btn btn-secondary" onClick={handleShowSummaries}>
            Show Summaries
          </button>
        </div>

        {/* FILTER CHIPS */}
        {(selectedCategory || selectedPosition) && (
          <div className={styles.jobQueries}>
            {selectedCategory && <span className={styles.chip}>{selectedCategory}</span>}
            {selectedPosition && <span className={styles.chip}>{selectedPosition}</span>}
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
              onClick={() => setSelectedJob(ad)}
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
        <div className={styles.modalOverlay} aria-hidden="true">
          <div className={styles.modal}>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Close role details"
              onClick={() => setSelectedJob(null)}
            >
              ×
            </button>

            <h2>{selectedJob.title}</h2>
            <p>
              <strong>Category:</strong> {selectedJob.category}
            </p>
            <p>{selectedJob.description}</p>

            <div className={styles.modalActions}>
              <a
                className="btn btn-secondary"
                href={`https://www.onecommunityglobal.org/collaboration/seeking-${slugify(
                  selectedJob.category,
                )}`}
              >
                View Full Details
              </a>
              <button className="btn btn-primary" disabled>
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Collaboration;
