import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import hasPermission from '~/utils/permissions';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import CollaborationJobFilters from './CollaborationJobFilters';

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

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

  /** TOOLTIP INIT */
  useEffect(() => {
    if (!localStorage.getItem('tooltipDismissed')) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  /** FETCH CATEGORIES */
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`);
      if (!response.ok) throw new Error('Failed to Fetch');

      const data = await response.json();
      setCategories([...data.categories].sort((a, b) => a.localeCompare(b)));
    } catch {
      toast.error('Error fetching categories');
    }
  };

  /** FETCH JOB ADS */
  const fetchJobAds = async (search, cats, page) => {
    const adsPerPage = 20;
    const categoryParam = cats.length ? encodeURIComponent(cats.join(',')) : '';

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${page}&limit=${adsPerPage}&search=${encodeURIComponent(
          search,
        )}&category=${categoryParam}`,
      );

      if (!response.ok) throw new Error('Request failed while fetching Job Ads');

      const data = await response.json();

      const sorted = [...data.jobs].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        if (a.featured !== b.featured) return b.featured - a.featured;
        return new Date(b.datePosted) - new Date(a.datePosted);
      });

      setJobAds(sorted);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error('Error fetching jobs');
    }
  };

  /** INITIAL CATEGORY FETCH */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobAds(query, selectedCategories, currentPage);
  }, [query, selectedCategories, currentPage]);

  /** SEARCH HANDLERS */
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

  /** CATEGORY SELECTION */
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

  /** CLICK OUTSIDE DROPDOWN */
  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /** TOOLTIP DISMISS */
  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => {
    setTooltipPosition('category');
  };

  /** SUMMARIES FETCH */
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

  /** RENDER HELPERS */
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
    />
  );

  const renderCategoryChips = () =>
    selectedCategories.length > 0 && (
      <>
        <p className={styles.selectedLabel}>Selected Categories:</p>
        <div className={styles.chipContainer}>
          {selectedCategories.map(cat => (
            <div key={cat} className={`${styles.chip} btn btn-secondary`}>
              {cat}
              <button
                type="button"
                className={styles.chipClose}
                onClick={() => removeCategory(cat)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </>
    );

  /** MAIN VIEW */
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

        {showSearchResults ? (
          <div className={styles.jobDetails}>
            <div className={styles.jobQueries}>
              {searchTerm || selectedCategories.length ? (
                <p className={styles.jobQuery}>
                  Listing results
                  {searchTerm && (
                    <>
                      {' '}
                      for <strong>&apos;{searchTerm}&apos;</strong>
                    </>
                  )}
                  {selectedCategories.length > 0 && (
                    <>
                      {' '}
                      for <strong>{selectedCategories.length}</strong> selected categories
                    </>
                  )}
                </p>
              ) : (
                <p className={styles.jobQuery}>Listing all job ads.</p>
              )}

              <button className="btn btn-secondary" onClick={handleShowSummaries}>
                Show Summaries
              </button>
            </div>

            {jobAds.length ? (
              <div className={styles.jobList}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles.jobAd}>
                    <img
                      src={`/api/placeholder/640/480?text=${encodeURIComponent(ad.category)}`}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
                      }}
                      alt={ad.title}
                      loading="lazy"
                    />

                    <a
                      href={`https://www.onecommunityglobal.org/seeking-${ad.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')}/`}
                    >
                      <h3>
                        {ad.title} - {ad.category}
                      </h3>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.jobNoResults}>
                <h2>No job ads found.</h2>
              </div>
            )}

            <div className={styles.jobPagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={currentPage === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </div>
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
