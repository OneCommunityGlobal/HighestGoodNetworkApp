// src/pages/Collaboration/Collaboration.jsx
import { useEffect, useState } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import { useSelector } from 'react-redux';
import OneCommunityImage from '../../assets/images/logo2.png';

const ADS_PER_PAGE = 18; // 3 rows × 6 cols

function Collaboration() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobAds, setJobAds] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [summaries, setSummaries] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  // slugify category for external URL like seeking-mechanical-engineer
  const slugify = (s = '') =>
    s
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  useEffect(() => {
    const tooltipDismissed = localStorage.getItem('tooltipDismissed');
    if (!tooltipDismissed) {
      setShowTooltip(true);
      setTooltipPosition('search');
    }
  }, []);

  const fetchJobAds = async (givenQuery, givenCategory, page = currentPage) => {
    try {
      const url =
        `${ApiEndpoint}/jobs` +
        `?page=${page}&limit=${ADS_PER_PAGE}` +
        `&search=${encodeURIComponent(givenQuery || '')}` +
        `&category=${encodeURIComponent(givenCategory || '')}`;

      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

      const data = await response.json();
      setJobAds(data.jobs || []);

      // Robust totalPages calculation with safe fallback (at least 1)
      const p = data?.pagination || {};
      const fromTotalPages = typeof p.totalPages === 'number' ? p.totalPages : undefined;
      const fromTotalCount =
        typeof p.total === 'number'
          ? Math.ceil(p.total / ADS_PER_PAGE)
          : typeof data.total === 'number'
          ? Math.ceil(data.total / ADS_PER_PAGE)
          : undefined;

      const pages = fromTotalPages ?? fromTotalCount ?? 1;
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      toast.error('Error fetching jobs');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);
      const data = await response.json();
      const sorted = (data.categories || []).sort((a, b) => a.localeCompare(b));
      setCategories(sorted);
    } catch {
      toast.error('Error fetching categories');
    }
  };

  const handleSearch = e => {
    setQuery(e.target.value);
    if (!selectedCategory && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('category');
      setShowTooltip(true);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSearchTerm(query);
    setSelectedCategory(category);
    setShowSearchResults(true);
    setSummaries(null);
    setCurrentPage(1);
    fetchJobAds(query, category, 1);
  };

  const handleCategoryChange = e => {
    const value = e.target.value;
    setCategory(value);
    if (!searchTerm && !localStorage.getItem('tooltipDismissed')) {
      setTooltipPosition('search');
      setShowTooltip(true);
    }
  };

  const handleRemoveQuery = () => {
    setQuery('');
    setSearchTerm('');
    setCurrentPage(1);
    fetchJobAds('', selectedCategory, 1); // keep category, clear search
  };

  const handleRemoveCategory = () => {
    setCategory('');
    setSelectedCategory('');
    setCurrentPage(1);
    fetchJobAds(searchTerm, '', 1); // keep search, clear category
  };

  const handleShowSummaries = async () => {
    try {
      const url =
        `${ApiEndpoint}/jobs/summaries` +
        `?search=${encodeURIComponent(searchTerm || '')}` +
        `&category=${encodeURIComponent(selectedCategory || '')}`;
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      const data = await response.json();
      setSummaries(data);
    } catch {
      toast.error('Error fetching summaries');
    }
  };

  const dismissCategoryTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('tooltipDismissed', 'true');
  };

  const dismissSearchTooltip = () => setTooltipPosition('category');

  // Keep filters during paging (use submitted filters, not live inputs)
  useEffect(() => {
    fetchJobAds(searchTerm, selectedCategory, currentPage);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory]);

  // Initial load
  useEffect(() => {
    fetchJobAds('', '', 1);
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ————— Summaries view —————
  if (summaries) {
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
          {/* NAVBAR (search bars) */}
          <nav className="job-navbar">
            <div className="job-navbar-left">
              <form className="search-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={query}
                  onChange={handleSearch}
                />
                <button className="btn btn-secondary" type="submit">
                  Go
                </button>
              </form>
              {showTooltip && tooltipPosition === 'search' && (
                <div className="job-tooltip">
                  <p>Use the search bar to refine your search further!</p>
                  <button
                    type="button"
                    className="job-tooltip-dismiss"
                    onClick={dismissSearchTooltip}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>

            <div className="job-navbar-right">
              <select className="job-select" value={category} onChange={handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {showTooltip && tooltipPosition === 'category' && (
                <div className="job-tooltip category-tooltip">
                  <p>Use the categories to refine your search further!</p>
                  <button
                    type="button"
                    className="job-tooltip-dismiss"
                    onClick={dismissCategoryTooltip}
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* HEADING directly AFTER search bars */}
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

          <div className="job-queries">
            {searchTerm || selectedCategory ? (
              <p className="job-query">
                Listing results for
                {searchTerm && !selectedCategory && <strong> ‘{searchTerm}’</strong>}
                {selectedCategory && !searchTerm && <strong> ‘{selectedCategory}’</strong>}
                {searchTerm && selectedCategory && (
                  <strong>
                    {' '}
                    ‘{searchTerm} + {selectedCategory}’
                  </strong>
                )}{' '}
                .
              </p>
            ) : (
              <p className="job-query">Listing all job ads.</p>
            )}
            <button
              className="btn btn-secondary active"
              type="button"
              onClick={() => {
                setSummaries(null);
                setShowSearchResults(true);
              }}
            >
              Show Summaries
            </button>
          </div>

          <div className="jobs-summaries-list">
            {summaries?.jobs?.length ? (
              summaries.jobs.map(summary => (
                <div key={summary._id} className="job-summary-item">
                  <h3>
                    <a href={summary.jobDetailsLink}>{summary.title}</a>
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
          </div>
        </div>
      </div>
    );
  }

  // ————— Standard landing view —————
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
        {/* NAVBAR (search bars) */}
        <nav className="job-navbar">
          <div className="job-navbar-left">
            <form className="search-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Search by title..."
                value={query}
                onChange={handleSearch}
              />
              <button className="btn btn-secondary" type="submit">
                Go
              </button>
            </form>
            {showTooltip && tooltipPosition === 'search' && (
              <div className="job-tooltip">
                <p>Use the search bar to refine your search further!</p>
                <button
                  type="button"
                  className="job-tooltip-dismiss"
                  onClick={dismissSearchTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>

          <div className="job-navbar-right">
            <select className="job-select" value={category} onChange={handleCategoryChange}>
              <option value="">Select from Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {showTooltip && tooltipPosition === 'category' && (
              <div className="job-tooltip category-tooltip">
                <p>Use the categories to refine your search further!</p>
                <button
                  type="button"
                  className="job-tooltip-dismiss"
                  onClick={dismissCategoryTooltip}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* HEADING directly AFTER search bars */}
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
          <div>
            <div className="job-queries">
              {searchTerm || selectedCategory ? (
                <p className="job-query">
                  Listing results for
                  {searchTerm && !selectedCategory && <strong> ‘{searchTerm}’</strong>}
                  {selectedCategory && !searchTerm && <strong> ‘{selectedCategory}’</strong>}
                  {searchTerm && selectedCategory && (
                    <strong>
                      {' '}
                      ‘{searchTerm} + {selectedCategory}’
                    </strong>
                  )}{' '}
                  .
                </p>
              ) : (
                <p className="job-query">Listing all job ads.</p>
              )}

              <button className="btn btn-secondary" type="button" onClick={handleShowSummaries}>
                Show Summaries
              </button>
            </div>

            {jobAds.length ? (
              <div className="job-list">
                {jobAds.map(ad => (
                  <div key={ad._id} className="job-ad">
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
                        ad.category || 'general',
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
              <div className="no-results">
                <h2>No job ads found.</h2>
              </div>
            )}

            {/* Pagination: always visible (at least “1”) */}
            {totalPages >= 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="page-btn nav"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  aria-label="First page"
                >
                  «
                </button>

                <button
                  type="button"
                  className="page-btn nav"
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
                      className={`page-btn ${active ? 'is-active' : ''}`}
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
                  className="page-btn nav"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>

                <button
                  type="button"
                  className="page-btn nav"
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
          <div className={`job-headings ${darkMode ? ' user-collaboration-dark-mode' : ''}`}>
            <h1 className="job-head">Like to Work With Us? Apply Now!</h1>
            <p className="job-intro"> Learn about who we are and who we want to work with!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Collaboration;
