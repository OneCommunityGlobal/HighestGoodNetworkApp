import { Component } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from '~/utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

import 'leaflet/dist/leaflet.css';
import { connect } from 'react-redux';

/* eslint-disable */
class Collaboration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      selectedCategory: '',
      currentPage: 1,
      jobAds: [],
      totalPages: 0,
      categories: [],
      summaries: null,
      summariesAll: [],
      summariesPage: 1,
      summariesPageSize: 6,
      summariesTotalPages: 0,
    };
  }

  componentDidMount() {
    this.fetchJobAds();
    this.fetchCategories();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  fetchJobAds = async () => {
    const { searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = this.calculateAdsPerPage();

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${encodeURIComponent(
          searchTerm,
        )}&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.statusText}`);

      const data = await response.json();
      this.setState({
        jobAds: data.jobs,
        totalPages: data.pagination.totalPages,
      });
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.statusText}`);

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      this.setState({ categories: sortedCategories });
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  handleSearch = event => this.setState({ searchTerm: event.target.value });

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ summaries: null, currentPage: 1 }, this.fetchJobAds);
  };

  handleCategoryChange = event => {
    const selectedValue = event.target.value;
    this.setState(
      {
        selectedCategory: selectedValue === '' ? '' : selectedValue,
        currentPage: 1,
        summaries: null,
      },
      this.fetchJobAds,
    );
  };

  handleResetFilters = async () => {
    try {
      const adsPerPage = this.calculateAdsPerPage();
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters?page=1&limit=${adsPerPage}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error(`Failed to reset filters: ${response.statusText}`);

      const data = await response.json();
      this.setState({
        searchTerm: '',
        selectedCategory: '',
        currentPage: 1,
        jobAds: data.jobs,
        totalPages: data.pagination.totalPages,
        summaries: null,
        summariesAll: [],
        summariesPage: 1,
        summariesTotalPages: 0,
      });
    } catch (error) {
      toast.error('Error resetting filters');
    }
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber }, this.fetchJobAds);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  handleShowSummaries = async () => {
    const { searchTerm, selectedCategory, summariesPageSize } = this.state;
    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?search=${encodeURIComponent(
          searchTerm,
        )}&category=${encodeURIComponent(selectedCategory)}`,
        { method: 'GET' },
      );

      if (!response.ok) throw new Error(`Failed to fetch summaries: ${response.statusText}`);

      const data = await response.json();
      const summariesData = Array.isArray(data?.jobs) ? data.jobs : [];

      this.setState({
        summaries: { jobs: summariesData },
        summariesAll: summariesData,
        summariesPage: 1,
        summariesTotalPages: Math.max(1, Math.ceil(summariesData.length / summariesPageSize)),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Error fetching summaries');
    }
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

  calculateAdsPerPage = () => {
    const width = window.innerWidth;
    const columns =
      width >= 1600
        ? 6
        : width >= 1300
        ? 5
        : width >= 1024
        ? 4
        : width >= 768
        ? 3
        : width >= 480
        ? 2
        : 1;
    const rows = 5;
    return columns * rows;
  };

  handleResize = () => this.fetchJobAds();

  render() {
    const {
      searchTerm,
      selectedCategory,
      currentPage,
      jobAds,
      totalPages,
      categories,
      summaries,
      summariesAll,
      summariesPage,
      summariesPageSize,
      summariesTotalPages,
    } = this.state;

    if (summaries) {
      return (
        <div className={`job-landing ${this.props.darkMode ? 'dark-mode' : ''}`}>
          <div className="header">
            <a
              href="https://www.onecommunityglobal.org/collaboration/"
              target="_blank"
              rel="noreferrer"
            >
              <img src={OneCommunityImage} alt="One Community Logo" className="responsive-img" />
            </a>
          </div>

          <div className={`collab-container ${this.props.darkMode ? 'text-light' : ''}`}>
            <nav className="navbar">
              <div className="navbar-left">
                <form className="search-form" onSubmit={this.handleSubmit}>
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={this.handleSearch}
                  />
                  <button className="search-button" type="submit">
                    Go
                  </button>
                  <button className="reset-button" type="button" onClick={this.handleResetFilters}>
                    Reset
                  </button>
                  <button
                    className="show-summaries"
                    type="button"
                    onClick={this.handleShowSummaries}
                  >
                    Show Summaries
                  </button>
                </form>
              </div>

              <div className="navbar-right">
                <select value={selectedCategory} onChange={this.handleCategoryChange}>
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

              {summariesAll.length > 0 ? (
                (() => {
                  const start = (summariesPage - 1) * summariesPageSize;
                  const end = start + summariesPageSize;
                  const pageItems = summariesAll.slice(start, end);
                  return pageItems.map(summary => (
                    <div
                      key={summary._id || summary.jobDetailsLink || summary.title}
                      className="summaries-item"
                    >
                      <h3>
                        <a href={summary.jobDetailsLink} target="_blank" rel="noreferrer">
                          {summary.title}
                        </a>
                      </h3>
                      <p>{summary.description}</p>
                      <p className="date">
                        Date Posted: {new Date(summary.datePosted).toLocaleDateString()}
                      </p>
                    </div>
                  ));
                })()
              ) : (
                <p>No summaries found.</p>
              )}

              {summariesAll.length > 0 && (
                <div className="pagination">
                  {Array.from({ length: summariesTotalPages }, (_, i) => (
                    <button
                      type="button"
                      key={`summaries-${i}`}
                      onClick={() => this.setSummariesPage(i + 1)}
                      disabled={summariesPage === i + 1}
                      className={this.props.darkMode ? 'bg-space-cadet text-light border-0' : ''}
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
    }

    return (
      <div className={`job-landing ${this.props.darkMode ? 'dark-mode' : ''}`}>
        <div className="header">
          <a
            href="https://www.onecommunityglobal.org/collaboration/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={OneCommunityImage} alt="One Community Logo" />
          </a>
        </div>

        <div className={`collab-container ${this.props.darkMode ? 'text-light' : ''}`}>
          <nav className="navbar">
            <div className="navbar-left">
              <form className="search-form" onSubmit={this.handleSubmit}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={this.handleSearch}
                />
                <button className="search-button" type="submit">
                  Go
                </button>
                <button className="reset-button" type="button" onClick={this.handleResetFilters}>
                  Reset
                </button>
                <button className="show-summaries" type="button" onClick={this.handleShowSummaries}>
                  Show Summaries
                </button>
              </form>
            </div>

            <div className="navbar-right">
              <select value={selectedCategory} onChange={this.handleCategoryChange}>
                <option value="">Select from Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </nav>

          <div className="headings">
            <h1>Like to Work With Us? Apply Now!</h1>
            <p>Learn about who we are and who we want to work with!</p>
          </div>

          <div className="job-list">
            {jobAds.length > 0 ? (
              jobAds.map(ad => (
                <div key={ad._id} className="job-ad">
                  <img src={ad.imageUrl} alt={`${ad.title}`} />
                  <a
                    href={`https://www.onecommunityglobal.org/collaboration/seeking-${ad.category.toLowerCase()}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <h3>
                      {ad.title} - {ad.category}
                    </h3>
                  </a>
                </div>
              ))
            ) : (
              <p className="no-jobads">No matching jobs found.</p>
            )}
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => this.setPage(i + 1)}
                disabled={currentPage === i + 1}
                className={this.props.darkMode ? 'bg-space-cadet text-light border-0' : ''}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(Collaboration);
