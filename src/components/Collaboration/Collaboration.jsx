import { Component } from 'react';
import './Collaboration.css';
import { toast } from 'react-toastify';
import { ApiEndpoint } from 'utils/URL';
import OneCommunityImage from './One-Community-Horizontal-Homepage-Header-980x140px-2.png';

import 'leaflet/dist/leaflet.css';

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
      summariesCurrentPage: 1,
      summariesTotalPages: 0,
      hasSearched: false,
      lastJobAdsPage: 1,
      allJobAds: [], // Store all jobs for frontend filtering
    };
  }

  componentDidMount() {
    this.fetchJobAds();
    this.fetchCategories();
  }

  // Helper function to sort jobs alphabetically by title
  sortJobsAlphabetically = jobs => {
    return jobs.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  };

  // Frontend search filter function
  filterJobs = (jobs, searchTerm, selectedCategory) => {
    let filtered = jobs;

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        job => job.category && job.category.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Filter by search term if provided
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => {
        const titleMatch = job.title && job.title.toLowerCase().includes(searchLower);
        const descriptionMatch =
          job.description && job.description.toLowerCase().includes(searchLower);
        return titleMatch || descriptionMatch;
      });
    }

    return filtered;
  };

  // Paginate filtered results
  paginateResults = (items, page, itemsPerPage = 18) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return {
      items: paginatedItems,
      totalPages,
    };
  };

  fetchJobAds = async () => {
    const { searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = 18;

    try {
      // Fetch all jobs without pagination for frontend filtering
      const response = await fetch(
        `${ApiEndpoint}/jobs?limit=1000&search=&searchBoth=true&category=`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      const data = await response.json();

      // Sort all jobs alphabetically
      const sortedJobs = this.sortJobsAlphabetically(data.jobs);

      // Filter jobs based on search term and category
      const filteredJobs = this.filterJobs(sortedJobs, searchTerm, selectedCategory);

      // Paginate the filtered results
      const paginatedResults = this.paginateResults(filteredJobs, currentPage, adsPerPage);

      this.setState({
        allJobAds: sortedJobs,
        jobAds: paginatedResults.items,
        totalPages: paginatedResults.totalPages,
        hasSearched: true,
        lastJobAdsPage: currentPage,
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
    // Reset to page 1 and re-filter results
    this.setState(
      {
        summaries: null,
        currentPage: 1,
        summariesCurrentPage: 1,
        lastJobAdsPage: 1, // Reset lastJobAdsPage when searching
      },
      () => {
        this.updateFilteredResults();
      },
    );
  };

  handleCategoryChange = event => {
    const selectedValue = event.target.value;
    this.setState(
      {
        selectedCategory: selectedValue === '' ? '' : selectedValue,
        currentPage: 1,
        summariesCurrentPage: 1,
        lastJobAdsPage: 1, // Reset lastJobAdsPage when filtering
      },
      () => {
        this.updateFilteredResults();
      },
    );
  };

  // Update filtered results without refetching from API
  updateFilteredResults = () => {
    const { allJobAds, searchTerm, selectedCategory, currentPage } = this.state;
    const adsPerPage = 18;

    // Filter jobs based on current search term and category
    const filteredJobs = this.filterJobs(allJobAds, searchTerm, selectedCategory);

    // Paginate the filtered results
    const paginatedResults = this.paginateResults(filteredJobs, currentPage, adsPerPage);

    this.setState({
      jobAds: paginatedResults.items,
      totalPages: paginatedResults.totalPages,
      hasSearched: true,
      lastJobAdsPage: currentPage, // Update lastJobAdsPage here too
    });
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

      // Sort the reset data alphabetically by title
      const sortedJobs = this.sortJobsAlphabetically(data.jobs);
      const paginatedResults = this.paginateResults(sortedJobs, 1, 18);

      this.setState({
        searchTerm: '',
        selectedCategory: '',
        currentPage: 1,
        allJobAds: sortedJobs,
        jobAds: paginatedResults.items,
        totalPages: paginatedResults.totalPages,
        summaries: null,
        hasSearched: false,
        lastJobAdsPage: 1,
        summariesCurrentPage: 1,
      });
    } catch (error) {
      toast.error('Error resetting filters');
    }
  };

  setPage = pageNumber => {
    this.setState(
      {
        currentPage: pageNumber,
        lastJobAdsPage: pageNumber, // Update lastJobAdsPage when user changes pages
      },
      () => {
        this.updateFilteredResults();
      },
    );
  };

  setSummaryPage = pageNumber => {
    this.setState({ summariesCurrentPage: pageNumber }, this.fetchSummaries);
  };

  fetchSummaries = async () => {
    const { searchTerm, selectedCategory, summariesCurrentPage } = this.state;
    const summariesPerPage = 18;

    try {
      // Fetch all summaries without pagination for frontend filtering
      const response = await fetch(
        `${ApiEndpoint}/jobs/summaries?limit=1000&search=&searchBoth=true&category=`,
        {
          method: 'GET',
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.statusText}`);
      }
      const data = await response.json();

      // Sort all summaries alphabetically
      let sortedSummaries = [];
      if (data.jobs && data.jobs.length > 0) {
        sortedSummaries = this.sortJobsAlphabetically(data.jobs);
      }

      // Filter summaries based on search term and category
      const filteredSummaries = this.filterJobs(sortedSummaries, searchTerm, selectedCategory);

      // Paginate the filtered results
      const paginatedResults = this.paginateResults(
        filteredSummaries,
        summariesCurrentPage,
        summariesPerPage,
      );

      this.setState({
        summaries: {
          jobs: paginatedResults.items,
          pagination: { totalPages: paginatedResults.totalPages },
        },
        summariesTotalPages: paginatedResults.totalPages,
      });
    } catch (error) {
      toast.error('Error fetching summaries');
    }
  };

  handleShowSummaries = async () => {
    const { currentPage } = this.state; // Use currentPage instead of lastJobAdsPage
    // Set summaries page to the same page user was on in job ads
    this.setState({ summariesCurrentPage: currentPage }, this.fetchSummaries);
  };

  handleBackToJobAds = () => {
    const { lastJobAdsPage } = this.state;
    // Return to job ads view and restore the last page
    this.setState({
      summaries: null,
      currentPage: lastJobAdsPage,
    });
  };

  render() {
    const {
      searchTerm,
      selectedCategory,
      currentPage,
      jobAds,
      totalPages,
      categories,
      summaries,
      summariesCurrentPage,
      summariesTotalPages,
      hasSearched,
    } = this.state;

    const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== '';
    const showNoResults = hasSearched && jobAds.length === 0 && hasActiveFilters;

    // Single search form that searches both title and description
    const searchForm = (
      <form className="search-form" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={this.handleSearch}
        />
        <button className="search-button" type="submit">
          Go
        </button>
        <button type="button" onClick={this.handleResetFilters}>
          Reset
        </button>
        {!summaries ? (
          <button className="show-summaries" type="button" onClick={this.handleShowSummaries}>
            Show Summaries
          </button>
        ) : (
          <button className="back-to-jobs" type="button" onClick={this.handleBackToJobAds}>
            Back to Job Ads
          </button>
        )}
      </form>
    );

    if (summaries) {
      return (
        <div className="job-landing">
          <div className="header">
            <div className="logo-container">
              <img src={OneCommunityImage} alt="One Community Logo" className="responsive-img" />
              <a
                href="https://www.onecommunityglobal.org/collaboration/"
                target="_blank"
                rel="noreferrer"
                className="volunteer-button"
              >
                Volunteer Interest Form
              </a>
            </div>
          </div>
          <div className="collaboration-container">
            <nav className="collaboration-navbar">
              <div className="navbar-left">{searchForm}</div>
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
            <div className="headings">
              <h1>Job Summaries</h1>
              <p>Browse through our available positions</p>
            </div>
            {summaries && summaries.jobs && summaries.jobs.length > 0 ? (
              <div className="job-list">
                {summaries.jobs.map(summary => (
                  <div key={summary._id} className="job-ad">
                    <div className="job-content">
                      <h3>
                        <a href={summary.jobDetailsLink}>{summary.title}</a>
                      </h3>
                      <p className="job-description">{summary.description}</p>
                      <p className="job-date">
                        Date Posted: {new Date(summary.datePosted).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No summaries found.</p>
            )}
            <div className="pagination">
              {Array.from({ length: summariesTotalPages }, (_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => this.setSummaryPage(i + 1)}
                  disabled={summariesCurrentPage === i + 1}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="job-landing">
        <div className="header">
          <div className="logo-container">
            <img src={OneCommunityImage} alt="One Community Logo" className="responsive-img" />
            <a
              href="https://www.onecommunityglobal.org/collaboration/"
              target="_blank"
              rel="noreferrer"
              className="volunteer-button"
            >
              Volunteer Interest Form
            </a>
          </div>
        </div>
        <div className="collaboration-container">
          <nav className="collaboration-navbar">
            <div className="navbar-left">{searchForm}</div>
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
          {showNoResults ? (
            <div className="no-results">No results matched your search</div>
          ) : (
            <div className="job-list">
              {jobAds.map(ad => (
                <div key={ad._id} className="job-ad">
                  <img
                    src={`/api/placeholder/640/480?text=${encodeURIComponent(
                      ad.category || 'Job Opening',
                    )}`}
                    alt={ad.title || 'Job Position'}
                    loading="lazy"
                  />
                  <div className="job-content">
                    <a
                      href={`https://www.onecommunityglobal.org/collaboration/seeking-${ad.category.toLowerCase()}`}
                    >
                      <h3>
                        {ad.title} - {ad.category}
                      </h3>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
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
