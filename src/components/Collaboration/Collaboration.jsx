import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import hasPermission from '~/utils/permissions';
import styles from './Collaboration.module.css';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import CollaborationJobFilters from './CollaborationJobFilters';

const ADS_PER_PAGE = 20;

const slugify = (s = '') =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [summaries, setSummaries] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const userHasPermission = perm => dispatch(hasPermission(perm));
  const canReorderJobs = userHasPermission('reorderJobs');

  useEffect(() => {
    if (!localStorage.getItem('tooltipDismissed')) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`);
      if (!response.ok) throw new Error('Failed to Fetch');

      const data = await response.json();
      setCategories([...(data.categories || [])].sort((a, b) => a.localeCompare(b)));
    } catch {
      toast.error('Error fetching categories');
    }
  };

  const fetchJobAds = async (search, cats, page) => {
    const categoryParam = cats.length ? encodeURIComponent(cats.join(',')) : '';

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${page}&limit=${ADS_PER_PAGE}&search=${encodeURIComponent(
          search,
        )}&category=${categoryParam}`,
      );

      if (!response.ok) throw new Error('Request failed while fetching Job Ads');

      const data = await response.json();

      const sorted = [...(data.jobs || [])].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        if (a.featured !== b.featured) return b.featured - a.featured;
        return new Date(b.datePosted) - new Date(a.datePosted);
      });

      const pagination = data?.pagination || {};
      const fromTotalPages =
        typeof pagination.totalPages === 'number' ? pagination.totalPages : undefined;
      const fromTotalCount =
        typeof pagination.total === 'number'
          ? Math.ceil(pagination.total / ADS_PER_PAGE)
          : typeof data.total === 'number'
          ? Math.ceil(data.total / ADS_PER_PAGE)
          : undefined;

      setJobAds(sorted);
      setTotalPages(Math.max(1, fromTotalPages ?? fromTotalCount ?? 1));
    } catch {
      toast.error('Error fetching jobs');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobAds(query, selectedCategories, currentPage);
  }, [query, selectedCategories, currentPage]);

  const handleSearch = e => {
    const value = e.target.value;
    setQuery(value);

    if (!selectedCategories.length && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('category');
      setShowTooltip(true);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSearchTerm(query);
    setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
  };

  const toggleCategory = category => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category],
    );
    setCurrentPage(1);
  };

  const removeCategory = category => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
    setCurrentPage(1);
  };

  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => setTooltipPosition('category');

  const handleShowSummaries = async () => {
    const categoryParam = selectedCategories.join(',');

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${categoryParam}`,
      );
      if (!response.ok) throw new Error('Error Fetching Job Summaries');
      setSummaries(await response.json());
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  const toggleReorderModal = () => setIsReorderModalOpen(prev => !prev);

  const handleJobsReordered = () => {
    fetchJobAds(query, selectedCategories, currentPage);
  };

  const renderFilters = () => (
    <CollaborationJobFilters
      query={query}
      handleSearch={handleSearch}
      handleSubmit={handleSubmit}
      canReorderJobs={canReorderJobs}
      toggleReorderModal={toggleReorderModal}
      showTooltip={showTooltip}
      tooltipPosition={tooltipPosition}
      dismissSearchTooltip={dismissSearchTooltip}
      dismissCategoryTooltip={dismissCategoryTooltip}
      dropdownRef={dropdownRef}
      isDropdownOpen={isDropdownOpen}
      setIsDropdownOpen={setIsDropdownOpen}
      categories={categories}
      selectedCategories={selectedCategories}
      toggleCategory={toggleCategory}
      isReorderModalOpen={isReorderModalOpen}
      handleJobsReordered={handleJobsReordered}
    />
  );

  const renderCategoryChips = () => (
    <div className={styles.chipContainer}>
      {selectedCategories.map(cat => (
        <div key={cat} className={`${styles.chip} btn btn-secondary`}>
          {cat}
          <button className={styles.chipClose} onClick={() => removeCategory(cat)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  if (summaries) {
    return (
      <div className={`${styles.jobLanding} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.jobHeader}>
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>

        <div className={styles.jobContainer}>
          {renderFilters()}
          {renderCategoryChips()}

          <div className={styles.jobsSummariesList}>
            {summaries.jobs?.length > 0 ? (
              summaries.jobs.map(summary => (
                <div key={summary._id} className={styles.jobSummaryItem}>
                  <h3>
                    <a href={summary.jobDetailsLink}>{summary.title}</a>
                  </h3>
                  <div className={styles.jobSummaryContent}>
                    <p>{summary.description}</p>
                    <p>Date Posted: {new Date(summary.datePosted).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No summaries found.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.jobLanding} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.jobHeader}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>

      <div className={styles.jobContainer}>
        {renderFilters()}
        {renderCategoryChips()}

        <div className="headings">
          <h1 className="job-head">LIKE TO WORK WITH US? APPLY NOW!</h1>
          <p>
            <a
              className="btn"
              href="https://www.onecommunityglobal.org/collaboration/"
              target="_blank"
              rel="noreferrer"
            >
              ← Return to One Community Collaboration Page
            </a>
          </p>
        </div>

        {showSearchResults ? (
          <div className={styles.jobDetails}>
            <div className={styles.jobQueries}>
              {searchTerm.length || selectedCategories.length ? (
                <p className={styles.jobQuery}>
                  Listing results for{' '}
                  <strong>
                    {searchTerm && `'${searchTerm}' `}
                    {selectedCategories.length > 0 &&
                      selectedCategories.map(c => `'${c}'`).join(', ')}
                  </strong>
                </p>
              ) : (
                <p className={styles.jobQuery}>Listing all job ads.</p>
              )}

              <button className="btn btn-secondary" onClick={handleShowSummaries}>
                Show Summaries
              </button>

              {searchTerm && (
                <div className={`${styles.chip} btn btn-secondary`}>
                  {searchTerm}
                  <button className={styles.chipClose} onClick={() => setSearchTerm('')}>
                    ✕
                  </button>
                </div>
              )}
            </div>

            {jobAds.length ? (
              <div className={styles.jobList}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles.jobAd}>
                    <img
                      src={
                        ad.imageUrl ||
                        `/api/placeholder/640/480?text=${encodeURIComponent(
                          ad.category || 'Job Opening',
                        )}`
                      }
                      onError={e => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
                      }}
                      alt={`${ad.title || 'Job'} — ${ad.category || ''}`}
                      loading="lazy"
                    />
                    <a
                      href={`https://www.onecommunityglobal.org/collaboration/seeking-${slugify(
                        ad.category || ad.title || 'general',
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <h3>{ad.title || ''}</h3>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.jobNoResults}>
                <h2>No job ads found.</h2>
              </div>
            )}

            {totalPages >= 1 && (
              <div className={styles.jobPagination}>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="First page"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  const active = currentPage === pageNum;
                  return (
                    <button
                      type="button"
                      key={pageNum}
                      className={active ? styles.activePage : ''}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={active}
                      aria-current={active ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  aria-label="Last page"
                >
                  »
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.jobHeadings}>
            <h1 className={styles.jobHead}>Like to Work With Us? Apply Now!</h1>
            <p className={styles.jobIntro}>Learn about who we are and who we want to work with!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Collaboration;
