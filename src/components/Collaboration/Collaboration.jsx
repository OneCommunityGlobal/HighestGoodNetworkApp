import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import hasPermission from '~/utils/permissions';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

function Collaboration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [summariesAll, setSummariesAll] = useState([]);
  const [summariesPage, setSummariesPage] = useState(1);
  const [summariesPageSize] = useState(6);
  const [summariesTotalPages, setSummariesTotalPages] = useState(0);
  const [columns, setColumns] = useState(() => getColumnsFromMQ());

  const darkMode = useSelector(state => state.theme?.darkMode);
  const dispatch = useDispatch();
  const history = useHistory();
  const userHasPermission = permission => dispatch(hasPermission(permission));
  const canReorderJobs = userHasPermission('reorderJobs');
  const isAdmin = useSelector(state => {
    try {
      const user = state?.auth?.user;
      const role = user?.role;
      return (
        role === 'Administrator' ||
        role === 'Owner' ||
        role === 'admin' ||
        role === 'ADMINISTRATOR' ||
        role === 'OWNER'
      );
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  });

  function getColumnsFromMQ() {
    if (typeof window === 'undefined') return 1;
    if (window.matchMedia('(min-width: 1600px)').matches) return 6;
    if (window.matchMedia('(min-width: 1300px)').matches) return 5;
    if (window.matchMedia('(min-width: 1017px)').matches) return 4;
    if (window.matchMedia('(min-width: 768px)').matches) return 3;
    if (window.matchMedia('(min-width: 480px)').matches) return 2;
    return 1;
  }

  const calculateAdsPerPage = () => {
    const rows = 5;
    return columns * rows;
  };

  const fetchJobAds = async () => {
    const adsPerPage = calculateAdsPerPage();

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}` +
          `&search=${encodeURIComponent(searchTerm)}` +
          `&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

      const data = await response.json();
      const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
      setJobAds(jobs);
      setTotalPages(data?.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sorted = Array.isArray(data?.categories)
        ? [...data.categories].sort((a, b) => a.localeCompare(b))
        : [];
      setCategories(sorted);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = e => setSearchTerm(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    setSummaries(null);
    setCurrentPage(1);
    fetchJobAds();
  };

  const handleCategoryChange = e => {
    const selectedValue = e.target.value;
    setSelectedCategory(selectedValue || '');
    setCurrentPage(1);
    setSummaries(null);
    fetchJobAds();
  };

  const handleResetFilters = async () => {
    try {
      const adsPerPage = calculateAdsPerPage();
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters?page=1&limit=${adsPerPage}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error(`Failed to reset filters: ${response.statusText}`);

      const data = await response.json();
      setSearchTerm('');
      setSelectedCategory('');
      setCurrentPage(1);
      setJobAds(Array.isArray(data?.jobs) ? data.jobs : []);
      setTotalPages(data?.pagination?.totalPages || 0);
      setSummaries(null);
      setSummariesAll([]);
      setSummariesPage(1);
      setSummariesTotalPages(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error resetting filters:', error);
      toast.error('Error resetting filters');
    }
  };

  const setPage = pageNumber => {
    setCurrentPage(pageNumber);
    fetchJobAds();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowSummaries = async () => {
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${encodeURIComponent(searchTerm)}` +
          `&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch summaries: ${response.statusText}`);

      const data = await response.json();
      const summariesData = Array.isArray(data?.jobs) ? data.jobs : [];

      setSummaries({ jobs: summariesData });
      setSummariesAll(summariesData);
      setSummariesPage(1);
      setSummariesTotalPages(Math.max(1, Math.ceil(summariesData.length / summariesPageSize)));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast.error('Error fetching summaries');
    }
  };

  const handleSetSummariesPage = page => {
    const next = page < 1 ? 1 : page > summariesTotalPages ? summariesTotalPages : page;
    setSummariesPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  };

  const handleResize = debounce(() => {
    const newCols = getColumnsFromMQ();
    if (newCols === columns) return;
    setColumns(newCols);
    setCurrentPage(1);
    fetchJobAds();
  }, 200);

  // Initial fetch and setup
  useEffect(() => {
    fetchJobAds();
    fetchCategories();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when page changes
  useEffect(() => {
    if (currentPage > 0) {
      fetchJobAds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const renderSummaries = () => {
    const start = (summariesPage - 1) * summariesPageSize;
    const end = start + summariesPageSize;
    const pageItems = summariesAll.slice(start, end);

    return (
      <div className={`${styles.jobLanding} ${darkMode ? styles.jobLandingDark : ''}`}>
        <div className={styles.header}>
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={OneCommunityImage}
              alt="One Community Logo"
              className={styles.responsiveImg}
            />
          </a>
        </div>

        <div className={styles.collabContainer}>
          <nav className={styles.navbar}>
            <div className={styles.navbarLeft}>
              <form className={styles.searchForm} onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className={styles.searchButton} type="submit">
                  Go
                </button>
                <button
                  className={styles.resetButton}
                  type="button"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
                <button
                  className={styles.showSummaries}
                  type="button"
                  onClick={handleShowSummaries}
                >
                  Show Summaries
                </button>
              </form>
            </div>

            <div className={styles.navbarRight}>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          <div className={styles.summariesList}>
            <h1>Summaries</h1>

            {pageItems.length > 0 ? (
              pageItems.map(summary => (
                <div
                  key={summary._id || summary.jobDetailsLink || summary.title}
                  className={styles.summariesItem}
                >
                  <h3>
                    <a href={summary.jobDetailsLink} target="_blank" rel="noreferrer">
                      {summary.title}
                    </a>
                  </h3>
                  <p>{summary.description}</p>
                  <p className={styles.date}>
                    Date Posted:{' '}
                    {summary.datePosted ? new Date(summary.datePosted).toLocaleDateString() : '—'}
                  </p>
                </div>
              ))
            ) : (
              <p>No summaries found.</p>
            )}

            {summariesTotalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: summariesTotalPages }, (_, i) => (
                  <button
                    type="button"
                    key={`summaries-${i}`}
                    onClick={() => handleSetSummariesPage(i + 1)}
                    disabled={summariesPage === i + 1}
                    className={darkMode ? 'bg-space-cadet text-light border-0' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (summaries) return renderSummaries();

  return (
    <div className={`${styles.jobLanding} ${darkMode ? styles.jobLandingDark : ''}`}>
      <div className={styles.header}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" className={styles.responsiveImg} />
        </a>
      </div>

      <div className={styles.collabContainer}>
        <nav className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <form className={styles.searchForm} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className={styles.searchButton} type="submit">
                Go
              </button>
              <button className={styles.resetButton} type="button" onClick={handleResetFilters}>
                Reset
              </button>
              <button
                className={styles.showSummaries}
                type="button"
                onClick={handleShowSummaries}
              >
                Show Summaries
              </button>
            </form>
          </div>

          <div className={styles.navbarRight}>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">Select from Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </nav>

        <div className={styles.headings}>
          <h1>Like to Work With Us? Apply Now!</h1>
          <p>Learn about who we are and who we want to work with!</p>
        </div>

        <div className={styles.jobList}>
          {jobAds.length > 0 ? (
            jobAds.map(ad => {
              if (!ad || !ad._id) return null;
              const jobTitle = ad.title || 'Untitled Position';
              const jobCategory = ad.category || 'General';
              const jobImageUrl =
                ad.imageUrl ||
                `/api/placeholder/640/480?text=${encodeURIComponent(jobCategory)}`;

              return (
                <div
                  key={ad._id}
                  className={styles.jobAd}
                  onClick={() => {
                    try {
                      if (history && typeof history.push === 'function') {
                        history.push({
                          pathname: '/job-application',
                          state: {
                            jobId: ad._id,
                            jobTitle: jobTitle,
                            jobDescription: ad.description || '',
                            requirements: Array.isArray(ad.requirements) ? ad.requirements : [],
                            category: jobCategory,
                          },
                        });
                      } else {
                        window.location.href = `/job-application`;
                      }
                    } catch (error) {
                      console.error('Error navigating to job application:', error);
                      toast.error('Error opening job application');
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={jobImageUrl}
                    alt={jobTitle}
                    loading="lazy"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      const category = jobCategory.toLowerCase();
                      if (category.includes('engineering')) {
                        e.currentTarget.src =
                          'https://img.icons8.com/external-prettycons-flat-prettycons/47/external-job-social-media-prettycons-flat-prettycons.png';
                      } else if (category.includes('marketing')) {
                        e.currentTarget.src =
                          'https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-marketing-marketing-and-growth-justicon-lineal-color-justicon-1.png';
                      } else if (category.includes('design')) {
                        e.currentTarget.src = 'https://img.icons8.com/arcade/64/design.png';
                      } else if (category.includes('finance')) {
                        e.currentTarget.src =
                          'https://img.icons8.com/cotton/64/merchant-account--v2.png';
                      } else {
                        e.currentTarget.src =
                          'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
                      }
                    }}
                  />
                  <h3>
                    {jobTitle} - {jobCategory}
                  </h3>
                </div>
              );
            })
          ) : (
            <p className={styles.noJobads}>No matching jobs found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => setPage(i + 1)}
                disabled={currentPage === i + 1}
                className={darkMode ? 'bg-space-cadet text-light border-0' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Collaboration;
