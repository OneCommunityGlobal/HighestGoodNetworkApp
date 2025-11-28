import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const [loading, setLoading] = useState();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [hideSummaries, setHideSummaries] = useState(true);

  const fetchSummaries = async (givenSearchTerm, givenCategory, givenPosition) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${encodeURIComponent(
          givenSearchTerm,
        )}&category=${encodeURIComponent(givenCategory)}&position=${encodeURIComponent(
          givenPosition,
        )}&_=${Date.now()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      }

      const data = await response.json();
      setSummaries(data);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };

  const fetchJobAds = async (givenSearchTerm, givenCategory, givenPosition) => {
    const adsPerPage = 10;
    setLoading(true);
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${encodeURIComponent(
          givenSearchTerm,
        )}&category=${encodeURIComponent(givenCategory)}&position=${encodeURIComponent(
          givenPosition,
        )}&_=${Date.now()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      setJobAds(data.jobs);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`);
      if (!response.ok) throw new Error(`Failed to fetch categories`);
      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      setCategories(sortedCategories);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/positions`);
      if (!response.ok) throw new Error(`Failed to fetch positions`);
      const data = await response.json();
      const sortedPositions = data.positions.sort((a, b) => a.localeCompare(b));
      setPositions(sortedPositions);
    } catch (error) {
      toast.error('Error fetching positions');
    }
  };

  const handleSearch = e => setSearchTerm(e.target.value);

  const handleSubmit = event => {
    event.preventDefault();
    setJobAds([]);
    setSummaries(null);
    setCurrentPage(1);
    setJobAdsQueryTerm(searchTerm);
    fetchSummaries(searchTerm, category, position);
    fetchJobAds(searchTerm, category, position);
  };

  const handleCategoryChange = e => {
    const val = e.target.value;
    setCategory(val);
    fetchSummaries(searchTerm, val, position);
    fetchJobAds(searchTerm, val, position);
  };

  const handlePositionChange = e => {
    const val = e.target.value;
    setPosition(val);
    fetchSummaries(searchTerm, category, val);
    fetchJobAds(searchTerm, category, val);
  };

  const handleRemoveSearchTerm = () => {
    setSearchTerm('');
    setJobAdsQueryTerm('');
    fetchSummaries('', category, position);
    fetchJobAds('', category, position);
  };

  const handleRemoveCategory = () => {
    setCategory('');
    fetchSummaries(searchTerm, '', position);
    fetchJobAds(searchTerm, '', position);
  };

  const handleRemovePosition = () => {
    setPosition('');
    fetchSummaries(searchTerm, category, '');
    fetchJobAds(searchTerm, category, '');
  };

  const handleShowSummaries = () => {
    fetchJobAds(searchTerm, category, position);
    fetchSummaries(searchTerm, category, position);
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
                    e.target.src =
                      ad.category === 'Engineering'
                        ? 'https://img.icons8.com/external-prettycons-flat-prettycons/200/external-job-social-media-prettycons-flat-prettycons.png'
                        : ad.category === 'Marketing'
                        ? 'https://img.icons8.com/external-justicon-lineal-color-justicon/200/external-marketing-marketing-and-growth-justicon-lineal-color-justicon-1.png'
                        : ad.category === 'Design'
                        ? 'https://img.icons8.com/arcade/200/design.png'
                        : ad.category === 'Finance'
                        ? 'https://img.icons8.com/cotton/200/merchant-account--v2.png'
                        : 'https://img.icons8.com/cotton/200/working-with-a-laptop--v1.png';
                  }}
                  alt={ad.title}
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
      <div className={styles['jobs-summaries-list']}>
        {summaries.jobs.map(summary => (
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
        ))}
        <div className={styles['job-summary-total']}>
          <h3>Total Jobs: {summaries.jobs.length}</h3>
        </div>
      </div>
    ) : (
      <div className={styles['no-results']}>
        <h2>No summaries found.</h2>
      </div>
    );
  }

  useEffect(() => {
    fetchJobAds(searchTerm, category, position);
    fetchCategories();
    fetchPositions();
  }, [currentPage]);

  const filters = [
    jobAdsQueryTerm && { label: jobAdsQueryTerm, onRemove: handleRemoveSearchTerm },
    category && { label: category, onRemove: handleRemoveCategory },
    position && { label: position, onRemove: handleRemovePosition },
  ].filter(Boolean);

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
          <form className={styles['search-form']}>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className={`${styles.btn} btn-primary`} type="submit" onClick={handleSubmit}>
              Go
            </button>
          </form>

          <select className={styles['job-select']} value={category} onChange={handleCategoryChange}>
            <option value="">Select from Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select className={styles['job-select']} value={position} onChange={handlePositionChange}>
            <option value="">Select from Positions</option>
            {positions.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            className={`${styles.btn} btn-primary`}
            type="button"
            onClick={handleShowSummaries}
          >
            {hideSummaries ? 'Show Summaries' : 'Hide Summaries'}
          </button>
        </nav>

        <div className={styles['job-queries-title']}>
          {!jobAdsQueryTerm && !category && !position ? (
            <h3 className={styles['job-query']}>Listing all job ads.</h3>
          ) : (
            <h3 className={styles['job-query']}>
              Listing results for{' '}
              {[jobAdsQueryTerm, category, position].filter(Boolean).join(' , ')}
            </h3>
          )}
        </div>

        <div className={styles['filter-chips-container']}>
          {filters.map((filter, index) => (
            <div key={index} className={styles['filter-chips']}>
              <h4 className={styles['filter-chip-heading']}>{filter.label}</h4>
              <button
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

        <div>{renderContent()}</div>
      </div>
    </div>
  );
}

export default Collaboration;
