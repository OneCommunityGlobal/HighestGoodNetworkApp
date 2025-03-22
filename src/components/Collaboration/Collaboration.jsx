import { Component } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from 'utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

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
      summaries: null, // Add this line
    };
  }

  componentDidMount() {
    this.fetchJobAds();
    this.fetchCategories();
  }

  fetchJobAds = async () => {
    const { searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = 18;

    try {
      const response = await fetch(
        `${ApiEndpoint}/jobs?page=${currentPage}&limit=${adsPerPage}&search=${searchTerm}&category=${selectedCategory}`,
        {
          method: 'GET',
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const data = await response.json();
      this.setState({
        jobAds: data.jobs,
        totalPages: data.pagination.totalPages, // Update total pages from the backend
      });
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  fetchCategories = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/categories`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      const sortedCategories = data.categories.sort((a, b) => a.localeCompare(b));
      this.setState({ categories: sortedCategories });
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

  handleSearch = event => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ summaries: null, currentPage: 1 }, this.fetchJobAds);
  };

  handleCategoryChange = event => {
    const selectedValue = event.target.value;
    this.setState(
      { selectedCategory: selectedValue === '' ? '' : selectedValue, currentPage: 1 },
      this.fetchJobAds,
    );
  };

  handleResetFilters = async () => {
    try {
      const response = await fetch(`${ApiEndpoint}/jobs/reset-filters`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to reset filters: ${response.statusText}`);
      }

      const data = await response.json();
      this.setState({
        searchTerm: '',
        selectedCategory: '',
        currentPage: 1,
        jobAds: data.jobs,
        totalPages: data.pagination.totalPages,
        summaries: null,
      });
    } catch (error) {
      toast.error('Error resetting filters');
    }
  };

  setPage = pageNumber => {
    this.setState({ currentPage: pageNumber }, this.fetchJobAds);
  };

  handleShowSummaries = async () => {
    const { searchTerm, selectedCategory } = this.state;
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
      this.setState({ summaries: data }); // Update state with summaries
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };

  render() {
    const {
      searchTerm,
      selectedCategory,
      currentPage,
      jobAds,
      totalPages,
      categories,
      summaries, // Add this line
    } = this.state;

    if (summaries) {
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
          <div className="container">
            <nav className="navbar">
              <div className="navbar-left">
                <form className="search-form">
                  <input
                    type="text"
                    placeholder="Search ..."
                    value={searchTerm}
                    onChange={this.handleSearch}
                  />
                  <button className="search-button" type="submit" onClick={this.handleSubmit}>
                    Go
                  </button>
                  <button type="button" onClick={this.handleResetFilters}>
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
                <select
                  value={selectedCategory}
                  onChange={event => this.handleCategoryChange(event)}
                >
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
        <div className="container">
          <nav className="navbar">
            <div className="navbar-left">
              <form className="search-form">
                <input
                  type="text"
                  placeholder="Search ..."
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
              <select value={selectedCategory} onChange={event => this.handleCategoryChange(event)}>
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
            {jobAds.map(ad => (
              <div key={ad._id} className="job-ad">
                <img src={ad.imageUrl} alt={`${ad.title}`} />
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

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                type="button"
                key={i}
                onClick={() => this.setPage(i + 1)}
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
}

export default Collaboration;
