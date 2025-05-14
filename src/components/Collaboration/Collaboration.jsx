import { useEffect, useState } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from 'utils/URL';
import OneCommunityImage from '../../assets/images/logo2.png';

import 'leaflet/dist/leaflet.css';

const Collaboration = () => {
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

  useEffect(() => {
    fetchJobAds(query, category);
    fetchCategories();
  }, [currentPage]); // Re-fetch job ads when page or category changes

  const fetchJobAds = async (query, category) => {
    const adsPerPage = 20;

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${query}&category=${category}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      setJobAds(data.jobs);
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
  };

  const handleRemoveQuery = () => {
    setQuery('');
    setSearchTerm('');
    fetchJobAds('', category);
  }

  const handleRemoveCategory = () => {
    setCategory(''); 
    setSelectedCategory('');
    fetchJobAds(query, '');
  }

  const handleResetFilters = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to reset filters: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchTerm('');
      setSelectedCategory('');
      setCurrentPage(1);
      setJobAds(data.jobs);
      setTotalPages(data.pagination.totalPages);
      setSummaries(null);
    } catch (error) {
      toast.error('Error resetting filters');
    }
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

  if (summaries) {
    return (
      <div className="job-landing">
        <div className="header">
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" className="responsive-img" />
          </a>
        </div>
        <div className="collaboration-container">
          <nav className="collaboration-navbar">
            <div className="navbar-left">
              <form className="search-form">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="search-button" type="submit" onClick={handleSubmit}>
                  Go
                </button>
                <button type="button" onClick={handleResetFilters}>
                  Reset
                </button>
                <button
                  className="show-summaries"
                  type="button"
                  onClick={handleShowSummaries}
                >
                  Show Summaries
                </button>
              </form>
            </div>

            <div className="navbar-right">
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          <div className="summaries-list">
            <h1>Summaries</h1>
            {summaries && summaries.jobs && summaries.jobs.length > 0 ? (
              summaries.jobs.map(summary => (
                <div key={summary._id} className="summary-item">
                  <h3>
                    <a href={summary.jobDetailsLink}>{summary.title}</a>
                  </h3>
                  <p>{summary.description}</p>
                  <p>Date Posted: {new Date(summary.datePosted).toLocaleDateString()}</p>
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
      <div className="job-landing">
        <div className="header">
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>
        <div className="collaboration-container">
          <nav className="collaboration-navbar">
            <div className="navbar-left">
              <form className="search-form">
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={this.handleSearch}
                />
                <button className="search-button" type="submit" onClick={this.handleSubmit}>
                  Go
                </button>
                <button type="button" onClick={this.handleResetFilters}>
                  Reset
                </button>
                <button className="show-summaries" type="button" onClick={this.handleShowSummaries}>
                  Show Summaries
                </button>
              </form>
            </div>

          <div className="navbar-right">
            <select value={category} onChange={handleCategoryChange}>
              <option value="">Select from Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </nav>

        {showSearchResults ? (
          <div>
            <div className='job-queries'>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={handleShowSummaries}
              >
                Show Summaries
              </button>
              {searchTerm && (
                <div
                  className="query-option btn btn-secondary "
                  type="button"
                >
                  <span>{searchTerm}</span>
                  <button className="cross-button" type="button" onClick={handleRemoveQuery}>
                    <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/delete-sign.png" alt="delete-sign" />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div
                  className="btn btn-secondary query-option"
                  type="button"
                >
                  {selectedCategory}
                  <button className="cross-button" type="button" onClick={handleRemoveCategory}>
                    <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/delete-sign.png" alt="delete-sign" />
                  </button>
                </div>
              )}
            </div>

            {(jobAds.length !== 0) ? (
              <div className="job-list">{
                jobAds.map(ad => (
                  <div key={ad._id} className="job-ad">
                    <img
                      src={`/api/placeholder/640/480?text=${encodeURIComponent(
                        ad.category || 'Job Opening',
                      )}`}
                      onError={e => {
                        e.target.onerror = null;
                        if (ad.category === 'Engineering') {
                          e.target.src = 'https://img.icons8.com/external-prettycons-flat-prettycons/47/external-job-social-media-prettycons-flat-prettycons.png';
                        } else if (ad.category === 'Marketing') {
                          e.target.src = 'https://img.icons8.com/external-justicon-lineal-color-justicon/64/external-marketing-marketing-and-growth-justicon-lineal-color-justicon-1.png';
                        } else if (ad.category === 'Design') {
                          e.target.src = 'https://img.icons8.com/arcade/64/design.png';
                        } else if (ad.category === 'Finance') {
                          e.target.src = 'https://img.icons8.com/cotton/64/merchant-account--v2.png';
                        } else {
                          e.target.src = 'https://img.icons8.com/cotton/64/working-with-a-laptop--v1.png';
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
              <div className="no-results">
                <h2>No job ads found.</h2>
              </div>
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
        ) : (
          <div className="headings">
            <h1>Like to Work With Us? Apply Now!</h1>
            <p>Learn about who we are and who we want to work with!</p>
          </div>
        )
        }
      </div >
    </div >
  );
};

export default Collaboration;
