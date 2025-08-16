import { useEffect, useState } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

function Collaboration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState([]);
  //  const [showSearchResults, setShowSearchResults] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [loading, setLoading] = useState();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [hideSummaries, setHideSummaries] = useState(true);
  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  const fetchSummaries = async (givenSearchTerm, givenCategory) => {
    // eslint-disable-next-line no-console
    console.log(givenSearchTerm);
    // eslint-disable-next-line no-console
    console.log(givenCategory);
    setLoading(true);

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${givenSearchTerm}&category=${givenCategory}`,
        {
          method: 'GET',
        },
      );
      // eslint-disable-next-line no-console
      console.log(response);

      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      }

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);

      setSummaries(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };
  const fetchJobAds = async (givenSearchTerm, givenCategory) => {
    // eslint-disable-next-line no-console
    console.log(givenSearchTerm);
    // eslint-disable-next-line no-console
    console.log(givenCategory);
    const adsPerPage = 20;
    setLoading(true);
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${givenSearchTerm}&category=${givenCategory}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      // eslint-disable-next-line no-console
      console.log(response);

      const data = await response.json();
      // eslint-disable-next-line no-console
      console.log(data);
      // eslint-disable-next-line no-console
      console.log(data.jobs);

      setJobAds(data.jobs);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sorted = Array.isArray(data?.categories)
        ? [...data.categories].sort((a, b) => a.localeCompare(b))
        : [];
      this.setState({ categories: sorted });
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
    // eslint-disable-next-line no-console
    console.log(localStorage.getItem('tooltipDismissed'));
    // eslint-disable-next-line no-console
    console.log(!localStorage.getItem('tooltipDismissed'));

    if (!category && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('category');
      setShowTooltip(true);
    }
  };

  const handleSubmit = event => {
    // eslint-disable-next-line no-console
    console.log('handleSubmit');
    setJobAds([]);
    // eslint-disable-next-line no-console
    console.log(searchTerm);
    event.preventDefault();
    // setSearchTerm(query);
    // setSelectedCategory(category);
    // setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
    // fetchJobAds(query, category);
    //if (hideSummaries)
    fetchSummaries(searchTerm, category);
    //else
    fetchJobAds(searchTerm, category);
  };

  const handleCategoryChange = event => {
    const selectedValue = event.target.value;
    // eslint-disable-next-line no-console
    console.log('event');
    // eslint-disable-next-line no-console
    console.log(selectedValue);
    // eslint-disable-next-line no-console
    console.log(event.target.value);
    // eslint-disable-next-line no-console
    console.log(searchTerm);

    setCategory(selectedValue);
    if (!searchTerm && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('search');
      setShowTooltip(true);
    }
    //if (hideSummaries)
    fetchSummaries(searchTerm, selectedValue);
    //else
    fetchJobAds(searchTerm, selectedValue);
    // fetchJobAds(searchTerm, category);
  };

  const handleRemoveSearchTerm = () => {
    // eslint-disable-next-line no-alert
    alert('handleRemoveSearchTerm');
    // setQuery('');
    setSearchTerm('');
    //if (hideSummaries)
    fetchSummaries('', category);
    // else
    fetchJobAds('', category);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    // setSelectedCategory('');
    //if (hideSummaries)
    fetchSummaries(searchTerm, '');
    //else
    fetchJobAds(searchTerm, '');
  };

  const handleShowSummaries = async () => {
    // eslint-disable-next-line no-console
    console.log('handleShowSummaries');
    // eslint-disable-next-line no-console
    console.log(searchTerm);
    // eslint-disable-next-line no-console
    console.log(category);

    // eslint-disable-next-line no-console
    console.log(summaries);
    // eslint-disable-next-line no-console
    console.log('hideSummaries');
    // eslint-disable-next-line no-console
    console.log(hideSummaries);

    //if (hideSummaries)
    fetchJobAds(searchTerm, category);
    // else
    fetchSummaries(searchTerm, category);
    setHideSummaries(!hideSummaries);
    /* {
      try {
        const response = await fetch(
          `${ApiEndpoint}/jobs/summaries?search=${searchTerm}&category=${category}`,
          {
            method: 'GET',
          },
        );
        // eslint-disable-next-line no-console
        console.log(response);

        if (!response.ok) {
          throw new Error(`Failed to fetch summaries: ${response.statusText}`);
        }

        const data = await response.json();
        // eslint-disable-next-line no-console
        console.log(data);

        setSummaries(data);
        setShowSummaries(!showSummaries);
      } catch (error) {
        toast.error('Error fetching summaries');
      }
    } /* else {
      setSummaries(null);
      setShowSearchResults(true);
    } */
  };

  setSummariesPage = page => {
    this.setState(
      prev => {
        const next =
          page < 1 ? 1 : page > prev.summariesTotalPages ? prev.summariesTotalPages : page;
        return { summariesPage: next };
      },
      () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    );
  };

  const dismissSearchTooltip = () => {
    setTooltipPosition('category');
  };

  useEffect(() => {
    // fetchJobAds(query, category);
    fetchJobAds(searchTerm, category);
    fetchCategories();
  }, [currentPage]); // Re-fetch job ads when page or category changes

  return (
    <div
      className={`${styles['job-landing']} {${
        darkMode ? styles['user-collaboration-dark-mode'] : ''
      }`}
    >
      <div className={styles['job-header']}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      <div className={styles['user-collaboration-container']}>
        <nav className={styles['job-navbar']}>
          <div className={styles['job-navbar-left']}>
            <form className={styles['search-form']}>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button
                className={`${styles.btn} btn-secondary`}
                type="submit"
                onClick={handleSubmit}
              >
                Go
              </button>
            </form>
          </div>

          <div className={styles['job-navbar-right']}>
            <select
              className={styles['job-select']}
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="">Select from Categories</option>
              {categories.map(specificCategory => (
                <option key={specificCategory} value={specificCategory}>
                  {specificCategory}
                </option>
              ))}
            </select>
          </div>
        </nav>
        {showTooltip}
        {showTooltip && tooltipPosition === 'search' && (
          <div className={styles['job-tooltip']}>
            <p>Use the search bar to refine your search further!</p>
            <button type="button" className="job-tooltip-dismiss" onClick={dismissSearchTooltip}>
              Got it
            </button>
          </div>
        )}
        {showTooltip && tooltipPosition === 'category' && (
          <div className={`${styles['job-tooltip']} ${styles['category-tooltip']}`}>
            <p>Use the categories to refine your search further!</p>
            <button
              type="button"
              className={styles['job-tooltip-dismiss']}
              onClick={dismissCategoryTooltip}
            >
              Got it
            </button>
          </div>
        )}
        <div className={styles['job-queries']}>
          {!searchTerm && !category ? (
            <h3 className={styles['job-query']}>Listing all job ads.</h3>
          ) : !searchTerm || !category ? (
            <div className={styles['job-query']}>
              {searchTerm && !category && <h3> Listing results for &apos;{searchTerm}&apos;</h3>}
              {category && !searchTerm && <h3> Listing results for &apos;{category} &apos; </h3>}.
            </div>
          ) : (
            <h3>
              Listing Results for &apos; {searchTerm} &apos; + &apos; {category} &apos;
            </h3>
          )}

          <button
            className={`${styles.btn} btn-secondary active`}
            type="button"
            onClick={handleShowSummaries}
          >
            Show Summaries
          </button>
          {(searchTerm && category && (
            <>
              <div
                className={`${styles.btn} btn-secondary ${styles['query-option']}`}
                type="button"
              >
                {searchTerm}
                <button
                  className={styles['cross-button']}
                  type="button"
                  onClick={handleRemoveSearchTerm}
                >
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
              <div
                className={`${styles.btn} btn-secondary ${styles['query-option']}`}
                type="button"
              >
                {category}
                <button
                  className={styles['cross-button']}
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
            </>
          )) ||
            (searchTerm && (
              <div
                className={`${styles['query-option']} ${styles.btn} btn-secondary`}
                type="button"
              >
                <span>{searchTerm}</span>
                <button
                  className={styles['cross-button']}
                  type="button"
                  onClick={handleRemoveSearchTerm}
                >
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
            )) ||
            (category && (
              <div
                className={`${styles.btn} ${styles['btn-secondary']} ${styles['query-option']}`}
                type="button"
              >
                {category}
                <button
                  className={styles['cross-button']}
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
            ))}
        </div>
        {hideSummaries ? (
          !loading && jobAds.length !== 0 ? (
            <div className={styles['job-list-pagination']}>
              <div className={styles['job-list']}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles['job-ad']}>
                    <img
                      src={`{ad.imageUrl}`}
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

                    <a href={`${ad.jobDetailsLink}`} target="_blank" rel="noreferrer">
                      <h5>
                        {ad.title} - {ad.category}
                      </h5>
                    </a>
                  </div>
                ))}
              </div>
              <div className={styles['pagination']}>
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
            <div className={styles['no-results']}>
              <h2>No job ads found.</h2>
            </div>
          )
        ) : summaries && summaries.jobs && summaries.jobs.length > 0 ? (
          summaries.jobs.map(summary => (
            <div key={summary._id} className={styles['job-summary-item']}>
              <h3>
                <a href={`${summary.jobDetailsLink}`} target="_blank" rel="noreferrer">
                  {summary.title}
                </a>
              </h3>
              <div className={styles['job-summary-content']}>
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
  );
}

export default connect(mapStateToProps)(Collaboration);
