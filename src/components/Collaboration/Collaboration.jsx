import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import hasPermission from '~/utils/permissions';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const userHasPermission = permission => dispatch(hasPermission(permission));
  const canReorderJobs = userHasPermission('reorderJobs');

  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  const fetchJobAds = async (givenQuery, givenCategory) => {
    const adsPerPage = 20;

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${givenQuery}&category=${givenCategory}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();

      const sortedJobs = data.jobs.sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        if (a.featured !== b.featured) {
          return b.featured - a.featured; // Featured jobs first
        }
        return new Date(b.datePosted) - new Date(a.datePosted);
      });

      setJobAds(sortedJobs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      setCategories(sortedCategories);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = event => {
    setQuery(event.target.value);
    if (!selectedCategory && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('category');
      setShowTooltip(true);
    }
  };

  const handleSubmit = event => {
    event.preventDefault();
    setSearchTerm(query);
    setSelectedCategory(category);
    setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
    fetchJobAds(query, category);
  };

  const handleCategoryChange = event => {
    const selectedValue = event.target.value;
    setCategory(selectedValue);
    if (!searchTerm && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('search');
      setShowTooltip(true);
    }
  };

  const handleRemoveQuery = () => {
    setQuery('');
    setSearchTerm('');
    fetchJobAds('', category);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    setSelectedCategory('');
    fetchJobAds(query, '');
  };

  const handleShowSummaries = async () => {
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${selectedCategory}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      }

      const data = await response.json();
      setSummaries(data);
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };

  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => {
    setTooltipPosition('category');
  };

  const toggleReorderModal = () => {
    setIsReorderModalOpen(prevState => !prevState);
  };

  const handleJobsReordered = () => {
    // Refresh job listings after reordering
    fetchJobAds(query, category);
  };

  useEffect(() => {
    fetchJobAds(query, category);
    fetchCategories();
  }, [currentPage]);

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
          <nav className={styles.jobNavbar}>
            <div className={styles.jobNavbarLeft}>
              <form className={styles.jobSearchForm}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={query}
                  onChange={handleSearch}
                />
                <button className="btn btn-secondary" type="submit" onClick={handleSubmit}>
                  Go
                </button>

                {/* Only show reorder button for users with permission */}
                {canReorderJobs && (
                  <button
                    className={`btn btn-secondary ${styles.reorderButton}`}
                    type="button"
                    onClick={toggleReorderModal}
                  >
                    Edit to Reorder
                  </button>
                )}
              </form>
              {showTooltip && tooltipPosition === 'search' && (
                <div className={styles.jobTooltip}>
                  <p>Use the search bar to refine your search further!</p>
                  <button
                    type="button"
                    className={styles.jobTooltipDismiss}
                    onClick={dismissSearchTooltip}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>

            <div className={styles.jobNavbarRight}>
              <select className={styles.jobSelect} value={category} onChange={handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(specificCategory => (
                  <option key={specificCategory} value={specificCategory}>
                    {specificCategory}
                  </option>
                ))}
              </select>
              {showTooltip && tooltipPosition === 'category' && (
                <div className={`${styles.jobTooltip} ${styles.categoryTooltip}`}>
                  <p>Use the categories to refine your search further!</p>
                  <button
                    type="button"
                    className={styles.jobTooltipDismiss}
                    onClick={dismissCategoryTooltip}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </nav>
          <div className={styles.jobQueries}>
            {searchTerm.length !== 0 || selectedCategory.length !== 0 ? (
              <p className={styles.jobQuery}>
                Listing results for
                {searchTerm && !selectedCategory && <strong> &apos;{searchTerm}&apos;</strong>}
                {selectedCategory && !searchTerm && (
                  <strong> &apos;{selectedCategory}&apos;</strong>
                )}
                {searchTerm && selectedCategory && (
                  <strong>
                    {' '}
                    &apos;{searchTerm} + {selectedCategory}&apos;
                  </strong>
                )}
                .
              </p>
            ) : (
              <p className={styles.jobQuery}>Listing all job ads.</p>
            )}
            <button
              className="btn btn-secondary active"
              type="button"
              onClick={() => {
                setSummaries(null);
                setShowSearchResults(true);
              }}
            >
              Close Summaries
            </button>
            {searchTerm && (
              <div className={`${styles.jobQueryOption} btn btn-secondary`} type="button">
                <span>{searchTerm}</span>
                <button className={styles.jobCrossButton} type="button" onClick={handleRemoveQuery}>
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className={`${styles.jobQueryOption} btn btn-secondary`} type="button">
                {selectedCategory}
                <button
                  className={styles.jobCrossButton}
                  type="button"
                  onClick={handleRemoveCategory}
                >
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
            )}
          </div>
          <div className={styles.jobsSummariesList}>
            {summaries && summaries.jobs && summaries.jobs.length > 0 ? (
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

        {/* Reorder Modal */}
        {/* <JobReorderModal
          isOpen={isReorderModalOpen}
          toggle={toggleReorderModal}
          onJobsReordered={handleJobsReordered}
          darkMode={darkMode}
        /> */}
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
        <nav className={styles.jobNavbar}>
          <div className={styles.jobNavbarLeft}>
            <form className={styles.jobSearchForm}>
              <input
                type="text"
                placeholder="Search by title..."
                value={query}
                onChange={handleSearch}
              />
              <button className="btn btn-secondary" type="submit" onClick={handleSubmit}>
                Go
              </button>

              {/* Only show reorder button for users with permission */}
              {canReorderJobs && (
                <button
                  className={`btn btn-secondary ${styles.reorderButton}`}
                  type="button"
                  onClick={toggleReorderModal}
                >
                  Edit to Reorder
                </button>
              )}
            </form>
            {showTooltip && tooltipPosition === 'search' && (
              <div className={`${styles.jobTooltip}`}>
                <p>Use the search bar to refine your search further!</p>
                <button
                  type="button"
                  className={styles.jobTooltipDismiss}
                  onClick={dismissSearchTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          <div className={styles.jobNavbarRight}>
            <select className={styles.jobSelect} value={category} onChange={handleCategoryChange}>
              <option value="">Select from Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {showTooltip && tooltipPosition === 'category' && (
              <div className={`${styles.jobTooltip} ${styles.categoryTooltip}`}>
                <p>Use the categories to refine your search further!</p>
                <button
                  type="button"
                  className={styles.jobTooltipDismiss}
                  onClick={dismissCategoryTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </nav>

        {showSearchResults ? (
          <div className={styles.jobDetails}>
            <div className={styles.jobQueries}>
              {searchTerm.length !== 0 || selectedCategory.length !== 0 ? (
                <p className={styles.jobQuery}>
                  Listing results for
                  {searchTerm && !selectedCategory && <strong> &apos;{searchTerm}&apos;</strong>}
                  {selectedCategory && !searchTerm && (
                    <strong> &apos;{selectedCategory}&apos;</strong>
                  )}
                  {searchTerm && selectedCategory && (
                    <strong>
                      {' '}
                      &apos;{searchTerm} + {selectedCategory}&apos;
                    </strong>
                  )}
                  .
                </p>
              ) : (
                <p className={styles.jobQuery}>Listing all job ads.</p>
              )}
              <button className="btn btn-secondary" type="button" onClick={handleShowSummaries}>
                Show Summaries
              </button>
              {searchTerm && (
                <div className={`btn btn-secondary ${styles.jobQueryOption}`} type="button">
                  <span>{searchTerm}</span>
                  <button
                    className={styles.jobCrossButton}
                    type="button"
                    onClick={handleRemoveQuery}
                  >
                    <img
                      width="30"
                      height="30"
                      src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                      alt="delete-sign"
                    />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className={`btn btn-secondary ${styles.jobQueryOption}`} type="button">
                  {selectedCategory}
                  <button
                    className={styles.jobCrossButton}
                    type="button"
                    onClick={handleRemoveCategory}
                  >
                    <img
                      width="30"
                      height="30"
                      src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                      alt="delete-sign"
                    />
                  </button>
                </div>
              )}
            </div>

            {jobAds.length !== 0 ? (
              <div className={styles.jobList}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles.jobAd}>
                    <img
                      src={`/api/placeholder/640/480?text=${encodeURIComponent(
                        ad.category || 'Job Opening',
                      )}`}
                      onError={e => {
                        e.target.onerror = null;
                        if (ad.category === 'Engineering') {
                          e.target.src =
                            'https://img.icons8.com/external-prettycons-flat-prettycons/47/external-job-social-media-prettycons-flat-prettycons.png';
                        } else if (ad.category === 'Marketing') {
                          e.target.src =
                            'https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-marketing-marketing-and-growth-justicon-lineal-color-justicon-1.png';
                        } else if (ad.category === 'Design') {
                          e.target.src = 'https://img.icons8.com/arcade/64/design.png';
                        } else if (ad.category === 'Finance') {
                          e.target.src =
                            'https://img.icons8.com/cotton/64/merchant-account--v2.png';
                        } else {
                          e.target.src =
                            'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
                        }
                      }}
                      alt={ad.title || 'Job Position'}
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
          <div className={`${styles.jobHeadings} ${darkMode ? styles.darkMode : ''}`}>
            <h1 className={styles.jobHead}>Like to Work With Us? Apply Now!</h1>
            <p className={styles.jobIntro}> Learn about who we are and who we want to work with!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Collaboration;
