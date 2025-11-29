import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import hasPermission from '~/utils/permissions';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';
import CollaborationJobFilters from './CollaborationJobFilters'; // ✅ NEW IMPORT

function Collaboration() {
  /* -------------------------------------- */
  /* STATE                                  */
  /* -------------------------------------- */
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

  /* -------------------------------------- */
  /* TOOLTIP INIT                           */
  /* -------------------------------------- */
  useEffect(() => {
    if (!localStorage.getItem('tooltipDismissed')) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  /* -------------------------------------- */
  /* FETCH CATEGORIES                       */
  /* -------------------------------------- */
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

  /* -------------------------------------- */
  /* FETCH JOB ADS                           */
  /* -------------------------------------- */
  const fetchJobAds = async (term, cats) => {
    const adsPerPage = 20;
    const categoryParam = cats.join(',');

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${term}&category=${categoryParam}`,
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

  /* -------------------------------------- */
  /* INITIAL FETCH ON PAGE LOAD + PAGINATION */
  /* -------------------------------------- */
  useEffect(() => {
    fetchCategories();
    fetchJobAds(query, selectedCategories);
  }, [currentPage]);

  /* -------------------------------------- */
  /* SEARCH HANDLERS                        */
  /* -------------------------------------- */
  const handleSearch = e => {
    setQuery(e.target.value);

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
    fetchJobAds(query, selectedCategories);
  };

  /* -------------------------------------- */
  /* CATEGORY SELECTION                      */
  /* -------------------------------------- */
  const toggleCategory = category => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        const updated = prev.filter(c => c !== category);
        fetchJobAds(query, updated);
        return updated;
      }
      const updated = [...prev, category];
      fetchJobAds(query, updated);
      return updated;
    });
  };

  const removeCategory = category => {
    const updated = selectedCategories.filter(c => c !== category);
    setSelectedCategories(updated);
    fetchJobAds(query, updated);
  };

  /* -------------------------------------- */
  /* CLICK OUTSIDE DROPDOWN                  */
  /* -------------------------------------- */
  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* -------------------------------------- */
  /* TOOLTIP DISMISS                         */
  /* -------------------------------------- */
  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => {
    setTooltipPosition('category');
  };

  /* -------------------------------------- */
  /* SUMMARIES FETCH                         */
  /* -------------------------------------- */
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
    fetchJobAds(query, selectedCategories);
  };

  /* -------------------------------------- */
  /* SUMMARY VIEW                            */
  /* -------------------------------------- */
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

          {/* CHIPS */}
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

          {/* SUMMARY LIST */}
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

  /* -------------------------------------- */
  /* MAIN VIEW (NO SUMMARIES)               */
  /* -------------------------------------- */
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

        {/* CATEGORY CHIPS */}
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

        {/* RESULTS */}
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

            {/* JOB ADS */}
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
                      href={`https://www.onecommunityglobal.org/collaboration/seeking-${ad.category.toLowerCase()}`}
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

            {/* PAGINATION */}
            <div className={styles.jobPagination}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  type="button"
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
