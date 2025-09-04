import { useEffect, useState } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

function Collaboration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobAdsQueryTerm, setJobAdsQueryTerm] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [positions, setPositions] = useState([]);

  const [summaries, setSummaries] = useState([]);
  /* const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState(null); */
  const [loading, setLoading] = useState();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [hideSummaries, setHideSummaries] = useState(true);
  /*  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []); */

  const fetchSummaries = async (givenSearchTerm, givenCategory, givenPosition) => {
    // eslint-disable-next-line no-console
    console.log(givenSearchTerm);
    // eslint-disable-next-line no-console
    console.log(givenCategory);
    setLoading(true);

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${encodeURIComponent(
          givenSearchTerm,
        )}&category=${encodeURIComponent(givenCategory)}&position=${encodeURIComponent(
          givenPosition,
        )}&_=${Date.now()}`,
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
  const fetchJobAds = async (givenSearchTerm, givenCategory, givenPosition) => {
    // eslint-disable-next-line no-console
    console.log(givenSearchTerm);
    // eslint-disable-next-line no-console
    console.log(givenCategory);
    const adsPerPage = 10; // 20; previous value
    setLoading(true);
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${encodeURIComponent(
          givenSearchTerm,
        )}&category=${encodeURIComponent(givenCategory)}&position=${encodeURIComponent(
          givenPosition,
        )}&_=${Date.now()}`,
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

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/positions`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.statusText}`);
      }

      const data = await response.json();
      const sortedPositions = data.positions.sort((a, b) => a.localeCompare(b));
      setPositions(sortedPositions);
      // eslint-disable-next-line no-console
      console.log(positions);
    } catch (error) {
      toast.error('Error fetching positions');
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
    setJobAdsQueryTerm(searchTerm);
    // fetchJobAds(query, category);
    //if (hideSummaries)
    fetchSummaries(searchTerm, category, position);
    //else
    fetchJobAds(searchTerm, category, position);
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
    fetchSummaries(searchTerm, selectedValue, position);
    //else
    fetchJobAds(searchTerm, selectedValue, position);
    // fetchJobAds(searchTerm, category);
  };

  const handlePositionChange = event => {
    const selectedValue = event.target.value;
    // eslint-disable-next-line no-console
    console.log('event');
    // eslint-disable-next-line no-console
    console.log(selectedValue);
    // eslint-disable-next-line no-console
    console.log(event.target.value);
    // eslint-disable-next-line no-console
    console.log(searchTerm);

    setPosition(selectedValue);
    /* if (!searchTerm && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('search');
      setShowTooltip(true);
    } */
    //if (hideSummaries)
    fetchSummaries(searchTerm, category, selectedValue);
    //else
    fetchJobAds(searchTerm, category, selectedValue);
    // fetchJobAds(searchTerm, category);
  };

  const handleRemoveSearchTerm = () => {
    setSearchTerm('');
    setJobAdsQueryTerm('');
    //if (hideSummaries)
    fetchSummaries('', category, position);
    // else
    fetchJobAds('', category, position);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    // setSelectedCategory('');
    //if (hideSummaries)
    fetchSummaries(searchTerm, '', position);
    //else
    fetchJobAds(searchTerm, '', position);
  };

  const handleRemovePosition = () => {
    setPosition('');
    // setSelectedCategory('');
    //if (hideSummaries)
    fetchSummaries(searchTerm, category, '');
    //else
    fetchJobAds(searchTerm, category, '');
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
    fetchJobAds(searchTerm, category, position);
    // else
    fetchSummaries(searchTerm, category, position);
    /* if (hideSummaries) SummariesButton.label = 'Show Summaries';
    else SummariesButton.label = 'Hide Summaries'; */
    setHideSummaries(!hideSummaries);
  };
  function renderContent() {
    if (loading) return 'Loading';
    if (hideSummaries)
      return jobAds.length > 0 ? (
        <div className={styles['job-list-pagination']}>
          <div className={styles['job-list']}>
            {jobAds.map(ad => (
              <div key={ad._id} className={styles['job-ad']}>
                <img
                  src={`${ad.imageUrl}`}
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
                      e.target.src = 'https://img.icons8.com/cotton/64/merchant-account--v2.png';
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
      );
    return summaries && summaries.jobs && summaries.jobs.length > 0 ? (
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
      <div className={styles['no-results']}>
        <h2>No summaries found.</h2>
      </div>
    );
  }
  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => {
    setTooltipPosition('category');
  };

  useEffect(() => {
    // fetchJobAds(query, category);
    fetchJobAds(searchTerm, category, position);
    fetchCategories();
    fetchPositions();
  }, [currentPage]); // Re-fetch job ads when page or category changes

  const filters = [
    jobAdsQueryTerm && { label: jobAdsQueryTerm, onRemove: handleRemoveSearchTerm },
    category && { label: category, onRemove: handleRemoveCategory },
    position && { label: position, onRemove: handleRemovePosition },
  ].filter(Boolean);
  // eslint-disable-next-line no-console
  console.log(darkMode);
  return (
    <div
      className={`${styles['job-landing']} ${
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
          {/*<div className={styles['job-navbar-left']}> */}
          <form className={styles['search-form']}>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              name="searchTer"
              onChange={handleSearch}
            />
            <button className={`${styles.btn} btn-primary`} type="submit" onClick={handleSubmit}>
              Go
            </button>
          </form>
          {/*  </div> */}

          {/* <div className={styles['job-navbar-right']}> */}
          <select
            className={styles['job-select']}
            value={category}
            onChange={handleCategoryChange}
            name="selectCategory"
          >
            <option value="">Select from Categories</option>
            {categories.map(specificCategory => (
              <option key={specificCategory} value={specificCategory}>
                {specificCategory}
              </option>
            ))}
          </select>
          {/* </div> */}
          {/* <div className={styles['job-navbar-right']}> */}
          <select
            className={styles['job-select']}
            value={position}
            name="SelectPosition"
            onChange={handlePositionChange}
          >
            <option value="">Select from Positions</option>
            {positions.map(specificPosition => (
              <option key={specificPosition} value={specificPosition}>
                {specificPosition}
              </option>
            ))}
          </select>
          {/* </div> */}
          {/* <div className={styles['job-navbar-right']}> */}
          <button
            className={`${styles.btn} btn-primary`}
            type="button"
            onClick={handleShowSummaries}
            id="SummariesButton"
          >
            {hideSummaries ? 'Show Summaries' : 'Hide Summaries'}
          </button>
          {/* </div> */}
        </nav>
        {/*}      {showTooltip}
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
        )} */}
        <div className={styles['job-queries-title']}>
          {!searchTerm && !category && !position ? (
            <h3 className={styles['job-query']}>Listing all job ads.</h3>
          ) : (
            <h3 className={styles['job-query']}>
              Listing results for{' '}
              {[jobAdsQueryTerm, category, position].filter(Boolean).join(' + ')}
            </h3>
          )}
        </div>
        <div className={styles['filter-chips-container']}>
          {/*onClick={filter.onRemove} */}
          {filters.map((filter, index) => (
            <div key={index} className={styles['filter-chips']}>
              <h4 className={`${styles['filter-chip-heading']}`}>{filter.label}</h4>
              <button
                className={`btn btn-primary`}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  filter.onRemove();
                }}
              >
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                  alt="delete-sign"
                  className={`delete-icon ${darkMode ? 'dark-mode' : ''}`}
                />
              </button>
            </div>
          ))}
        </div>
        <div> {renderContent()}</div>

        {/*}
        {loading ? (
          'Loading'
        ) : hideSummaries ? (
          jobAds.length > 0 ? (
            <div className={styles['job-list-pagination']}>
              <div className={styles['job-list']}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles['job-ad']}>
                    <img
                      src={`${ad.imageUrl}`}
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
          <div className={styles['no-results']}>
            <h2>No summaries found.</h2>
          </div>
        )} */}
        {/*
        {hideSummaries ? (
          !loading && jobAds.length !== 0 ? (
            <div className={styles['job-list-pagination']}>
              <div className={styles['job-list']}>
                {jobAds.map(ad => (
                  <div key={ad._id} className={styles['job-ad']}>
                    <img
                      src={`${ad.imageUrl}`}
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
          <h2>No summaries found.</h2>
        )} */}
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(Collaboration);
