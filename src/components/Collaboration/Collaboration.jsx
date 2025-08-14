import { Component } from 'react';
import styles from './Collaboration.module.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

function Collaboration() {
  // const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [loading, setLoading] = useState();
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

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
    console.log(selectedCategory);
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
    setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
    // fetchJobAds(query, category);
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
    fetchJobAds(searchTerm, selectedValue);
  };

  const handleRemoveQuery = () => {
    // setQuery('');
    setSearchTerm('');
    fetchJobAds('', category);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    setSelectedCategory('');
    fetchJobAds(searchTerm, '');
  };

  const handleShowSummaries = async () => {
    // eslint-disable-next-line no-console
    console.log('handleShowSummaries');

    // eslint-disable-next-line no-console
    console.log(searchTerm);
    // eslint-disable-next-line no-console
    console.log(selectedCategory);

    // eslint-disable-next-line no-console
    console.log(summaries);
    {
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
    <div className={`job-landing ${darkMode ? 'user-collaboration-dark-mode' : ''}`}>
      <div className="job-header">
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </div>
      <div className="user-collaboration-container">
        <nav className="job-navbar">
          <div className="job-navbar-left">
            <form className="search-form">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <button className="btn btn-secondary" type="submit" onClick={handleSubmit}>
                Go
              </button>
            </form>
          </div>

          <div className="job-navbar-right">
            <select className="job-select" value={category} onChange={handleCategoryChange}>
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
          <div className="job-tooltip">
            <p>Use the search bar to refine your search further!</p>
            <button type="button" className="job-tooltip-dismiss" onClick={dismissSearchTooltip}>
              Got it
            </button>
          </div>
        )}
        {showTooltip && tooltipPosition === 'category' && (
          <div className="job-tooltip category-tooltip">
            <p>Use the categories to refine your search further!</p>
            <button type="button" className="job-tooltip-dismiss" onClick={dismissCategoryTooltip}>
              Got it
            </button>
          </div>
        )}
        <div className="job-queries">
          {searchTerm.length !== 0 || category.length !== 0 ? (
            <h3 className="job-query">
              Listing results for
              {searchTerm && !category && <h3> &apos;{searchTerm}&apos;</h3>}
              {category && !searchTerm && <strong> &apos;{category}&apos;</strong>}
              {searchTerm && category && (
                <strong>
                  &apos;{searchTerm} + {category}&apos;
                </strong>
              )}
              .
            </h3>
          ) : (
            <p className="job-query">Listing all job ads.</p>
          )}
          <button className="btn btn-secondary active" type="button" onClick={handleShowSummaries}>
            Show Summaries
          </button>
          {(searchTerm && category && (
            <>
              <div className="btn btn-secondary query-option" type="button">
                {searchTerm}
                <button className="cross-button" type="button" onClick={handleRemoveCategory}>
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
              <div className="btn btn-secondary query-option" type="button">
                {category}
                <button className="cross-button" type="button" onClick={handleRemoveCategory}>
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
              <div className="query-option btn btn-secondary " type="button">
                <span>{searchTerm}</span>
                <button className="cross-button" type="button" onClick={handleRemoveQuery}>
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
              <div className="btn btn-secondary query-option" type="button">
                {category}
                <button className="cross-button" type="button" onClick={handleRemoveCategory}>
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/delete-sign.png"
                    alt="delete-sign"
                  />
                </button>
              </div>
            ))}
          {category && (
            <div className="btn btn-secondary query-option" type="button">
              {category}
              <button className="cross-button" type="button" onClick={handleRemoveCategory}>
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
        {!loading && jobAds.length !== 0 ? (
          <div className="job-list">
            {jobAds.map(ad => (
              <div key={ad._id} className="job-ad">
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
        ) : (
          <div className="no-results">
            <h2>No job ads found.</h2>
          </div>
        )}
        {summaries && summaries.jobs && summaries.jobs.length > 0 ? (
          summaries.jobs.map(summary => (
            <div key={summary._id} className="job-summary-item">
              <h3>
                <a href={`${summary.jobDetailsLink}`} target="_blank" rel="noreferrer">
                  {summary.title}
                </a>
              </h3>
              <div className="job-summary-content">
                <p>{summary.description}</p>
                <p>Date Posted: {new Date(summary.datePosted).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No summaries found.</p>
        )}
        <div className="pagination">
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
    </div>
  );
}

export default connect(mapStateToProps)(Collaboration);
